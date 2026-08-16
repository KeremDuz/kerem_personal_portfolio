"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { githubAPI, type ContributionCalendar } from "@/lib/api";

/** Intensity ramp for levels 0-4, in the site's green rather than GitHub's. */
const LEVELS = [
    "rgb(var(--s-line) / 0.06)",
    "rgb(var(--c-green) / 0.22)",
    "rgb(var(--c-green) / 0.45)",
    "rgb(var(--c-green) / 0.7)",
    "rgb(var(--c-green) / 1)",
];

/** Rows GitHub labels — Monday, Wednesday, Friday. */
const LABELLED_ROWS = [1, 3, 5];

/** Cell size and gap, in px. Sized so a full 53-week year fits the card
 *  without horizontal scrolling on a desktop-width layout. */
const CELL = 10;
const GAP = 2;
const COLUMN_PITCH = CELL + GAP;

// Real public GitHub snapshot captured on 2026-08-16. The live API replaces
// it as soon as it responds; keeping a last-known-good calendar means the
// section never disappears when GitHub or the deployment network is offline.
const SNAPSHOT_FROM = "2025-08-17";
const SNAPSHOT_LEVELS = "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000001040010010000000004010000200000000000000040301011001101000000300213200000000210100002011100010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
const SNAPSHOT_NONZERO_COUNTS: ReadonlyArray<readonly [number, number]> = [
    [112, 2], [184, 2], [186, 13], [189, 2], [192, 2], [202, 8],
    [204, 1], [209, 3], [225, 7], [227, 5], [229, 1], [231, 2],
    [232, 2], [235, 2], [236, 2], [238, 1], [245, 5], [248, 4],
    [249, 2], [250, 5], [251, 3], [260, 4], [261, 1], [263, 2],
    [268, 3], [270, 2], [271, 2], [272, 2], [276, 1],
];

function buildSnapshotCalendar(): ContributionCalendar {
    const counts = new Array<number>(SNAPSHOT_LEVELS.length).fill(0);
    for (const [index, count] of SNAPSHOT_NONZERO_COUNTS) counts[index] = count;
    const start = new Date(`${SNAPSHOT_FROM}T00:00:00Z`);
    const weeks: ContributionCalendar["weeks"] = [];

    Array.from(SNAPSHOT_LEVELS).forEach((level, index) => {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + index);
        const weekIndex = Math.floor((index + start.getUTCDay()) / 7);
        while (weeks.length <= weekIndex) weeks.push(new Array(7).fill(null));
        weeks[weekIndex][date.getUTCDay()] = {
            date: date.toISOString().slice(0, 10),
            level: Number(level),
            count: counts[index] ?? 0,
        };
    });

    const lastDay = new Date(start);
    lastDay.setUTCDate(start.getUTCDate() + SNAPSHOT_LEVELS.length - 1);

    return {
        username: "KeremDuz",
        total: counts.reduce((sum, count) => sum + count, 0),
        weeks,
        from: SNAPSHOT_FROM,
        to: lastDay.toISOString().slice(0, 10),
    };
}

const SNAPSHOT_CALENDAR = buildSnapshotCalendar();

export default function ContributionGraph() {
    const t = useTranslations("GitHub");
    const locale = useLocale();
    const [data, setData] = useState<ContributionCalendar>(SNAPSHOT_CALENDAR);

    useEffect(() => {
        let alive = true;
        githubAPI
            .contributions()
            .then((result) => alive && setData(result))
            .catch(() => {
                // Keep the real last-known-good snapshot already on screen.
            });
        return () => {
            alive = false;
        };
    }, []);

    const dayNames = useMemo(() => {
        const format = new Intl.DateTimeFormat(locale, { weekday: "short" });
        // 2024-01-07 was a Sunday, so this walks Sun..Sat in order.
        return Array.from({ length: 7 }, (_, i) =>
            format.format(new Date(Date.UTC(2024, 0, 7 + i)))
        );
    }, [locale]);

    // A month label is placed on the first column that belongs to a new month,
    // which is what keeps the labels lined up with the grid as it scrolls.
    const monthLabels = useMemo(() => {
        const format = new Intl.DateTimeFormat(locale, { month: "short" });
        const labels: { index: number; label: string }[] = [];
        let previous = -1;

        data.weeks.forEach((week, index) => {
            const first = week.find(Boolean);
            if (!first) return;
            const month = new Date(`${first.date}T00:00:00Z`).getUTCMonth();
            if (month !== previous) {
                previous = month;
                // Skip a label that would collide with the one before it.
                if (labels.length === 0 || index - labels[labels.length - 1].index >= 3) {
                    labels.push({ index, label: format.format(new Date(`${first.date}T00:00:00Z`)) });
                }
            }
        });

        return labels;
    }, [data, locale]);

    const dateFormat = useMemo(
        () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }),
        [locale]
    );

    return (
        <div id="github-activity" className="glass-card scroll-mt-24 overflow-hidden p-5 md:p-6">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-sm text-gray-300">
                    <span className="font-display text-lg font-bold text-cyber-green">
                        {data.total}
                    </span>{" "}
                    {t("lastYear")}
                </p>

                <a
                    href={`https://github.com/${data.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-xs text-gray-500 transition-colors hover:text-cyber-green"
                >
                    @{data.username}
                    <ExternalLink size={11} />
                </a>
            </div>

            {/* A full year never fits a phone; GitHub scrolls it too. Scrolled
                to the right on mount so the most recent weeks — the ones
                actually worth seeing — are what you land on. */}
            <div
                ref={(node) => {
                    if (node) node.scrollLeft = node.scrollWidth;
                }}
                className="hide-scrollbar -mx-1 overflow-x-auto px-1"
                style={{ scrollbarWidth: "none" }}
            >
                <div className="w-max">
                    {/* Month row, positioned by column so it tracks the grid */}
                    <div className="relative mb-1.5 ml-8 h-4">
                        {monthLabels.map(({ index, label }) => (
                            <span
                                key={`${label}-${index}`}
                                className="absolute top-0 font-mono text-[10px] text-gray-500"
                                style={{ left: index * COLUMN_PITCH }}
                            >
                                {label}
                            </span>
                        ))}
                    </div>

                    <div className="flex" style={{ gap: GAP }}>
                        {/* Weekday labels, on the same row pitch as the grid */}
                        <div className="mr-1 flex w-7 flex-col" style={{ gap: GAP }}>
                            {dayNames.map((name, row) => (
                                <span
                                    key={name}
                                    className="font-mono text-[9px] text-gray-600"
                                    style={{ height: CELL, lineHeight: `${CELL}px` }}
                                >
                                    {LABELLED_ROWS.includes(row) ? name : ""}
                                </span>
                            ))}
                        </div>

                        {data.weeks.map((week, wi) => (
                            <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                                {week.map((day, di) => (
                                    <div
                                        key={di}
                                        data-contribution-date={day?.date}
                                        title={
                                            day
                                                ? t("contributionsOn", {
                                                    count: day.count,
                                                    date: dateFormat.format(
                                                        new Date(`${day.date}T00:00:00Z`)
                                                    ),
                                                })
                                                : undefined
                                        }
                                        className="rounded-[2px] transition-transform duration-150 hover:scale-150"
                                        style={{
                                            width: CELL,
                                            height: CELL,
                                            backgroundColor: day ? LEVELS[day.level] : "transparent",
                                        }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-1.5">
                <span className="mr-1 font-mono text-[10px] text-gray-600">{t("less")}</span>
                {LEVELS.map((color, i) => (
                    <div
                        key={i}
                        className="rounded-[2px]"
                        style={{ width: CELL, height: CELL, backgroundColor: color }}
                    />
                ))}
                <span className="ml-1 font-mono text-[10px] text-gray-600">{t("more")}</span>
            </div>
        </div>
    );
}
