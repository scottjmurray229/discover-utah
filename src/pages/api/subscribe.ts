export const prerender = false;

import type { APIContext } from 'astro';
import { hasMxRecords, signEmailCookie } from '../../lib/email-cookie';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GUIDE_NAMES: Record<string, string> = {
  'destination-salt-lake-city': 'Salt Lake City Travel Guide',
  'destination-park-city': 'Park City Travel Guide',
  'destination-provo': 'Provo Travel Guide',
  'destination-ogden': 'Ogden Travel Guide',
  'destination-moab': 'Moab Travel Guide',
  'destination-zion': 'Zion Travel Guide',
  'destination-bryce-canyon': 'Bryce Canyon Travel Guide',
  'destination-arches': 'Arches Travel Guide',
  'destination-canyonlands': 'Canyonlands Travel Guide',
  'destination-capitol-reef': 'Capitol Reef Travel Guide',
  'destination-sundance': 'Sundance Travel Guide',
  'destination-bear-lake': 'Bear Lake Travel Guide',
  'destination-antelope-island': 'Antelope Island Travel Guide',
  'destination-snowbird': 'Snowbird Travel Guide',
  'destination-alta': 'Alta Travel Guide',
  'destination-dead-horse-point': 'Dead Horse Point Travel Guide',
  'destination-goblin-valley': 'Goblin Valley Travel Guide',
  'destination-great-salt-lake': 'Great Salt Lake Travel Guide',
  'destination-monument-valley': 'Monument Valley Travel Guide',
  'destination-st-george': 'St. George Travel Guide',
};

function getGuideName(tag: string): string {
  return GUIDE_NAMES[tag] || tag.replace(/^destination-/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Travel Guide';
}

function buildWelcomeEmail(guideName: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#1E3A5F,#E94560);padding:32px 28px;text-align:center;">
        <h1 style="color:white;font-size:24px;margin:0 0 8px;">Discover Utah</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Your ${guideName} is on the way</p>
      </div>
      <div style="padding:28px;">
        <p style="color:#1A2332;font-size:16px;line-height:1.65;margin:0 0 16px;">
          Thank you! You're now part of the Discover Utah community.
        </p>
        <p style="color:#4A5568;font-size:15px;line-height:1.65;margin:0 0 16px;">
          We're putting together your <strong>${guideName}</strong> with real prices, tested itineraries, and practical tips. We'll send it to you as soon as it's ready.
        </p>
        <p style="color:#4A5568;font-size:15px;line-height:1.65;margin:0 0 24px;">
          In the meantime, start exploring:
        </p>
        <h3 style="margin-top:24px;margin-bottom:8px;font-size:16px;">&#127968; Where to Stay</h3>
        <p style="color:#4a4a5e;margin-bottom:12px;font-size:15px;">
          I use Hotels.com for Utah &#8212; earn a free night after every 10 stays.
          The rewards add up fast if you travel even a couple times a year.
        </p>
        <div style="text-align:center;margin-bottom:20px;">
          <a href="https://hotels.com/affiliate?camref=1101l5Eohj&creativeref=1011l66481&adref=welcome-email"
             style="display:inline-block;padding:10px 24px;background:#d32f2f;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;"
             target="_blank" rel="noopener sponsored">
            Browse Utah Hotels &rarr;
          </a>
        </div>

        <div style="text-align:center;margin-bottom:24px;">
          <a href="https://discoverutah.info/destinations/" style="display:inline-block;background:#1E3A5F;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Browse All Destinations</a>
        </div>
        <p style="color:#94A3B8;font-size:13px;line-height:1.5;margin:0;text-align:center;">
          Real travel guides from real trips — Scott
        </p>
      </div>
    </div>
    <p style="color:#94A3B8;font-size:11px;text-align:center;margin:20px 0 0;line-height:1.5;">
      You're receiving this because you signed up at discoverutah.info.<br>
      <a href="https://discoverutah.info/legal/privacy/" style="color:#94A3B8;">Privacy Policy</a>
    </p>
  </div>
</body>
</html>`;
}

async function sendWelcomeEmail(apiKey: string, to: string, guideName: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Discover Utah <hello@discovermore.travel>',
      to: [to],
      reply_to: 'info@discovermore.travel',
      subject: `Your ${guideName} — Welcome to Discover Utah`,
      html: buildWelcomeEmail(guideName),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[Resend Error]', res.status, text);
  }
}

export async function POST(context: APIContext): Promise<Response> {
  const { locals, request } = context;
  const env = (locals as any).runtime?.env;

  let body: { email?: string; destinations?: string[]; guideTag?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ success: false, error: 'Please enter a valid email address.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify domain has MX records (rejects fake domains, fails open on timeout)
  const domain = email.split('@')[1];
  if (domain && !(await hasMxRecords(domain))) {
    return new Response(JSON.stringify({ success: false, error: 'Please use a valid email address.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const destinations = body.destinations?.join(',') || '';
  const guideTag = body.guideTag || '';
  const guideName = getGuideName(guideTag);

  // Local dev mode — no D1 database, just log and succeed
  if (!env?.DB) {
    console.log('[Subscribe - Dev Mode]', { email, destinations, guideTag, timestamp: new Date().toISOString() });
    const cookieSecret = env?.COOKIE_SECRET;
    const setCookie = cookieSecret
      ? await signEmailCookie(cookieSecret)
      : 'dj_email=1; Path=/; Max-Age=2592000; SameSite=Lax';
    return new Response(JSON.stringify({ success: true, dev: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': setCookie,
      },
    });
  }

  // Store in D1
  let isNew = true;
  try {
    const result = await env.DB.prepare(
      `INSERT OR IGNORE INTO email_subscribers (email, destinations_interested, guide_tag) VALUES (?, ?, ?)`
    ).bind(email, destinations, guideTag).run();
    isNew = (result?.meta?.changes ?? 1) > 0;
  } catch {
    // Duplicate is fine
    isNew = false;
  }

  // Send welcome email via Resend (only for new subscribers)
  const resendKey = env.RESEND_API_KEY;
  if (resendKey && isNew) {
    try {
      await sendWelcomeEmail(resendKey, email, guideName);
    } catch (err) {
      console.error('[Resend Send Error]', err);
    }
  }

  const setCookie = env.COOKIE_SECRET
    ? await signEmailCookie(env.COOKIE_SECRET)
    : 'dj_email=1; Path=/; Max-Age=2592000; SameSite=Lax';

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': setCookie,
    },
  });
}
