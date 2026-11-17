import type { APIRoute } from 'astro';
import { getSession, validateCsrf } from '../../../lib/admin/auth';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  validateJobInput,
} from '../../../lib/careers/jobs';

export const prerender = false;

function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

function forbiddenResponse(message = 'Forbidden'): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: {
      'Content-Type': 'application/json',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export const GET: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session.valid) return unauthorizedResponse();

  const url = new URL(request.url);
  const idParam = url.searchParams.get('id');

  if (idParam) {
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Invalid ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }
    const job = getJobById(id);
    if (!job) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }
    return new Response(JSON.stringify(job), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }

  const jobs = getAllJobs();
  return new Response(JSON.stringify(jobs), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session.valid) return unauthorizedResponse();
  if (!validateCsrf(request)) return forbiddenResponse('CSRF check failed');

  try {
    const body = await request.json();
    const validation = validateJobInput(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ errors: validation.errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }

    const created = createJob({
      title: body.title,
      slug: body.slug,
      department: body.department,
      location: body.location,
      type: body.type,
      work_mode: body.work_mode,
      experience: body.experience,
      summary: body.summary,
      description_md: body.description_md,
      responsibilities: body.responsibilities,
      requirements: body.requirements,
      salary: body.salary,
      apply_email: body.apply_email,
      closing_date: body.closing_date,
      status: body.status,
    });

    return new Response(JSON.stringify(created), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session.valid) return unauthorizedResponse();
  if (!validateCsrf(request)) return forbiddenResponse('CSRF check failed');

  try {
    const body = await request.json();
    const id = parseInt(body.id, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Valid job ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }

    const validation = validateJobInput(body, id);
    if (!validation.valid) {
      return new Response(JSON.stringify({ errors: validation.errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }

    const updated = updateJob(id, {
      title: body.title,
      slug: body.slug,
      department: body.department,
      location: body.location,
      type: body.type,
      work_mode: body.work_mode,
      experience: body.experience,
      summary: body.summary,
      description_md: body.description_md,
      responsibilities: body.responsibilities,
      requirements: body.requirements,
      salary: body.salary,
      apply_email: body.apply_email,
      closing_date: body.closing_date,
      status: body.status,
    });

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session.valid) return unauthorizedResponse();
  if (!validateCsrf(request)) return forbiddenResponse('CSRF check failed');

  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Valid job ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }

    const success = deleteJob(id);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }
};
