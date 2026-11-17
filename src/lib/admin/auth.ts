import crypto from 'node:crypto';
import type { AstroCookies } from 'astro';
import { ADMIN_CREDENTIALS } from './credentials';
import { getDb } from './db';

const SESSION_COOKIE_NAME = 'rhsp_admin_session';
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

// Helper to hash IP for rate limiting without storing raw IP
export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + '-rhsp-auth-salt').digest('hex');
}

export function checkLoginRateLimit(clientIp: string): { allowed: boolean; remainingAttempts: number; retryAfterSec?: number } {
  const db = getDb();
  const ipHash = hashIp(clientIp);
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;

  const row = db.prepare(`
    SELECT COUNT(*) as count, MIN(attempted_at) as oldest
    FROM login_attempts
    WHERE ip_hash = ? AND attempted_at > ?
  `).get(ipHash, cutoff) as { count: number; oldest: number | null };

  const failedCount = row?.count || 0;
  if (failedCount >= MAX_FAILED_ATTEMPTS) {
    const oldest = row.oldest || cutoff;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - Date.now()) / 1000));
    return { allowed: false, remainingAttempts: 0, retryAfterSec };
  }

  return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS - failedCount };
}

export function recordFailedLogin(clientIp: string) {
  const db = getDb();
  const ipHash = hashIp(clientIp);
  db.prepare('INSERT INTO login_attempts (ip_hash, attempted_at) VALUES (?, ?)').run(ipHash, Date.now());
}

export function clearFailedLogins(clientIp: string) {
  const db = getDb();
  const ipHash = hashIp(clientIp);
  db.prepare('DELETE FROM login_attempts WHERE ip_hash = ?').run(ipHash);
}

export function verifyPassword(password: string): boolean {
  try {
    const salt = ADMIN_CREDENTIALS.salt;
    const expectedHash = Buffer.from(ADMIN_CREDENTIALS.hash, 'hex');
    const computedHash = crypto.scryptSync(password, salt, ADMIN_CREDENTIALS.keyLength);

    if (expectedHash.length !== computedHash.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedHash, computedHash);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

export function createSession(email: string, cookies: AstroCookies, isProd: boolean): string {
  const db = getDb();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  db.prepare('INSERT INTO sessions (id, user_email, expires_at, created_at) VALUES (?, ?, ?, ?)').run(
    token,
    email,
    expiresAt,
    new Date().toISOString()
  );

  cookies.set(SESSION_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: isProd,
    maxAge: Math.floor(SESSION_DURATION_MS / 1000)
  });

  return token;
}

export function getSession(cookies: AstroCookies): { valid: boolean; email?: string } {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return { valid: false };

  const db = getDb();
  const session = db.prepare('SELECT id, user_email, expires_at FROM sessions WHERE id = ?').get(token) as {
    id: string;
    user_email: string;
    expires_at: number;
  } | undefined;

  if (!session) return { valid: false };

  if (Date.now() > session.expires_at) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    return { valid: false };
  }

  return { valid: true, email: session.user_email };
}

export function destroySession(cookies: AstroCookies) {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
  }
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

export function validateCsrf(request: Request): boolean {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return true;
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (host && (originUrl.host === host || host.startsWith(originUrl.host))) return true;
      const reqUrl = new URL(request.url);
      if (originUrl.origin === reqUrl.origin || originUrl.host === reqUrl.host) return true;
      if (originUrl.hostname === 'roundholesquarepeg.com' || originUrl.hostname === 'www.roundholesquarepeg.com') return true;
      if (originUrl.hostname === '127.0.0.1' || originUrl.hostname === 'localhost') return true;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (host && (refererUrl.host === host || host.startsWith(refererUrl.host))) return true;
      const reqUrl = new URL(request.url);
      if (refererUrl.origin === reqUrl.origin || refererUrl.host === reqUrl.host) return true;
      if (refererUrl.hostname === 'roundholesquarepeg.com' || refererUrl.hostname === 'www.roundholesquarepeg.com') return true;
      if (refererUrl.hostname === '127.0.0.1' || refererUrl.hostname === 'localhost') return true;
    } catch {
      return false;
    }
  }

  return false;
}
