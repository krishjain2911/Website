import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import { getDb } from '../../lib/admin/db';

export const prerender = false;

const EVENT_NAME_REGEX = /^[a-z0-9_]{1,40}$/;
const MAX_PROPS = 10;
const MAX_STRING_LENGTH = 80;
const MAX_BODY_BYTES = 1024; // 1 KB
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 120; // 2 requests per second per IP

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

function getDailyVisitorHash(clientIp: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const salt = process.env.SALT_SECRET || 'rhsp-analytics-salt-2026';
  return crypto
    .createHash('sha256')
    .update(`${clientIp}-${today}-${salt}`)
    .digest('hex')
    .slice(0, 32);
}

function getCoarseBrowser(ua: string): string {
  if (!ua) return 'Other';
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome|crios/i.test(ua)) return 'Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  return 'Other';
}

export const POST: APIRoute = async ({ request }) => {
  const userAgent = request.headers.get('user-agent') || '';

  // Ignore known bots
  if (/bot|crawler|spider|slurp|facebookexternalhit|bingbot|googlebot/i.test(userAgent)) {
    return new Response(JSON.stringify({ ok: true, ignored: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const clientIp = getClientIp(request);
  const ipHash = crypto.createHash('sha256').update(clientIp + '-track-ip').digest('hex');

  const db = getDb();
  const now = Date.now();

  // Rate Limiting per IP
  const rateLimitCutoff = now - RATE_LIMIT_WINDOW_MS;
  const countRow = db.prepare(`
    SELECT COUNT(*) as count FROM track_rate_limits
    WHERE ip_hash = ? AND timestamp > ?
  `).get(ipHash, rateLimitCutoff) as { count: number };

  if (countRow && countRow.count >= MAX_REQUESTS_PER_MINUTE) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  db.prepare('INSERT INTO track_rate_limits (ip_hash, timestamp) VALUES (?, ?)').run(ipHash, now);

  // Read and validate body size
  let rawBody: string;
  try {
    rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  // Validate event name
  const name = (body.name || body.event || '').toString().trim().toLowerCase();
  if (!EVENT_NAME_REGEX.test(name)) {
    return new Response(JSON.stringify({ error: 'Invalid event name' }), { status: 400 });
  }

  // Validate path
  let path = (body.path || '/').toString().trim().slice(0, MAX_STRING_LENGTH);
  if (!path.startsWith('/')) path = '/' + path;

  // Do not record admin paths
  if (path.startsWith('/admin')) {
    return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  }

  // Extract clean referrer host
  let referrerHost = '';
  if (body.referrer && typeof body.referrer === 'string') {
    try {
      const u = new URL(body.referrer);
      referrerHost = u.hostname.slice(0, MAX_STRING_LENGTH);
    } catch {
      referrerHost = body.referrer.slice(0, MAX_STRING_LENGTH);
    }
  }

  // Device & Browser
  const allowedDevices = ['desktop', 'tablet', 'mobile'];
  const device = allowedDevices.includes(body.viewport) ? body.viewport : 'desktop';
  const browser = getCoarseBrowser(userAgent);

  // Validate props (up to 10 keys, strings max 80 chars)
  const cleanProps: Record<string, string | number | boolean> = {};
  if (body.props && typeof body.props === 'object' && !Array.isArray(body.props)) {
    const keys = Object.keys(body.props).slice(0, MAX_PROPS);
    for (const k of keys) {
      const sanitizedKey = k.slice(0, 40).replace(/[^a-zA-Z0-9_-]/g, '');
      const val = body.props[k];
      if (typeof val === 'string') {
        cleanProps[sanitizedKey] = val.slice(0, MAX_STRING_LENGTH);
      } else if (typeof val === 'number' || typeof val === 'boolean') {
        cleanProps[sanitizedKey] = val;
      }
    }
  }

  const visitorHash = getDailyVisitorHash(clientIp);

  // Insert event
  try {
    db.prepare(`
      INSERT INTO events (
        name, path, referrer_host, visitor_hash, device, browser, props, timestamp, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      name,
      path,
      referrerHost,
      visitorHash,
      device,
      browser,
      Object.keys(cleanProps).length > 0 ? JSON.stringify(cleanProps) : null,
      now,
      new Date(now).toISOString()
    );
  } catch (err) {
    console.error('Failed to insert track event:', err);
    return new Response(JSON.stringify({ error: 'Failed to record event' }), { status: 500 });
  }

  // 13-Month Retention Cleanup (~5% chance per request)
  if (Math.random() < 0.05) {
    try {
      const thirteenMonthsAgo = now - 396 * 24 * 60 * 60 * 1000;
      db.prepare('DELETE FROM events WHERE timestamp < ?').run(thirteenMonthsAgo);
      db.prepare('DELETE FROM track_rate_limits WHERE timestamp < ?').run(now - RATE_LIMIT_WINDOW_MS);
    } catch (err) {
      console.error('Retention cleanup error:', err);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
