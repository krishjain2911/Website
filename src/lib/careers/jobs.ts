import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { getDb } from '../admin/db';

export interface JobRecord {
  id: number;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  work_mode: string;
  experience?: string | null;
  summary?: string | null;
  description: string;
  description_md?: string;
  description_html?: string;
  responsibilities: string; // stored as JSON or newline-separated
  requirements: string; // stored as JSON or newline-separated
  salary?: string | null;
  apply_email?: string | null;
  closing_date?: string | null;
  status: 'Draft' | 'Published' | 'Closed';
  created_at: string;
  updated_at: string;
}

export type Job = JobRecord;

export interface JobInput {
  title: string;
  slug?: string;
  department: string;
  location?: string;
  type: string;
  work_mode: string;
  experience?: string | null;
  summary?: string | null;
  description?: string;
  description_md?: string;
  responsibilities?: string[] | string;
  requirements?: string[] | string;
  salary?: string | null;
  apply_email?: string | null;
  closing_date?: string | null;
  status?: string;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function renderMarkdown(md: string): string {
  if (!md) return '';
  const rawHtml = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'h4', 'span']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'title', 'target', 'rel'],
      span: ['class'],
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',
        },
      }),
    },
  });
}

function hydrateJob(row: any): JobRecord {
  const desc = row.description || '';
  return {
    ...row,
    description: desc,
    description_md: desc,
    description_html: renderMarkdown(desc),
  };
}

export function getPublishedJobs(): JobRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM jobs WHERE status = 'Published' ORDER BY created_at DESC")
    .all();
  return rows.map(hydrateJob);
}

export function getPublishedJobBySlug(slug: string): JobRecord | undefined {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM jobs WHERE slug = ? AND status = 'Published'")
    .get(slug);
  return row ? hydrateJob(row) : undefined;
}

export function getAllJobs(search?: string, department?: string, status?: string): JobRecord[] {
  const db = getDb();
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params: any[] = [];

  if (search && search.trim()) {
    query += ' AND (title LIKE ? OR summary LIKE ? OR department LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  if (department && department !== 'all') {
    query += ' AND department = ?';
    params.push(department);
  }

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY updated_at DESC';
  const rows = db.prepare(query).all(...params);
  return rows.map(hydrateJob);
}

export function getJobById(id: number): JobRecord | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
  return row ? hydrateJob(row) : undefined;
}

export function getJobBySlug(slug: string): JobRecord | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM jobs WHERE slug = ?').get(slug);
  return row ? hydrateJob(row) : undefined;
}

function ensureUniqueSlug(desiredSlug: string, currentId?: number): string {
  const db = getDb();
  let base = slugify(desiredSlug) || 'role';
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = db
      .prepare('SELECT id FROM jobs WHERE slug = ?')
      .get(candidate) as { id: number } | undefined;

    if (!existing || (currentId && existing.id === currentId)) {
      return candidate;
    }
    candidate = `${base}-${counter}`;
    counter++;
  }
}

export function validateJob(
  input: JobInput,
  currentId?: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (input.title.length > 100) {
    errors.push('Title cannot exceed 100 characters');
  }

  if (!input.department || input.department.trim().length === 0) {
    errors.push('Department is required');
  }

  const validTypes = ['Full-time', 'Part-time', 'Internship', 'Contract'];
  if (!input.type || !validTypes.includes(input.type)) {
    errors.push('Valid engagement type required (Full-time, Part-time, Internship, Contract)');
  }

  const validModes = ['On-site', 'Hybrid', 'Remote'];
  if (!input.work_mode || !validModes.includes(input.work_mode)) {
    errors.push('Valid work mode required (On-site, Hybrid, Remote)');
  }

  if (input.summary && input.summary.length > 160) {
    errors.push('Summary cannot exceed 160 characters');
  }

  const desc = input.description || input.description_md || '';
  if (!desc || desc.trim().length === 0) {
    errors.push('Description is required');
  }

  const validStatuses = ['Draft', 'Published', 'Closed'];
  if (input.status && !validStatuses.includes(input.status)) {
    errors.push('Valid status required (Draft, Published, Closed)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export const validateJobInput = validateJob;

function normalizeList(val: string[] | string | undefined): string {
  if (!val) return '';
  if (Array.isArray(val)) {
    return val.filter((line) => line.trim().length > 0).join('\n');
  }
  return val.toString().trim();
}

export function createJob(input: JobInput): JobRecord {
  const db = getDb();
  const slug = ensureUniqueSlug(input.slug?.trim() || input.title);
  const now = new Date().toISOString();

  const responsibilities = normalizeList(input.responsibilities);
  const requirements = normalizeList(input.requirements);
  const description = input.description || input.description_md || '';

  const stmt = db.prepare(`
    INSERT INTO jobs (
      slug, title, department, location, type, work_mode, experience,
      summary, description, responsibilities, requirements, salary,
      apply_email, closing_date, status, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  const result = stmt.run(
    slug,
    input.title.trim(),
    input.department.trim(),
    input.location?.trim() || 'Mumbai',
    input.type,
    input.work_mode,
    input.experience?.trim() || null,
    input.summary?.trim() || null,
    description.trim(),
    responsibilities,
    requirements,
    input.salary?.trim() || null,
    input.apply_email?.trim() || null,
    input.closing_date?.trim() || null,
    input.status || 'Draft',
    now,
    now
  );

  return getJobById(Number(result.lastInsertRowid))!;
}

export function updateJob(id: number, input: JobInput): JobRecord | undefined {
  const existing = getJobById(id);
  if (!existing) return undefined;

  const db = getDb();
  const slug = ensureUniqueSlug(input.slug?.trim() || input.title, id);
  const now = new Date().toISOString();

  const responsibilities = normalizeList(input.responsibilities);
  const requirements = normalizeList(input.requirements);
  const description = input.description || input.description_md || existing.description;

  db.prepare(`
    UPDATE jobs SET
      slug = ?,
      title = ?,
      department = ?,
      location = ?,
      type = ?,
      work_mode = ?,
      experience = ?,
      summary = ?,
      description = ?,
      responsibilities = ?,
      requirements = ?,
      salary = ?,
      apply_email = ?,
      closing_date = ?,
      status = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    slug,
    input.title.trim(),
    input.department.trim(),
    input.location?.trim() || 'Mumbai',
    input.type,
    input.work_mode,
    input.experience?.trim() || null,
    input.summary?.trim() || null,
    description.trim(),
    responsibilities,
    requirements,
    input.salary?.trim() || null,
    input.apply_email?.trim() || null,
    input.closing_date?.trim() || null,
    input.status || existing.status,
    now,
    id
  );

  return getJobById(id);
}

export function deleteJob(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
  return result.changes > 0;
}

export function duplicateJob(id: number): JobRecord | undefined {
  const source = getJobById(id);
  if (!source) return undefined;

  const baseTitle = `${source.title} (Copy)`;
  const baseSlug = `${source.slug}-copy`;

  return createJob({
    title: baseTitle,
    slug: baseSlug,
    department: source.department,
    location: source.location,
    type: source.type,
    work_mode: source.work_mode,
    experience: source.experience,
    summary: source.summary,
    description: source.description,
    responsibilities: source.responsibilities,
    requirements: source.requirements,
    salary: source.salary,
    apply_email: source.apply_email,
    closing_date: source.closing_date,
    status: 'Draft',
  });
}
