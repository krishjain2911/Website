import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'rhsp.db');
  const db = new Database(dbPath);

  // Enable WAL mode for high concurrency
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Idempotent migrations
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT 'Mumbai',
      type TEXT NOT NULL,
      work_mode TEXT NOT NULL,
      experience TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      responsibilities TEXT NOT NULL,
      requirements TEXT NOT NULL,
      salary TEXT,
      apply_email TEXT,
      closing_date TEXT,
      status TEXT NOT NULL DEFAULT 'Draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      referrer_host TEXT,
      visitor_hash TEXT NOT NULL,
      device TEXT,
      browser TEXT,
      props TEXT,
      timestamp INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_events_path ON events(path);
    CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_hash);

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_hash TEXT NOT NULL,
      attempted_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_hash, attempted_at);

    CREATE TABLE IF NOT EXISTS track_rate_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_hash TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_track_rate_limits ON track_rate_limits(ip_hash, timestamp);
  `);

  // Run initial retention cleanup (remove events older than 13 months = 396 days)
  try {
    const thirteenMonthsAgo = Date.now() - 396 * 24 * 60 * 60 * 1000;
    db.prepare('DELETE FROM events WHERE timestamp < ?').run(thirteenMonthsAgo);
    // Cleanup old login attempts (> 1 hour) and track rate limits (> 1 minute)
    db.prepare('DELETE FROM login_attempts WHERE attempted_at < ?').run(Date.now() - 3600000);
    db.prepare('DELETE FROM track_rate_limits WHERE timestamp < ?').run(Date.now() - 60000);
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
  } catch (err) {
    console.error('Database maintenance error:', err);
  }

  dbInstance = db;
  return dbInstance;
}
