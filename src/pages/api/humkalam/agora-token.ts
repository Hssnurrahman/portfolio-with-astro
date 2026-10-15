import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import {
  createFirebaseVerifier,
  defaultBuildToken,
  defaultFetchCall,
  handleTokenRequest,
} from '../../../lib/humkalam/agora-token';

export const prerender = false;

// Module scope so the remote JWKS stays cached across warm invocations.
const verifyIdToken = createFirebaseVerifier();

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let ip: string | undefined;
  try {
    ip = clientAddress;
  } catch {
    // clientAddress throws when the adapter can't determine it.
  }
  ip ??= request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  return handleTokenRequest(request, {
    // Runtime reads (astro:env secrets), never inlined at build time.
    appId: getSecret('HUMKALAM_AGORA_APP_ID'),
    certificate: getSecret('HUMKALAM_AGORA_APP_CERTIFICATE'),
    projectId: getSecret('HUMKALAM_FIREBASE_PROJECT_ID'),
    verifyIdToken,
    fetchCall: defaultFetchCall,
    buildToken: defaultBuildToken,
    clientIp: ip,
  });
};
