import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/admin/auth';
import { getAnalytics, generateCsv } from '../../../lib/analytics/stats';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session.valid) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }

  const url = new URL(request.url);
  const daysParam = parseInt(url.searchParams.get('days') || '30', 10);
  const days = [7, 30, 90].includes(daysParam) ? daysParam : 30;

  const summary = getAnalytics(days);
  const csvContent = generateCsv(summary);

  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rhsp-telemetry-${days}d.csv"`,
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    },
  });
};
