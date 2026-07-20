import { Resend } from 'resend';

// Lazily construct the client so the app can boot (and run non-email routes)
// even if the key is absent in some environments; email calls will throw clearly.
let client = null;
const getClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
};

const FROM = () => process.env.EMAIL_FROM || 'WriteBlog <onboarding@resend.dev>';
const clientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const shell = (heading, body, cta, url) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
    <h2 style="margin:0 0 16px">${heading}</h2>
    <p style="line-height:1.6;color:#444">${body}</p>
    <p style="margin:28px 0">
      <a href="${url}" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block">${cta}</a>
    </p>
    <p style="font-size:13px;color:#888;line-height:1.6">
      If the button doesn't work, paste this link into your browser:<br/>
      <a href="${url}" style="color:#2563eb;word-break:break-all">${url}</a>
    </p>
  </div>`;

export const sendVerificationEmail = async (user, rawToken) => {
  const url = `${clientUrl()}/verify-email?token=${rawToken}`;
  await getClient().emails.send({
    from: FROM(),
    to: user.email,
    subject: 'Verify your WriteBlog email',
    html: shell(
      'Confirm your email',
      `Hi ${user.username}, welcome to WriteBlog! Please confirm your email address to activate your account. This link expires in 24 hours.`,
      'Verify email',
      url
    ),
  });
};

export const sendPasswordResetEmail = async (user, rawToken) => {
  const url = `${clientUrl()}/reset-password?token=${rawToken}`;
  await getClient().emails.send({
    from: FROM(),
    to: user.email,
    subject: 'Reset your WriteBlog password',
    html: shell(
      'Reset your password',
      `We received a request to reset your password. Click below to choose a new one. This link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
      'Reset password',
      url
    ),
  });
};
