/**
 * Minimal transactional-email sender for verification codes.
 *
 * Production: set RESEND_API_KEY and MAIL_FROM (e.g. "Quiz-Me! <no-reply@yourdomain.com>").
 *   The sending domain must be verified in your Resend account.
 * Development (NODE_ENV !== 'production') with no provider configured: the code is
 *   printed to the server console instead, so the flow can be tested locally.
 *
 * To use another provider (SendGrid, Brevo, SMTP...), replace sendViaResend().
 */

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class MailNotConfiguredError extends Error {
  constructor() {
    super('Email delivery is not configured on the server.');
    this.name = 'MailNotConfiguredError';
  }
}

export class MailDeliveryError extends Error {
  constructor(message = 'The verification email could not be sent.') {
    super(message);
    this.name = 'MailDeliveryError';
  }
}

export type Mailer = (message: MailMessage) => Promise<void>;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendViaResend(message: MailMessage, apiKey: string, from: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      // Log the provider's reason on the server only; never leak it to the client.
      const detail = await res.text().catch(() => '');
      console.error(`[schools] Resend rejected the email (${res.status}): ${detail.slice(0, 300)}`);
      throw new MailDeliveryError();
    }
  } catch (err) {
    if (err instanceof MailDeliveryError) throw err;
    console.error('[schools] Email request failed:', err instanceof Error ? err.message : err);
    throw new MailDeliveryError();
  } finally {
    clearTimeout(timer);
  }
}

export const defaultMailer: Mailer = async (message) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (apiKey && from) {
    await sendViaResend(message, apiKey, from);
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `\n[schools][DEV ONLY] No email provider configured. Would send to ${message.to}:\n` +
        `  Subject: ${message.subject}\n  ${message.text.replace(/\n/g, '\n  ')}\n`
    );
    return;
  }

  throw new MailNotConfiguredError();
};

export function buildCodeEmail(params: {
  to: string;
  code: string;
  purpose: 'join' | 'register';
  schoolName: string;
  ttlMinutes: number;
}): MailMessage {
  const { to, code, purpose, schoolName, ttlMinutes } = params;
  const safeName = schoolName.replace(/[\r\n]+/g, ' ');
  const action =
    purpose === 'register'
      ? `register ${safeName} on Quiz-Me!`
      : `join ${safeName} on Quiz-Me!`;

  const text =
    `Your Quiz-Me! verification code is ${code}\n\n` +
    `Use it to ${action}\n` +
    `The code expires in ${ttlMinutes} minutes.\n\n` +
    `If you didn't request this, you can ignore this email. Nobody can access your account with this code alone.`;

  const html =
    `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">` +
    `<h2 style="margin:0 0 12px">Verify your school email</h2>` +
    `<p style="margin:0 0 16px">Use this code to ${escapeHtml(action)}</p>` +
    `<p style="font-size:34px;letter-spacing:8px;font-weight:700;margin:0 0 16px">${escapeHtml(code)}</p>` +
    `<p style="margin:0 0 8px;color:#444">The code expires in ${ttlMinutes} minutes.</p>` +
    `<p style="margin:0;color:#666;font-size:13px">If you didn't request this, you can ignore this email.</p>` +
    `</div>`;

  return {
    to,
    subject: `${code} is your Quiz-Me! verification code`,
    text,
    html,
  };
}
