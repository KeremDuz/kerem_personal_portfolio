import { Request, Response } from "express";

/**
 * Real GitHub contribution calendar.
 *
 * GitHub's REST API does not expose contributions, and the GraphQL one needs a
 * personal access token. The public `/users/:login/contributions` fragment
 * needs neither, so it is fetched and parsed here — server-side, because the
 * browser cannot read it cross-origin.
 */

const USERNAME = process.env.GITHUB_USERNAME || "KeremDuz";
const SOURCE = `https://github.com/users/${USERNAME}/contributions`;
/** GitHub recomputes this at most daily; six hours is plenty. */
const TTL_MS = 6 * 60 * 60 * 1000;

export interface ContributionDay {
    date: string;
    /** GitHub's own 0-4 intensity bucket. */
    level: number;
    count: number;
}

export interface ContributionCalendar {
    username: string;
    total: number;
    /** Columns of the grid. Each holds 7 slots, Sunday first; null = no such day. */
    weeks: (ContributionDay | null)[][];
    from: string;
    to: string;
}

let cache: { at: number; data: ContributionCalendar } | null = null;

const DAY_CELL = /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"[^>]*>/g;
const TOOLTIP = /<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]+)<\/tool-tip>/g;
const CELL_ID = /id="(contribution-day-component-[^"]+)"/;
const TOTAL = /<h2[^>]*>\s*([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i;

function parseCalendar(html: string): ContributionCalendar {
    // Day counts live in the tooltips ("3 contributions on May 10th."), keyed
    // by the cell id they describe.
    const counts = new Map<string, number>();
    for (const match of html.matchAll(TOOLTIP)) {
        const leading = /^(\d[\d,]*)\s/.exec(match[2].trim());
        counts.set(match[1], leading ? Number(leading[1].replace(/,/g, "")) : 0);
    }

    const days: ContributionDay[] = [];
    for (const match of html.matchAll(DAY_CELL)) {
        const id = CELL_ID.exec(match[0])?.[1];
        days.push({
            date: match[1],
            level: Number(match[2]),
            count: (id && counts.get(id)) || 0,
        });
    }

    if (days.length === 0) {
        throw new Error("No contribution cells found; GitHub markup may have changed");
    }

    days.sort((a, b) => a.date.localeCompare(b.date));

    // Lay the days out into calendar columns. Deriving the column from the date
    // rather than chunking by seven keeps the weekday rows aligned even though
    // the first and last weeks are partial.
    const first = new Date(`${days[0].date}T00:00:00Z`);
    const gridStart = new Date(first);
    gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay());

    const weeks: (ContributionDay | null)[][] = [];
    for (const day of days) {
        const current = new Date(`${day.date}T00:00:00Z`);
        const offset = Math.floor((current.getTime() - gridStart.getTime()) / 86_400_000);
        const week = Math.floor(offset / 7);
        while (weeks.length <= week) weeks.push(new Array(7).fill(null));
        weeks[week][current.getUTCDay()] = day;
    }

    const totalMatch = TOTAL.exec(html);
    const total = totalMatch
        ? Number(totalMatch[1].replace(/,/g, ""))
        : days.reduce((sum, day) => sum + day.count, 0);

    return {
        username: USERNAME,
        total,
        weeks,
        from: days[0].date,
        to: days[days.length - 1].date,
    };
}

export const getContributions = async (_req: Request, res: Response) => {
    if (cache && Date.now() - cache.at < TTL_MS) {
        return res.json(cache.data);
    }

    try {
        const response = await fetch(SOURCE, {
            headers: {
                // Without a browser-ish UA, GitHub serves a stripped page.
                "User-Agent": "Mozilla/5.0 (compatible; keremduz-portfolio/1.0)",
                Accept: "text/html",
            },
            signal: AbortSignal.timeout(10_000),
        });

        if (!response.ok) {
            throw new Error(`GitHub responded ${response.status}`);
        }

        const data = parseCalendar(await response.text());
        cache = { at: Date.now(), data };
        res.set("Cache-Control", "public, max-age=3600");
        return res.json(data);
    } catch (error) {
        // Serve stale data rather than nothing — a graph a few hours old beats
        // an empty panel when GitHub is slow or the markup shifts.
        if (cache) return res.json(cache.data);
        return res.status(502).json({
            error: "GitHub katkı verisi alınamadı.",
            detail: error instanceof Error ? error.message : String(error),
        });
    }
};
