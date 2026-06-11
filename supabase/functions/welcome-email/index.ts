import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM = 'KrackIT <onboarding@resend.dev>';

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) throw new Error(await res.text());
}

function welcomeHtml(name: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0f0e0c;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0e0c;padding:40px 16px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1814;border-radius:20px;overflow:hidden;border:1px solid #2a2620;max-width:520px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#c9a227,#a07818);padding:36px 40px;text-align:center;">
          <p style="margin:0;font-size:38px;font-weight:900;color:#1a1410;letter-spacing:-1px;">KrackIt</p>
          <p style="margin:8px 0 0;font-size:12px;color:#1a1410;opacity:0.75;font-weight:700;letter-spacing:3px;text-transform:uppercase;">One trick ahead</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:36px 40px;">
          <p style="margin:0 0 6px;font-size:24px;font-weight:700;color:#f5f0e8;">Hey ${name}! 👋</p>
          <p style="margin:0 0 24px;font-size:15px;color:#a09880;line-height:1.7;">
            Welcome to KrackIT — India's smartest exam prep app. You're now part of a growing community of aspirants cracking competitive exams with powerful mnemonics and memory tricks.
          </p>

          <!-- Steps card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#22201c;border-radius:14px;margin-bottom:28px;">
            <tr><td style="padding:22px 24px;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#c9a227;text-transform:uppercase;letter-spacing:2px;">Get started in 3 steps</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #2a2620;">
                    <p style="margin:0;font-size:14px;color:#f5f0e8;">🎯 <strong>Pick your exam</strong> — UPSC, SSC, NEET, JEE, CAT or Banking</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #2a2620;">
                    <p style="margin:0;font-size:14px;color:#f5f0e8;">⚡ <strong>Learn tricks</strong> — mnemonics that actually stick in memory</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <p style="margin:0;font-size:14px;color:#f5f0e8;">🔥 <strong>Build your streak</strong> — log in daily to keep it alive</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="https://krackit.app"
                style="display:inline-block;background:linear-gradient(135deg,#c9a227,#a07818);color:#1a1410;font-weight:700;font-size:15px;padding:15px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
                Start Learning →
              </a>
            </td></tr>
          </table>
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#2a2620;"></div></td></tr>

      <!-- Footer -->
      <tr>
        <td style="padding:24px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#5a5040;">You received this because you created a KrackIT account.</p>
          <p style="margin:0;font-size:12px;color:#5a5040;">
            © 2026 KrackIT &nbsp;·&nbsp;
            <a href="https://krackit.app/privacy" style="color:#c9a227;text-decoration:none;">Privacy</a>
            &nbsp;·&nbsp;
            <a href="https://krackit.app/terms" style="color:#c9a227;text-decoration:none;">Terms</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

serve(async (req) => {
  try {
    const payload = await req.json();
    const user = payload?.record ?? payload?.user;
    if (!user?.email) return new Response('no email', { status: 200 });

    const name = (
      user.raw_user_meta_data?.full_name ||
      user.raw_user_meta_data?.name ||
      user.email.split('@')[0]
    ) as string;

    await sendEmail(user.email, `Welcome to KrackIT, ${name}! 🎯`, welcomeHtml(name));
    console.log(`Welcome email sent to ${user.email}`);
    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error('welcome-email error:', e);
    return new Response('error', { status: 500 });
  }
});
