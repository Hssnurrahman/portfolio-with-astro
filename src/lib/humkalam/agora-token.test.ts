import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
  type CryptoKey,
  type JWK,
} from 'jose';
import {
  createFirebaseVerifier,
  defaultBuildToken,
  defaultFetchCall,
  handleTokenRequest,
  resetRateLimit,
  type TokenDeps,
} from './agora-token';

// AccessToken2 is not re-exported from the package index and ships no types, so it is
// loaded through require and typed locally. Used only to decode tokens in tests.
// The parser's getString() yields Buffers, so string fields are decoded with String().
type ParsedService = { __channel_name: Buffer; __uid: Buffer; __privileges: Record<string, number> };
type ParsedToken = {
  appId: Buffer;
  expire: number;
  services: ParsedService[];
  from_string(token: string): boolean;
  verifySignature(cert: string): boolean;
};
const require = createRequire(import.meta.url);
const { AccessToken2 } = require('agora-token/src/AccessToken2.js') as {
  AccessToken2: new () => ParsedToken;
};

const PROJECT = 'humkalam-test';
const APP_ID = '0123456789abcdef0123456789abcdef';
const CERT = 'fedcba9876543210fedcba9876543210';
const CALL_ID = 'abcDEF123';
const ID_TOKEN = 'header.payload.signature';

function firestoreBody(status: unknown): Response {
  const fields = status === undefined ? {} : { status: { stringValue: status } };
  return new Response(JSON.stringify({ name: 'x', fields }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeDeps(overrides: Partial<TokenDeps> = {}): TokenDeps {
  return {
    appId: APP_ID,
    certificate: CERT,
    projectId: PROJECT,
    verifyIdToken: vi.fn(async () => ({ uid: 'user-1' })),
    fetchCall: vi.fn(async () => firestoreBody('ringing')),
    buildToken: vi.fn(() => '007fake-token'),
    clientIp: '203.0.113.1',
    ...overrides,
  };
}

function makeRequest(
  body: string | object = { callId: CALL_ID },
  opts: { auth?: string | null; contentType?: string } = {},
): Request {
  const headers: Record<string, string> = {
    'Content-Type': opts.contentType ?? 'application/json',
  };
  const auth = opts.auth === undefined ? `Bearer ${ID_TOKEN}` : opts.auth;
  if (auth !== null) headers['Authorization'] = auth;
  return new Request('https://hssan.dev/api/humkalam/agora-token', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function json(res: Response): Promise<Record<string, unknown>> {
  return (await res.json()) as Record<string, unknown>;
}

beforeEach(() => {
  resetRateLimit();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('request validation (400)', () => {
  it('400 when body is not JSON', async () => {
    const deps = makeDeps();
    const res = await handleTokenRequest(makeRequest('not json{'), deps);
    expect(res.status).toBe(400);
    expect(deps.verifyIdToken).not.toHaveBeenCalled();
    expect(deps.fetchCall).not.toHaveBeenCalled();
  });

  it('400 when Content-Type is not JSON', async () => {
    const res = await handleTokenRequest(
      makeRequest({ callId: CALL_ID }, { contentType: 'text/plain' }),
      makeDeps(),
    );
    expect(res.status).toBe(400);
  });

  it('400 when body is JSON but not an object with a string callId', async () => {
    for (const body of ['[]', 'null', '"x"', '{}', '{"callId":123}']) {
      const res = await handleTokenRequest(makeRequest(body), makeDeps());
      expect(res.status, body).toBe(400);
    }
  });

  it('400 when callId is "../x" or 65 chars', async () => {
    for (const callId of ['../x', 'a'.repeat(65), '', 'abc/def', 'abc%2F', 'ab cd']) {
      const deps = makeDeps();
      const res = await handleTokenRequest(makeRequest({ callId }), deps);
      expect(res.status, callId).toBe(400);
      expect(deps.fetchCall).not.toHaveBeenCalled();
    }
  });

  it('accepts a 64-char callId', async () => {
    const res = await handleTokenRequest(makeRequest({ callId: 'a'.repeat(64) }), makeDeps());
    expect(res.status).toBe(200);
  });
});

describe('authentication (401)', () => {
  it('401 when Authorization header is missing', async () => {
    const deps = makeDeps();
    const res = await handleTokenRequest(makeRequest(undefined, { auth: null }), deps);
    expect(res.status).toBe(401);
    expect(deps.verifyIdToken).not.toHaveBeenCalled();
    expect(deps.fetchCall).not.toHaveBeenCalled();
  });

  it('401 when Authorization is not a Bearer token', async () => {
    for (const auth of ['Basic abc', 'Bearer', 'Bearer ', ID_TOKEN]) {
      const deps = makeDeps();
      const res = await handleTokenRequest(makeRequest(undefined, { auth }), deps);
      expect(res.status, auth).toBe(401);
      expect(deps.fetchCall).not.toHaveBeenCalled();
    }
  });

  it('when the verifier rejects, fetchCall is never called (Review Focus 2)', async () => {
    const deps = makeDeps({
      verifyIdToken: vi.fn(async () => {
        throw new Error('bad token');
      }),
    });
    const res = await handleTokenRequest(makeRequest(), deps);
    expect(res.status).toBe(401);
    expect(deps.fetchCall).not.toHaveBeenCalled();
    expect(deps.buildToken).not.toHaveBeenCalled();
  });

  it('passes the bearer token and projectId to the verifier, then the same token to Firestore', async () => {
    const deps = makeDeps();
    await handleTokenRequest(makeRequest(), deps);
    expect(deps.verifyIdToken).toHaveBeenCalledWith(ID_TOKEN, PROJECT);
    expect(deps.fetchCall).toHaveBeenCalledWith(PROJECT, CALL_ID, ID_TOKEN);
  });
});

describe('createFirebaseVerifier (local JWKS)', () => {
  const KID = 'test-kid';
  let privateKey: CryptoKey;
  let otherPrivateKey: CryptoKey;
  let verify: (jwt: string, projectId: string) => Promise<{ uid: string }>;

  beforeEach(async () => {
    const pair = await generateKeyPair('RS256', { extractable: true });
    const other = await generateKeyPair('RS256', { extractable: true });
    privateKey = pair.privateKey;
    otherPrivateKey = other.privateKey;
    const jwk: JWK = { ...(await exportJWK(pair.publicKey)), kid: KID, alg: 'RS256', use: 'sig' };
    verify = createFirebaseVerifier(createLocalJWKSet({ keys: [jwk] }));
  });

  type Claims = {
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number | string;
    email_verified?: unknown;
    key?: CryptoKey;
  };

  async function sign(claims: Claims = {}): Promise<string> {
    const payload: Record<string, unknown> = {};
    payload['email_verified'] = 'email_verified' in claims ? claims.email_verified : true;
    const jwt = new SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256', kid: KID })
      .setAudience(claims.aud ?? PROJECT)
      .setIssuer(claims.iss ?? `https://securetoken.google.com/${PROJECT}`)
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(claims.exp ?? '1h');
    if (claims.sub !== '') jwt.setSubject(claims.sub ?? 'user-1');
    return jwt.sign(claims.key ?? privateKey);
  }

  it('accepts a valid token and returns the uid', async () => {
    await expect(verify(await sign(), PROJECT)).resolves.toEqual({ uid: 'user-1' });
  });

  it('throws on a bad signature', async () => {
    await expect(verify(await sign({ key: otherPrivateKey }), PROJECT)).rejects.toThrow();
  });

  it('throws when exp is in the past', async () => {
    const past = Math.floor(Date.now() / 1000) - 60;
    await expect(verify(await sign({ exp: past }), PROJECT)).rejects.toThrow();
  });

  it('throws on a wrong aud', async () => {
    await expect(verify(await sign({ aud: 'other-project' }), PROJECT)).rejects.toThrow();
  });

  it('throws on a wrong iss', async () => {
    await expect(
      verify(await sign({ iss: 'https://securetoken.google.com/other-project' }), PROJECT),
    ).rejects.toThrow();
  });

  it('throws when email_verified is false or missing or not boolean true', async () => {
    await expect(verify(await sign({ email_verified: false }), PROJECT)).rejects.toThrow();
    await expect(verify(await sign({ email_verified: undefined }), PROJECT)).rejects.toThrow();
    await expect(verify(await sign({ email_verified: 'true' }), PROJECT)).rejects.toThrow();
  });

  it('throws when sub is missing', async () => {
    await expect(verify(await sign({ sub: '' }), PROJECT)).rejects.toThrow();
  });

  it('throws on an unsigned (alg none) or garbage token', async () => {
    const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const unsigned = `${enc({ alg: 'none' })}.${enc({
      aud: PROJECT,
      iss: `https://securetoken.google.com/${PROJECT}`,
      sub: 'user-1',
      exp: now + 3600,
      iat: now,
      email_verified: true,
    })}.`;
    await expect(verify(unsigned, PROJECT)).rejects.toThrow();
    await expect(verify('garbage', PROJECT)).rejects.toThrow();
  });

  it('end to end: an invalid token gives 401 and never reaches Firestore', async () => {
    const deps = makeDeps({ verifyIdToken: verify });
    const bad = await sign({ aud: 'other-project' });
    const res = await handleTokenRequest(makeRequest(undefined, { auth: `Bearer ${bad}` }), deps);
    expect(res.status).toBe(401);
    expect(deps.fetchCall).not.toHaveBeenCalled();
  });

  it('end to end: a valid token gives 200', async () => {
    const deps = makeDeps({ verifyIdToken: verify });
    const good = await sign();
    const res = await handleTokenRequest(makeRequest(undefined, { auth: `Bearer ${good}` }), deps);
    expect(res.status).toBe(200);
    expect(deps.fetchCall).toHaveBeenCalledWith(PROJECT, CALL_ID, good);
  });
});

describe('Firestore access mapping', () => {
  const cases: Array<[number, number]> = [
    [403, 403], // Review Focus 3: not caller/callee or not invited
    [401, 403],
    [404, 404],
    [500, 502],
    [429, 502],
  ];
  for (const [firestore, expected] of cases) {
    it(`${expected} when fetchCall returns ${firestore}`, async () => {
      const deps = makeDeps({
        fetchCall: vi.fn(async () => new Response('{}', { status: firestore })),
      });
      const res = await handleTokenRequest(makeRequest(), deps);
      expect(res.status).toBe(expected);
      expect(deps.buildToken).not.toHaveBeenCalled();
    });
  }

  it('502 when fetchCall throws (network error)', async () => {
    const deps = makeDeps({
      fetchCall: vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    });
    expect((await handleTokenRequest(makeRequest(), deps)).status).toBe(502);
  });

  it('502 when Firestore returns 200 with a non-JSON body', async () => {
    const deps = makeDeps({ fetchCall: vi.fn(async () => new Response('<html>', { status: 200 })) });
    expect((await handleTokenRequest(makeRequest(), deps)).status).toBe(502);
  });
});

describe('call status (409)', () => {
  for (const status of ['ended', 'declined', 'missed', '', 'RINGING']) {
    it(`409 when the call status is "${status}"`, async () => {
      const deps = makeDeps({ fetchCall: vi.fn(async () => firestoreBody(status)) });
      const res = await handleTokenRequest(makeRequest(), deps);
      expect(res.status).toBe(409);
      expect(deps.buildToken).not.toHaveBeenCalled();
    });
  }

  it('409 when the status field is missing', async () => {
    const deps = makeDeps({ fetchCall: vi.fn(async () => firestoreBody(undefined)) });
    expect((await handleTokenRequest(makeRequest(), deps)).status).toBe(409);
  });
});

describe('success (200)', () => {
  for (const status of ['ringing', 'accepted']) {
    it(`200 for "${status}"`, async () => {
      const deps = makeDeps({ fetchCall: vi.fn(async () => firestoreBody(status)) });
      const res = await handleTokenRequest(makeRequest(), deps);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('application/json');
      expect(await json(res)).toEqual({ token: '007fake-token', expiresIn: 3600 });
      expect(deps.buildToken).toHaveBeenCalledWith(APP_ID, CERT, CALL_ID, 3600);
    });
  }

  it('sends no CORS headers and is not cacheable', async () => {
    const res = await handleTokenRequest(makeRequest(), makeDeps());
    for (const [name] of res.headers) expect(name.toLowerCase()).not.toMatch(/^access-control-/);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('500 when the token builder returns an empty token (malformed app ID/cert)', async () => {
    const deps = makeDeps({ buildToken: vi.fn(() => '') });
    expect((await handleTokenRequest(makeRequest(), deps)).status).toBe(500);
  });
});

describe('defaultBuildToken', () => {
  it('produces a 007 token that decodes to the app ID, channel and 3600 s expiry', () => {
    const token = defaultBuildToken(APP_ID, CERT, CALL_ID, 3600);
    expect(token.startsWith('007')).toBe(true);

    const parsed = new AccessToken2();
    expect(parsed.from_string(token)).toBe(true);
    expect(String(parsed.appId)).toBe(APP_ID);
    expect(parsed.expire).toBe(3600);
    expect(parsed.verifySignature(CERT)).toBe(true);
    expect(parsed.services).toHaveLength(1);
    const rtc = parsed.services[0]!;
    expect(String(rtc.__channel_name)).toBe(CALL_ID);
    expect(String(rtc.__uid)).toBe(''); // uid 0
    // Join + publish audio/video/data (PUBLISHER), each with a 3600 s privilege.
    expect(rtc.__privileges).toEqual({ 1: 3600, 2: 3600, 3: 3600, 4: 3600 });
  });

  it('throws when the app ID or certificate is malformed', () => {
    expect(() => defaultBuildToken('not-an-id', CERT, CALL_ID, 3600)).toThrow();
  });
});

describe('defaultFetchCall', () => {
  it('GETs the Firestore REST document with the user ID token', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await defaultFetchCall(PROJECT, CALL_ID, ID_TOKEN);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(
      `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/calls/${CALL_ID}`,
    );
    expect(init.method ?? 'GET').toBe('GET');
    expect(new Headers(init.headers).get('authorization')).toBe(`Bearer ${ID_TOKEN}`);
  });
});

describe('configuration (500)', () => {
  for (const key of ['appId', 'certificate', 'projectId'] as const) {
    it(`500 when ${key} is missing`, async () => {
      const deps = makeDeps({ [key]: undefined });
      const res = await handleTokenRequest(makeRequest(), deps);
      expect(res.status).toBe(500);
      expect(deps.verifyIdToken).not.toHaveBeenCalled();
      expect(deps.fetchCall).not.toHaveBeenCalled();
    });
  }

  it('500 when a value is an empty string', async () => {
    const res = await handleTokenRequest(makeRequest(), makeDeps({ certificate: '' }));
    expect(res.status).toBe(500);
  });
});

describe('rate limit (429)', () => {
  it('429 on the 31st request from one IP within 10 minutes', async () => {
    let t = 1_000_000;
    const now = () => t;
    for (let i = 0; i < 30; i++) {
      const res = await handleTokenRequest(makeRequest(), makeDeps({ now }));
      expect(res.status, `request ${i + 1}`).toBe(200);
      t += 1000;
    }
    const deps = makeDeps({ now });
    const res = await handleTokenRequest(makeRequest(), deps);
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(deps.verifyIdToken).not.toHaveBeenCalled();
    expect(deps.fetchCall).not.toHaveBeenCalled();

    // A different IP is unaffected.
    const other = await handleTokenRequest(makeRequest(), makeDeps({ now, clientIp: '198.51.100.7' }));
    expect(other.status).toBe(200);

    // Once the window has passed, the first IP is allowed again.
    t += 10 * 60 * 1000;
    expect((await handleTokenRequest(makeRequest(), makeDeps({ now }))).status).toBe(200);
  });
});

describe('logging hygiene', () => {
  it('never logs the ID token, the certificate or the Agora token', async () => {
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {}),
    );
    const scenarios: Array<Partial<TokenDeps>> = [
      {},
      { verifyIdToken: vi.fn(async () => { throw new Error(`bad ${ID_TOKEN}`); }) },
      { fetchCall: vi.fn(async () => { throw new Error(`net ${ID_TOKEN}`); }) },
      { fetchCall: vi.fn(async () => new Response('{}', { status: 500 })) },
      { buildToken: vi.fn(() => { throw new Error(`cert ${CERT}`); }) },
    ];
    for (const s of scenarios) await handleTokenRequest(makeRequest(), makeDeps(s));
    const logged = spies.flatMap((s) => s.mock.calls).map((c) => JSON.stringify(c)).join('\n');
    expect(logged).not.toContain(ID_TOKEN);
    expect(logged).not.toContain(CERT);
    expect(logged).not.toContain('007fake-token');
  });
});
