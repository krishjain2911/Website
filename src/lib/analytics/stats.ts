import { getDb } from '../admin/db';

export interface AnalyticsFilter {
  days: number; // 7, 30, or 90
}

export interface DayData {
  date: string; // YYYY-MM-DD
  visitors: number;
  pageviews: number;
  interactions: number;
}

export interface FunnelRoleData {
  slug: string;
  title: string;
  views: number;
  applies: number;
  conversion: number;
}

export interface PegItemStats {
  item: string;
  clicks: number;
}

export interface PegZoneStats {
  zone: string;
  count: number;
}

export interface PegEggStats {
  egg: string;
  count: number;
}

export interface AnalyticsOverview {
  days: number;
  totalVisitors: number;
  totalPageviews: number;
  avgPagesPerVisit: number;
  dailyTimeline: DayData[];
  topPages: { path: string; count: number }[];
  topReferrers: { host: string; count: number }[];
  devices: { name: string; count: number; percentage: number }[];
  browsers: { name: string; count: number; percentage: number }[];
  funnel: {
    careersViews: number;
    roleViews: number;
    applyClicks: number;
    roles: FunnelRoleData[];
  };
  pegBoard: {
    totalInteractions: number;
    uniqueInteractingVisitors: number;
    totalPegboardVisitors: number;
    interactionRate: number; // percentage
    interactionsByDay: { date: string; count: number }[];
    clicksPerZone: PegZoneStats[];
    topItems: PegItemStats[];
    easterEggs: PegEggStats[];
  };
}

export function getAnalytics(days: number = 30): AnalyticsOverview {
  const db = getDb();
  const validDays = [7, 30, 90].includes(days) ? days : 30;
  const cutoffTime = Date.now() - validDays * 24 * 60 * 60 * 1000;

  // 1. Overview Totals
  const totalVisitorsRow = db.prepare(`
    SELECT COUNT(DISTINCT visitor_hash) as count
    FROM events
    WHERE timestamp >= ?
  `).get(cutoffTime) as { count: number };
  const totalVisitors = totalVisitorsRow?.count || 0;

  const totalPageviewsRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM events
    WHERE name = 'pageview' AND timestamp >= ?
  `).get(cutoffTime) as { count: number };
  const totalPageviews = totalPageviewsRow?.count || 0;

  const avgPagesPerVisit = totalVisitors > 0
    ? Number((totalPageviews / totalVisitors).toFixed(1))
    : 0;

  // 2. Daily Timeline
  // Pre-fill all dates in the range
  const timelineMap = new Map<string, DayData>();
  for (let i = validDays - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    timelineMap.set(dateStr, { date: dateStr, visitors: 0, pageviews: 0, interactions: 0 });
  }

  // Daily pageviews & interactions
  const dailyEventRows = db.prepare(`
    SELECT
      strftime('%Y-%m-%d', timestamp / 1000, 'unixepoch') as date,
      name,
      COUNT(*) as count
    FROM events
    WHERE timestamp >= ?
    GROUP BY date, name
  `).all(cutoffTime) as { date: string; name: string; count: number }[];

  for (const row of dailyEventRows) {
    if (timelineMap.has(row.date)) {
      const entry = timelineMap.get(row.date)!;
      if (row.name === 'pageview') {
        entry.pageviews += row.count;
      }
      if (['peg_item_click', 'peg_zone_open', 'peg_easter_egg', 'peg_interaction', 'peg_outbound'].includes(row.name)) {
        entry.interactions += row.count;
      }
    }
  }

  // Daily unique visitors
  const dailyVisitorRows = db.prepare(`
    SELECT
      strftime('%Y-%m-%d', timestamp / 1000, 'unixepoch') as date,
      COUNT(DISTINCT visitor_hash) as count
    FROM events
    WHERE timestamp >= ?
    GROUP BY date
  `).all(cutoffTime) as { date: string; count: number }[];

  for (const row of dailyVisitorRows) {
    if (timelineMap.has(row.date)) {
      timelineMap.get(row.date)!.visitors = row.count;
    }
  }

  const dailyTimeline = Array.from(timelineMap.values());

  // 3. Top Pages
  const topPages = db.prepare(`
    SELECT path, COUNT(*) as count
    FROM events
    WHERE name = 'pageview' AND timestamp >= ?
    GROUP BY path
    ORDER BY count DESC
    LIMIT 10
  `).all(cutoffTime) as { path: string; count: number }[];

  // 4. Top Referrers
  const topReferrers = db.prepare(`
    SELECT COALESCE(NULLIF(referrer_host, ''), 'Direct / None') as host, COUNT(*) as count
    FROM events
    WHERE name = 'pageview' AND timestamp >= ?
    GROUP BY host
    ORDER BY count DESC
    LIMIT 10
  `).all(cutoffTime) as { host: string; count: number }[];

  // 5. Devices Breakdown
  const deviceRows = db.prepare(`
    SELECT COALESCE(NULLIF(device, ''), 'desktop') as name, COUNT(*) as count
    FROM events
    WHERE name = 'pageview' AND timestamp >= ?
    GROUP BY name
    ORDER BY count DESC
  `).all(cutoffTime) as { name: string; count: number }[];

  const devices = deviceRows.map((r) => ({
    name: r.name,
    count: r.count,
    percentage: totalPageviews > 0 ? Math.round((r.count / totalPageviews) * 100) : 0
  }));

  // 6. Browsers Breakdown
  const browserRows = db.prepare(`
    SELECT COALESCE(NULLIF(browser, ''), 'Other') as name, COUNT(*) as count
    FROM events
    WHERE name = 'pageview' AND timestamp >= ?
    GROUP BY name
    ORDER BY count DESC
  `).all(cutoffTime) as { name: string; count: number }[];

  const browsers = browserRows.map((r) => ({
    name: r.name,
    count: r.count,
    percentage: totalPageviews > 0 ? Math.round((r.count / totalPageviews) * 100) : 0
  }));

  // 7. Careers Funnel
  const careersViewsRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM events
    WHERE name = 'pageview' AND (path = '/careers' OR path = '/careers/') AND timestamp >= ?
  `).get(cutoffTime) as { count: number };
  const careersViews = careersViewsRow?.count || 0;

  const roleViewsRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM events
    WHERE name = 'pageview' AND path LIKE '/careers/%' AND timestamp >= ?
  `).get(cutoffTime) as { count: number };
  const roleViews = roleViewsRow?.count || 0;

  const applyClicksRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM events
    WHERE (name = 'careers_apply_click' OR name = 'role_apply_click') AND timestamp >= ?
  `).get(cutoffTime) as { count: number };
  const applyClicks = applyClicksRow?.count || 0;

  // Per role funnel
  const allRoles = db.prepare('SELECT slug, title FROM jobs').all() as { slug: string; title: string }[];
  const roleFunnel: FunnelRoleData[] = [];

  for (const role of allRoles) {
    const rolePath = `/careers/${role.slug}`;
    const vRow = db.prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE name = 'pageview' AND (path = ? OR path = ?) AND timestamp >= ?
    `).get(rolePath, `${rolePath}/`, cutoffTime) as { count: number };

    // Apply click could match props JSON {"role":"slug"} or path
    const aRow = db.prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE (name = 'careers_apply_click' OR name = 'role_apply_click')
        AND (path LIKE ? OR props LIKE ?)
        AND timestamp >= ?
    `).get(`%${role.slug}%`, `%"role":"${role.slug}"%`, cutoffTime) as { count: number };

    const views = vRow?.count || 0;
    const applies = aRow?.count || 0;
    const conversion = views > 0 ? Number(((applies / views) * 100).toFixed(1)) : 0;

    roleFunnel.push({
      slug: role.slug,
      title: role.title,
      views,
      applies,
      conversion
    });
  }

  // Sort roles by views DESC
  roleFunnel.sort((a, b) => b.views - a.views);

  // 8. PEG Board Interaction Panel
  const pegInteractionsQuery = `
    SELECT *
    FROM events
    WHERE name IN ('peg_item_click', 'peg_zone_open', 'peg_easter_egg', 'peg_interaction', 'peg_outbound')
      AND timestamp >= ?
  `;
  const pegEvents = db.prepare(pegInteractionsQuery).all(cutoffTime) as {
    name: string;
    props: string | null;
    visitor_hash: string;
    timestamp: number;
  }[];

  const totalInteractions = pegEvents.length;
  const uniquePegVisitorsSet = new Set<string>();
  const zoneCountsMap = new Map<string, number>();
  const itemCountsMap = new Map<string, number>();
  const eggCountsMap = new Map<string, number>();

  for (const ev of pegEvents) {
    uniquePegVisitorsSet.add(ev.visitor_hash);
    if (!ev.props) continue;

    try {
      const p = JSON.parse(ev.props);
      if (p.zone) {
        zoneCountsMap.set(p.zone, (zoneCountsMap.get(p.zone) || 0) + 1);
      }
      if (p.item) {
        itemCountsMap.set(p.item, (itemCountsMap.get(p.item) || 0) + 1);
      }
      if (p.egg || ev.name === 'peg_easter_egg') {
        const eggName = p.egg || p.name || 'secret';
        eggCountsMap.set(eggName, (eggCountsMap.get(eggName) || 0) + 1);
      }
    } catch {
      // ignore json parse error
    }
  }

  const uniqueInteractingVisitors = uniquePegVisitorsSet.size;

  const totalPegboardVisitorsRow = db.prepare(`
    SELECT COUNT(DISTINCT visitor_hash) as count
    FROM events
    WHERE path LIKE '/peg-board%' AND timestamp >= ?
  `).get(cutoffTime) as { count: number };
  const totalPegboardVisitors = totalPegboardVisitorsRow?.count || 0;

  const interactionRate = totalPegboardVisitors > 0
    ? Number(((uniqueInteractingVisitors / totalPegboardVisitors) * 100).toFixed(1))
    : 0;

  const clicksPerZone: PegZoneStats[] = Array.from(zoneCountsMap.entries()).map(([zone, count]) => ({
    zone,
    count
  })).sort((a, b) => b.count - a.count);

  const topItems: PegItemStats[] = Array.from(itemCountsMap.entries()).map(([item, clicks]) => ({
    item,
    clicks
  })).sort((a, b) => b.clicks - a.clicks).slice(0, 10);

  const easterEggs: PegEggStats[] = Array.from(eggCountsMap.entries()).map(([egg, count]) => ({
    egg,
    count
  })).sort((a, b) => b.count - a.count);

  const interactionsByDay = dailyTimeline.map((d) => ({
    date: d.date,
    count: d.interactions
  }));

  return {
    days: validDays,
    totalVisitors,
    totalPageviews,
    avgPagesPerVisit,
    dailyTimeline,
    topPages,
    topReferrers,
    devices,
    browsers,
    funnel: {
      careersViews,
      roleViews,
      applyClicks,
      roles: roleFunnel
    },
    pegBoard: {
      totalInteractions,
      uniqueInteractingVisitors,
      totalPegboardVisitors,
      interactionRate,
      interactionsByDay,
      clicksPerZone,
      topItems,
      easterEggs
    }
  };
}

export function generateCsv(data: AnalyticsOverview): string {
  const lines: string[] = [];

  lines.push(`Analytics Export (${data.days} days)`);
  lines.push(`Total Visitors,${data.totalVisitors}`);
  lines.push(`Total Pageviews,${data.totalPageviews}`);
  lines.push(`Avg Pages per Visit,${data.avgPagesPerVisit}`);
  lines.push('');

  lines.push('Daily Timeline');
  lines.push('Date,Visitors,Pageviews,PEG Interactions');
  for (const d of data.dailyTimeline) {
    lines.push(`${d.date},${d.visitors},${d.pageviews},${d.interactions}`);
  }
  lines.push('');

  lines.push('Top Pages');
  lines.push('Path,Views');
  for (const p of data.topPages) {
    lines.push(`"${p.path}",${p.count}`);
  }
  lines.push('');

  lines.push('Top Referrers');
  lines.push('Referrer,Count');
  for (const r of data.topReferrers) {
    lines.push(`"${r.host}",${r.count}`);
  }
  lines.push('');

  lines.push('Careers Funnel');
  lines.push(`Careers Hub Views,${data.funnel.careersViews}`);
  lines.push(`Role Page Views,${data.funnel.roleViews}`);
  lines.push(`Apply Clicks,${data.funnel.applyClicks}`);
  lines.push('Role,Views,Applies,Conversion %');
  for (const r of data.funnel.roles) {
    lines.push(`"${r.title}",${r.views},${r.applies},${r.conversion}%`);
  }
  lines.push('');

  lines.push('PEG Board Interactions');
  lines.push(`Total Interactions,${data.pegBoard.totalInteractions}`);
  lines.push(`Unique Interacting Visitors,${data.pegBoard.uniqueInteractingVisitors}`);
  lines.push(`Total PEG Board Visitors,${data.pegBoard.totalPegboardVisitors}`);
  lines.push(`Interaction Share %,${data.pegBoard.interactionRate}%`);
  lines.push('');

  lines.push('Top PEG Board Items');
  lines.push('Item,Clicks');
  for (const item of data.pegBoard.topItems) {
    lines.push(`"${item.item}",${item.clicks}`);
  }
  lines.push('');

  lines.push('PEG Board Easter Eggs');
  lines.push('Egg,Count');
  for (const egg of data.pegBoard.easterEggs) {
    lines.push(`"${egg.egg}",${egg.count}`);
  }

  return lines.join('\n');
}
