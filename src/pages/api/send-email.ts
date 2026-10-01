import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

// Mirrors the client-side maxlength, plus sane caps on the short fields. The client
// can be bypassed entirely, so these are the limits that actually count.
const LIMITS = { name: 100, email: 254, subject: 200, message: 2000 } as const;

// Best-effort throttle: 3 sends per IP per 10 minutes. This runs in-memory, so on
// serverless it is per-instance and resets on cold start — enough to stop casual
// abuse and runaway retries, not a hard guarantee. Move to a shared store (Upstash,
// Vercel KV) if this ever needs to be strict.
const RATE_LIMIT = { max: 3, windowMs: 10 * 60 * 1000 } as const;
const hits = new Map<string, number[]>();

// Submitted values are interpolated into the notification email's HTML, so they must
// be escaped — otherwise anything sent through the form lands as live markup in the
// inbox. Covers the attribute-breaking characters too, since two values sit in hrefs.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
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

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Check if request has a body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields. The typeof check also rejects non-string JSON
    // (arrays, objects, numbers) that would otherwise reach the template.
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof subject !== 'string' ||
      typeof message !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Enforce length caps server-side
    for (const [field, max] of Object.entries(LIMITS)) {
      if ((body[field] as string).length > max) {
        return new Response(
          JSON.stringify({ error: `The ${field} field is too long (max ${max} characters).` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Throttle only well-formed requests, so malformed retries can't exhaust the quota
    const ip = clientAddress ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({
          error: "That's a few messages in quick succession — please try again shortly, or email me directly at contact@hssan.dev.",
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(RATE_LIMIT.windowMs / 1000),
          },
        }
      );
    }

    // Constructed per-request: the Resend client throws on a missing key, and at
    // module scope that would take down the whole route before any check above runs.
    const apiKey = import.meta.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set — cannot send contact email.');
      return new Response(
        JSON.stringify({
          error: 'Email is not configured right now. Please email me directly at contact@hssan.dev.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const resend = new Resend(apiKey);

    const safe = {
      name: escapeHtml(name.trim()),
      email: escapeHtml(email.trim()),
      subject: escapeHtml(subject.trim()),
      message: escapeHtml(message.trim()),
    };

    // Send email using Resend
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Change this to your verified domain
      to: import.meta.env.CONTACT_EMAIL || 'contact@hssan.dev', // Your email
      replyTo: email,
      subject: `Portfolio Contact: ${safe.subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                        New Message Received
                      </h1>
                      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 14px;">
                        Someone reached out via your portfolio
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">

                      <!-- Sender Info Card -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                        <tr>
                          <td style="padding: 20px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="display: inline-block; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">From</span>
                                  <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;">
                                    ${safe.name}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="display: inline-block; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                                  <p style="margin: 5px 0 0 0;">
                                    <a href="mailto:${safe.email}" style="color: #2563eb; text-decoration: none; font-size: 15px;">
                                      ${safe.email}
                                    </a>
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="display: inline-block; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Subject</span>
                                  <p style="margin: 5px 0 0 0; color: #111827; font-size: 15px;">
                                    ${safe.subject}
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Message Card -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td>
                            <span style="display: inline-block; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Message</span>
                            <div style="margin-top: 12px; padding: 20px; background-color: #f9fafb; border-left: 4px solid #2563eb; border-radius: 6px;">
                              <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
                                ${safe.message}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Reply Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                        <tr>
                          <td align="center">
                            <a href="mailto:${safe.email}" style="display: inline-block; padding: 14px 32px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; transition: background-color 0.2s;">
                              Reply to ${safe.name}
                            </a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                        This message was sent from your portfolio contact form
                      </p>
                      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                        ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
