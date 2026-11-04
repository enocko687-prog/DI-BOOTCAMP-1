"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DailyAnalytics {
  date: string;
  pageViews: number;
  serviceViews: number;
  resourceClicks: number;
  memberRegistrations: number;
  prayerRequests: number;
}

interface AnalyticsReport {
  members: number;
  prayerRequests: number;
  prayerStatuses: { new: number; prayed: number; contacted: number };
  last30Days: {
    pageViews: number;
    serviceViews: number;
    resourceClicks: number;
    memberRegistrations: number;
    memberLogins: number;
    prayerRequests: number;
  };
  daily: DailyAnalytics[];
}

const summaryLabels: Array<[keyof AnalyticsReport["last30Days"], string]> = [
  ["pageViews", "Page views"],
  ["serviceViews", "Service video opens"],
  ["resourceClicks", "Resource clicks"],
  ["memberRegistrations", "New member accounts"],
  ["memberLogins", "Member sign-ins"],
  ["prayerRequests", "Prayer requests received"],
];

export function StaffAnalytics() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadReport() {
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/staff/analytics", { cache: "no-store" });
      if (response.status === 401) {
        setError("Staff sign-in is required to view analytics.");
        setReport(null);
        return;
      }
      const result = (await response.json()) as AnalyticsReport | { error?: string };
      if (!response.ok) {
        throw new Error("error" in result && result.error ? result.error : "Could not load analytics.");
      }
      setReport(result as AnalyticsReport);
    } catch (loadError) {
      setError(
        loadError instanceof TypeError
          ? "Could not connect to WOFEM. Please try again."
          : loadError instanceof Error
            ? loadError.message
            : "Could not load analytics."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, []);

  const recentDays = report?.daily.slice(-14) ?? [];
  const maxDailyViews = Math.max(1, ...recentDays.map((day) => day.pageViews));

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-amber-700">STAFF ONLY</p>
          <h1 className="mt-2 text-3xl font-extrabold text-forest">Church analytics</h1>
          <p className="mt-2 text-sm text-muted">Aggregate activity for the last 30 days. No visitor names or email addresses are shown.</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg border border-forest px-4 py-2 font-bold text-forest" type="button" onClick={() => void loadReport()} disabled={isLoading}>
            Refresh
          </button>
          <Link className="rounded-lg bg-forest px-4 py-2 font-bold text-white" href="/admin.html">Prayer dashboard</Link>
        </div>
      </div>

      {isLoading && <p className="mt-8 text-muted" role="status">Loading analytics...</p>}
      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">
          <p>{error}</p>
          {error.includes("Staff sign-in") && <Link className="mt-3 inline-block font-bold underline" href="/admin.html">Go to staff sign in →</Link>}
        </div>
      )}

      {report && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Member accounts", report.members],
              ["Prayer requests", report.prayerRequests],
              ["Waiting for prayer", report.prayerStatuses.new],
              ["Prayed for", report.prayerStatuses.prayed],
              ["Follow-up", report.prayerStatuses.contacted],
            ].map(([label, count]) => (
              <article key={label} className="rounded-xl border border-forest/10 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-muted">{label}</p>
                <p className="mt-2 text-3xl font-extrabold text-forest">{count}</p>
              </article>
            ))}
          </div>

          <section className="mt-8 rounded-xl border border-forest/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-forest">Activity totals · last 30 days</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {summaryLabels.map(([key, label]) => (
                <div key={key} className="rounded-lg bg-cream p-4">
                  <p className="text-sm text-muted">{label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-forest">{report.last30Days[key]}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-xl border border-forest/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-forest">Daily website views · last 14 days</h2>
            <div className="mt-5 space-y-3">
              {recentDays.map((day) => (
                <div key={day.date} className="grid items-center gap-3 sm:grid-cols-[110px_1fr_45px]">
                  <time className="text-sm text-muted" dateTime={day.date}>{new Date(`${day.date}T00:00:00Z`).toLocaleDateString()}</time>
                  <progress className="analytics-progress" value={day.pageViews} max={maxDailyViews} aria-label={`${day.pageViews} page views`} />
                  <span className="text-right text-sm font-bold text-forest">{day.pageViews}</span>
                </div>
              ))}
            </div>
          </section>
          <p className="mt-5 text-xs leading-5 text-muted">Metrics are aggregate counts only, retained for up to 90 days. Page views do not store visitor identities or page URLs.</p>
        </>
      )}
    </section>
  );
}
