import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import rawJobs from '../../data/jobs.json';

export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
export type JobMode = 'On-site' | 'Hybrid' | 'Remote';
export type JobStatus = 'draft' | 'published' | 'closed';

export interface Job {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  mode: JobMode;
  experience: string;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  salary?: string;
  applyEmail?: string;
  postedAt: string;
  closesAt?: string;
  status: JobStatus;
  // Compatibility getters/aliases
  work_mode?: string;
  created_at?: string;
  closing_date?: string;
  apply_email?: string;
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

export function validateJob(entry: any): { valid: boolean; errors: string[]; job?: Job } {
  const errors: string[] = [];

  if (!entry || typeof entry !== 'object') {
    return { valid: false, errors: ['Job record must be an object'] };
  }

  const slug = (entry.slug || '').toString().trim();
  if (!slug) errors.push('Slug identifier is required');

  const title = (entry.title || '').toString().trim();
  if (!title) errors.push('Title is required');

  const department = (entry.department || '').toString().trim();
  if (!department) errors.push('Department is required');

  const location = (entry.location || 'Mumbai').toString().trim();

  const validTypes: JobType[] = ['Full-time', 'Part-time', 'Internship', 'Contract'];
  const type = validTypes.includes(entry.type) ? entry.type : 'Full-time';

  const validModes: JobMode[] = ['On-site', 'Hybrid', 'Remote'];
  const modeVal = entry.mode || entry.work_mode;
  const mode = validModes.includes(modeVal) ? modeVal : 'Hybrid';

  const experience = (entry.experience || '').toString().trim();

  const summary = (entry.summary || '').toString().trim();
  if (summary.length > 160) {
    errors.push('Summary cannot exceed 160 characters');
  }

  const description = (entry.description || entry.description_md || '').toString().trim();
  if (!description) {
    errors.push('Description is required');
  }

  const responsibilities = Array.isArray(entry.responsibilities)
    ? entry.responsibilities.map((r: any) => String(r).trim()).filter(Boolean)
    : typeof entry.responsibilities === 'string'
      ? entry.responsibilities.split('\n').map((r) => r.trim()).filter(Boolean)
      : [];

  const requirements = Array.isArray(entry.requirements)
    ? entry.requirements.map((r: any) => String(r).trim()).filter(Boolean)
    : typeof entry.requirements === 'string'
      ? entry.requirements.split('\n').map((r) => r.trim()).filter(Boolean)
      : [];

  const rawStatus = (entry.status || 'draft').toString().toLowerCase();
  const validStatuses: JobStatus[] = ['draft', 'published', 'closed'];
  const status: JobStatus = validStatuses.includes(rawStatus as JobStatus)
    ? (rawStatus as JobStatus)
    : 'draft';

  const postedAt = (entry.postedAt || entry.created_at || new Date().toISOString()).toString();
  const closesAt = entry.closesAt || entry.closing_date ? String(entry.closesAt || entry.closing_date) : undefined;
  const salary = entry.salary ? String(entry.salary).trim() : undefined;
  const applyEmail = entry.applyEmail || entry.apply_email ? String(entry.applyEmail || entry.apply_email).trim() : undefined;

  const job: Job = {
    slug,
    title,
    department,
    location,
    type,
    mode,
    experience,
    summary,
    description,
    responsibilities,
    requirements,
    salary: salary || undefined,
    applyEmail: applyEmail || undefined,
    postedAt,
    closesAt,
    status,
    // Aliases
    work_mode: mode,
    created_at: postedAt,
    closing_date: closesAt,
    apply_email: applyEmail,
  };

  return {
    valid: errors.length === 0,
    errors,
    job,
  };
}

export function loadJobs(): Job[] {
  if (!Array.isArray(rawJobs)) return [];
  const jobs: Job[] = [];
  for (const raw of rawJobs) {
    const res = validateJob(raw);
    if (res.valid && res.job) {
      jobs.push(res.job);
    }
  }
  return jobs;
}

export function getPublishedJobs(): Job[] {
  const now = Date.now();
  return loadJobs().filter((job) => {
    if (job.status !== 'published') return false;
    if (job.closesAt) {
      const closeTime = new Date(job.closesAt).getTime();
      if (!isNaN(closeTime) && closeTime < now) {
        return false;
      }
    }
    return true;
  });
}

export function getPublishedJobBySlug(slug: string): Job | undefined {
  return getPublishedJobs().find((j) => j.slug === slug);
}

export function getAllJobs(): Job[] {
  return loadJobs();
}
