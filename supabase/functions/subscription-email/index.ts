import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY    = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FROM              = 'KrackIT <onboarding@resend.dev>';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

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

function baseLayout(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0f0e0c;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0e0c;padding:40px 16px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1814;border-radius:20px;overflow:hidden;border:1px solid #2a2620;max-width:520px;width:100%;">
      <tr>
        <td style="background:linear-gradient(135deg,#c9a227,#a07818);padding:28px 40px;text-align:center;">
          <p style="margin:0;font-size:32px;font-weight:900;color:#1a1410;letter-spacing:-1px;">KrackIt</p>
          <p style="margin:6px 0 0;font-size:11px;color:#1a1410;opacity:0.75;font-weight:700;letter-spacing:3px;text-transform:uppercase;">One trick ahead</p>
        </td>
      </tr>
      <tr><td style="padding:36px 40px;">${content}</td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#2a2620;"></div></td></tr>
      <tr>
        <td style="padding:24px 40px;text-align:center;">
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

function activatedHtml(name: string, plan: string, examName: string, expiresAt: string) {
  const expiry = new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return baseLayout(`
    <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#f5f0e8;">Subscription Activated! 🎉</p>
    <p style="margin:0 0 24px;font-size:15px;color:#a09880;line-height:1.7;">
      Hey ${name}, your <strong style="color:#c9a227;">${plan}</strong> subscription for <strong style="color:#f5f0e8;">${examName}</strong> is now active. Time to crack it!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#22201c;border-radius:14px;margin-bottom:28px;">
      <tr><td style="padding:22px 24px;">
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#c9a227;text-transform:uppercase;letter-spacing:2px;">Subscription Details</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:7px 0;border-bottom:1px solid #2a2620;font-size:13px;color:#a09880;">Plan</td>
            <td style="padding:7px 0;border-bottom:1px solid #2a2620;font-size:13px;color:#f5f0e8;text-align:right;font-weight:600;">${plan}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;border-bottom:1px solid #2a2620;font-size:13px;color:#a09880;">Exam</td>
            <td style="padding:7px 0;border-bottom:1px solid #2a2620;font-size:13px;color:#f5f0e8;text-align:right;font-weight:600;">${examName}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;font-size:13px;color:#a09880;">Valid Until</td>
            <td style="padding:7px 0;font-size:13px;color:#c9a227;text-align:right;font-weight:700;">${expiry}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="https://krackit.app" style="display:inline-block;background:linear-gradient(135deg,#c9a227,#a07818);color:#1a1410;font-weight:700;font-size:15px;padding:15px 40px;border-radius:12px;text-decoration:none;">
          Start Studying →
        </a>
      </td></tr>
    </table>
  `);
}

serve(async (req) => {
  try {
    const payload = await req.json();
    const sub = payload?.record;
    if (!sub) return new Response('no record', { status: 200 });

    // Get user email from auth.users
    const { data: authUser } = await supabase.auth.admin.getUserById(sub.user_id);
    const email = authUser?.user?.email;
    if (!email) return new Response('no email', { status: 200 });

    // Get user name from user_profiles
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', sub.user_id)
      .single();
    const name = profile?.name || email.split('@')[0];

    // Get exam name
    const { data: exam } = await supabase
      .from('exams')
      .select('name')
      .eq('id', sub.exam_id)
      .single();
    const examName = exam?.name || sub.exam_id || 'All Exams';

    const planLabel = sub.plan_type === 'gold_learner' ? 'Gold Learner' : 'Pro';

    await sendEmail(
      email,
      `Your ${planLabel} subscription is active! 🎯`,
      activatedHtml(name, planLabel, examName, sub.expires_at)
    );

    console.log(`Subscription email sent to ${email}`);
    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error('subscription-email error:', e);
    return new Response('error', { status: 500 });
  }
});
