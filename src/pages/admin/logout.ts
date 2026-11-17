import type { APIRoute } from 'astro';
import { destroySession } from '../../lib/admin/auth';

export const prerender = false;

export const ALL: APIRoute = async ({ cookies, redirect }) => {
  destroySession(cookies);
  const response = redirect('/admin/login', 302);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
};
