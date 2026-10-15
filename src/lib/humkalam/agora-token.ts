// Agora RTC token endpoint logic for the Humkalam app.
//
// Kept framework-free so it can be tested without Astro or the network: the route in
// src/pages/api/humkalam/agora-token.ts only wires real dependencies into
// handleTokenRequest. The App Certificate lives only in server env vars; nothing here
// ever logs a token (Firebase or Agora) or the certificate.

import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
// agora-token is CommonJS and Node's ESM loader can't see its exports as named imports
// (the built server bundle crashes with "Named export 'RtcRole' not found"), so take
// the default export and destructure.
import agoraToken from 'agora-token';

const { RtcRole, RtcTokenBuilder } = agoraToken;

export const TOKEN_EXPIRE_SECONDS = 3600;
export const FIREBASE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

// Strict allow-list: callId is interpolated into the Firestore URL and becomes the
// Agora channel name, so no path characters, encodings or whitespace get through.
const CALL_ID_RE = /^[A-Za-z0-9]{1,64}$/;
const ACTIVE_STATUSES = new Set(['ringing', 'accepted']);
const MAX_BODY_CHARS = 1024;

export type TokenDeps = {
  appId?: string;
  certificate?: string;
  projectId?: string;
  verifyIdToken: (jwt: string, projectId: string) => Promise<{ uid: string }>;
  fetchCall: (projectId: string, callId: string, idToken: string) => Promise<Response>;
  buildToken: (appId: string, cert: string, channel: string, expireSeconds: number) => string;
  clientIp: string;
  now?: () => number;
};

// Best-effort throttle: 30 requests per IP per 10 minutes, in memory. On serverless this
// is per-instance and resets on cold start — same trade-off as send-email.ts.
const RATE_LIMIT = { max: 30, windowMs: 10 * 60 * 1000 } as const;
const hits = new Map<string, number[]>();

export function resetRateLimit(): void {
  hits.clear();
}

function isRateLimited(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);

  if (recent.length >= RATE_LIMIT.max) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(key);
    }
  }

  return false;
}

function respond(status: number, body: object, extraHeaders: Record<string, string> = {}): Response {
  // Outcome code only — never request data, tokens or the certificate.
  console.info(`[humkalam/agora-token] ${status}`);
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header) return null;
  const match = /^Bearer[ ]+([^\s]+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

async function readCallId(request: Request): Promise<string | null> {
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.toLowerCase().includes('application/json')) return null;

  let text: string;
  try {
    text = await request.text();
  } catch {
    return null;
  }
  if (text.length > MAX_BODY_CHARS) return null;

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;

  const callId = (body as Record<string, unknown>)['callId'];
  return typeof callId === 'string' && CALL_ID_RE.test(callId) ? callId : null;
}

function callStatus(doc: unknown): string | null {
  if (typeof doc !== 'object' || doc === null) return null;
  const fields = (doc as { fields?: unknown }).fields;
  if (typeof fields !== 'object' || fields === null) return null;
  const status = (fields as { status?: unknown }).status;
  if (typeof status !== 'object' || status === null) return null;
  const value = (status as { stringValue?: unknown }).stringValue;
  return typeof value === 'string' ? value : null;
}

export async function handleTokenRequest(request: Request, deps: TokenDeps): Promise<Response> {
  const now = (deps.now ?? Date.now)();

  // Throttle before doing any work (JWT verification, Firestore round trip).
  if (isRateLimited(deps.clientIp, now)) {
    return respond(429, { error: 'Too many requests' }, {
      'Retry-After': String(RATE_LIMIT.windowMs / 1000),
    });
  }

  const { appId, certificate, projectId } = deps;
  if (!appId || !certificate || !projectId) {
    return respond(500, { error: 'Not configured' });
  }

  // 1. Body and callId.
  const callId = await readCallId(request);
  if (!callId) return respond(400, { error: 'Invalid request' });

  // 2. Firebase ID token. Nothing below runs unless this verifies.
  const idToken = bearerToken(request);
  if (!idToken) return respond(401, { error: 'Unauthorized' });
  try {
    await deps.verifyIdToken(idToken, projectId);
  } catch {
    return respond(401, { error: 'Unauthorized' });
  }

  // 3. Read the call as the user. Firestore rules allow it only for the invited
  //    caller or callee, so this is the membership check.
  let doc: unknown;
  try {
    const res = await deps.fetchCall(projectId, callId, idToken);
    if (res.status === 401 || res.status === 403) return respond(403, { error: 'Forbidden' });
    if (res.status === 404) return respond(404, { error: 'Call not found' });
    if (!res.ok) return respond(502, { error: 'Upstream error' });
    doc = await res.json();
  } catch {
    return respond(502, { error: 'Upstream error' });
  }

  // 4. Only live calls get a token.
  const status = callStatus(doc);
  if (!status || !ACTIVE_STATUSES.has(status)) return respond(409, { error: 'Call is not active' });

  // 5. Build the Agora token.
  let token: string;
  try {
    token = deps.buildToken(appId, certificate, callId, TOKEN_EXPIRE_SECONDS);
  } catch {
    return respond(500, { error: 'Token build failed' });
  }
  if (!token) return respond(500, { error: 'Token build failed' });

  return respond(200, { token, expiresIn: TOKEN_EXPIRE_SECONDS });
}

/**
 * Verifies a Firebase Auth ID token: RS256 against Google's securetoken JWKS,
 * aud == projectId, iss == https://securetoken.google.com/<projectId>, not expired,
 * non-empty sub, email_verified === true. Throws on any failure.
 *
 * `jwks` is the JWKS URL (default: Google's) or, for tests, a jose key getter such as
 * createLocalJWKSet(...). Create once per process so the remote key set stays cached.
 */
export function createFirebaseVerifier(jwks: string | JWTVerifyGetKey = FIREBASE_JWKS_URL) {
  const getKey: JWTVerifyGetKey = typeof jwks === 'string' ? createRemoteJWKSet(new URL(jwks)) : jwks;

  return async function verifyIdToken(jwt: string, projectId: string): Promise<{ uid: string }> {
    if (!projectId) throw new Error('projectId required');

    const { payload } = await jwtVerify(jwt, getKey, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
      requiredClaims: ['exp', 'iat', 'sub'],
    });

    const sub = payload.sub;
    if (typeof sub !== 'string' || sub.length === 0 || sub.length > 128) {
      throw new Error('invalid sub');
    }
    if (payload['email_verified'] !== true) throw new Error('email not verified');

    return { uid: sub };
  };
}

/** Reads calls/<callId> through the Firestore REST API as the signed-in user. */
export const defaultFetchCall = (projectId: string, callId: string, idToken: string): Promise<Response> => {
  if (!CALL_ID_RE.test(callId)) return Promise.reject(new Error('invalid callId'));
  const url =
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}` +
    `/databases/(default)/documents/calls/${encodeURIComponent(callId)}`;
  return fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${idToken}` },
    signal: AbortSignal.timeout(8000),
  });
};

/** uid 0 (any user), PUBLISHER, token and privileges both valid for expireSeconds. */
export const defaultBuildToken = (
  appId: string,
  cert: string,
  channel: string,
  expireSeconds: number,
): string => {
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    cert,
    channel,
    0,
    RtcRole.PUBLISHER,
    expireSeconds,
    expireSeconds,
  );
  // The builder returns '' instead of throwing when the app ID or certificate is malformed.
  if (!token) throw new Error('Agora token build failed');
  return token;
};
