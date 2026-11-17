import type { APIRoute } from 'astro';
import { getSession, validateCsrf } from '../../../lib/admin/auth';
import { duplicateJob } from '../../../lib/careers/jobs';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session.valid) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }

  if (!validateCsrf(request)) {
    return new Response(JSON.stringify({ error: 'CSRF validation failed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }

  try {
    const body = await request.json();
    const id = parseInt(body.id, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Valid job ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }

    const duplicated = duplicateJob(id);
    if (!duplicated) {
      return new Response(JSON.stringify({ error: 'Source job not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }

    return new Response(JSON.stringify(duplicated), {
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
