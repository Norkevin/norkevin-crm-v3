"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, TrendingUp, CalendarDays } from "lucide-react";
import { useCRM } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { StatusBadge, TypeDot } from "@/components/status-badge";
import {
  RevenueAreaChart,
  MetricAreaChart,
  MetricBarChart,
  LeadSourcesPie,
  type RevenuePoint,
} from "@/components/charts";
import { formatCurrency, formatDate, formatTime, invoiceBalance } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Period = "7" | "30" | "mtd" | "ytd";
const PERIODS: { key: Period; label: string }[] = [
  { key: "7", label: "7 Days" },
  { key: "30", label: "30 Days" },
  { key: "mtd", label: "Mtd" },
  { key: "ytd", label: "Ytd" },
];

function periodRange(period: Period): { from: Date; to: Date } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  if (period === "7") from.setDate(from.getDate() - 6);
  else if (period === "30") from.setDate(from.getDate() - 29);
  else if (period === "mtd") from.setDate(1);
  else from.setMonth(0, 1);
  return { from, to };
}

export default function DashboardPage() {
  const store = useCRM(); const leads = store.leads || []; const jobs = store.jobs || []; const appointments = store.appointments || []; const invoices = store.invoices || []; const settings = store.settings || {};
  const [period, setPeriod] = useState<Period>("ytd");
  const [jobType, setJobType] = useState<string>("all");
  const [tab, setTab] = useState<"leads" | "shoots" | "payments" | "revenue">("revenue");

  const { from, to } = periodRange(period);
  const symbol = settings.currency;

  const inRange = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
    return d >= from && d <= to;
  };
  const matchType = (t: string) => jobType === "all" || t === jobType;

  // ── Metrics ──
  const periodLeads = (leads || []).filter((l) => inRange(l.createdAt) && matchType(l.jobType));
  const periodShoots = (appointments || []).filter(
    (a) => inRange(a.date) && (a.type === "Main Shoot" || a.type === "Extra Shoot"),
  );
  const periodPayments = (invoices || []).flatMap((inv) =>
    matchType(jobs.find((j) => j.id === inv.jobId)?.jobType ?? "")
      ? (inv.payments || []).filter((p) => inRange(p.date))
      : [],
  );
  const paymentsTotal = periodPayments.reduce((s, p) => s + p.amount, 0);
  const unpaidTotal = (invoices || []).reduce((s, inv) => s + Math.max(0, invoiceBalance(inv)), 0);

  // ── Revenue chart data ──
  const revenueData: RevenuePoint[] = useMemo(() => {
    const makeBucket = (label: string, bStart: Date, bEnd: Date): RevenuePoint => {
      let received = 0;
      let unpaid = 0;
      for (const inv of invoices) {
        for (const p of (inv.payments || [])) {
          const d = new Date(`${p.date}T00:00:00`);
          if (d >= bStart && d < bEnd) received += p.amount;
        }
        const due = new Date(`${inv.dueDate}T00:00:00`);
        if (due >= bStart && due < bEnd) unpaid += Math.max(0, invoiceBalance(inv));
      }
      const leadCount = (leads || []).filter((l) => {
        const d = new Date(`${l.createdAt}T00:00:00`);
        return d >= bStart && d < bEnd;
      }).length;
      const shootCount = (appointments || []).filter((a) => {
        const d = new Date(`${a.date}T00:00:00`);
        return d >= bStart && d < bEnd && (a.type === "Main Shoot" || a.type === "Extra Shoot");
      }).length;
      return { label, received, unpaid, leads: leadCount, shoots: shootCount };
    };

    const buckets: RevenuePoint[] = [];
    if (period === "ytd") {
      const year = to.getFullYear();
      for (let m = 0; m <= to.getMonth(); m++) {
        const s = new Date(year, m, 1);
        const e = new Date(year, m + 1, 1);
        buckets.push(makeBucket(s.toLocaleDateString("en-US", { month: "short" }), s, e));
      }
    } else if (period === "mtd") {
      // weekly buckets across the current month
      const start = new Date(from);
      let wStart = new Date(start);
      let week = 1;
      while (wStart <= to) {
        const wEnd = new Date(wStart);
        wEnd.setDate(wEnd.getDate() + 7);
        buckets.push(makeBucket(`Wk ${week}`, new Date(wStart), wEnd));
        wStart = wEnd;
        week++;
      }
    } else {
      // daily-ish buckets for 7 / 30 days
      const count = period === "7" ? 7 : 10;
      const span = to.getTime() - from.getTime();
      const step = span / count;
      for (let i = 0; i < count; i++) {
        const bStart = new Date(from.getTime() + step * i);
        const bEnd = new Date(from.getTime() + step * (i + 1));
        buckets.push(
          makeBucket(bStart.toLocaleDateString("en-US", { day: "numeric", month: "short" }), bStart, bEnd),
        );
      }
    }
    return buckets;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, invoices, leads, appointments]);

  // ── Lead sources pie ──
  const leadSources = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of leads) map.set(l.source, (map.get(l.source) ?? 0) + 1);
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [leads]);

  // ── Upcoming shoots ──
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = [...appointments]
    .filter((a) => new Date(`${a.date}T00:00:00`) >= today)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 6);

  const recentLeads = [...leads]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const tabs = [
    { key: "leads" as const, label: "Leads", value: String(periodLeads.length) },
    { key: "shoots" as const, label: "Shoots", value: String(periodShoots.length) },
    { key: "payments" as const, label: "Payments", value: formatCurrency(paymentsTotal, symbol) },
    { key: "revenue" as const, label: "Revenue Comparison", value: "" },
  ];

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={jobType} onValueChange={setJobType}>
          <SelectTrigger className="h-9 w-[180px] bg-white text-sm">
            <SelectValue placeholder="All Job Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Job Types</SelectItem>
            {settings.jobTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-md border bg-white">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  period === p.key
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-2 rounded-md border bg-white px-3 py-1.5 text-xs text-muted-foreground sm:flex">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(from.toISOString())} → {formatDate(to.toISOString())}
          </div>
        </div>
      </div>

      {/* Main analytics panel */}
      <Card className="overflow-hidden p-0 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left: tabs + chart */}
          <div className="border-b p-5 lg:col-span-2 lg:border-b-0 lg:border-r">
            <div className="mb-5 flex flex-wrap gap-x-8 gap-y-2 border-b pb-3">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "relative pb-3 text-left transition-colors -mb-3",
                    tab === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{t.label}</span>
                    {t.value && <span className="text-sm font-bold text-primary">{t.value}</span>}
                  </div>
                  {tab === t.key && (
                    <span className="absolute -bottom-[1px] left-0 h-[3px] w-full rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
            {tab === "revenue" && <RevenueAreaChart data={revenueData} symbol={symbol} />}
            {tab === "payments" && <MetricAreaChart data={revenueData} dataKey="received" symbol={symbol} />}
            {tab === "leads" && <MetricBarChart data={revenueData} dataKey="leads" label="New leads" />}
            {tab === "shoots" && <MetricBarChart data={revenueData} dataKey="shoots" label="Shoots" />}
            {tab === "revenue" && (
              <div className="mt-2 flex items-center gap-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Payments Received
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Unpaid Payments
                </span>
              </div>
            )}
          </div>

          {/* Right: lead sources */}
          <div className="p-5">
            <h3 className="text-sm font-semibold">Lead Sources</h3>
            <p className="mb-2 text-xs text-muted-foreground">All Leads and Jobs</p>
            <LeadSourcesPie data={leadSources} />
          </div>
        </div>
      </Card>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="New Leads" value={String(periodLeads.length)} sub="in period" />
        <KpiCard label="Upcoming Shoots" value={String(periodShoots.length)} sub="scheduled" />
        <KpiCard label="Payments Received" value={formatCurrency(paymentsTotal, symbol)} sub="in period" accent />
        <KpiCard label="Outstanding" value={formatCurrency(unpaidTotal, symbol)} sub="unpaid balance" warn />
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Upcoming shoots */}
        <Card className="p-0 shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-3.5">
            <h3 className="text-sm font-semibold">Upcoming Shoots &amp; Appointments</h3>
            <Link
              href="/calendar"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y">
            {upcoming.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No upcoming events</p>
            )}
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <div className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                  {formatDate(a.date)}
                </div>
                <TypeDot type={a.type} />
                <div className="w-16 shrink-0 text-xs font-semibold">{formatTime(a.time)}</div>
                <div className="flex-1 truncate">{a.title}</div>
                <StatusBadge status={a.type} />
              </div>
            ))}
          </div>
        </Card>

        {/* Recent leads */}
        <Card className="p-0 shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-3.5">
            <h3 className="text-sm font-semibold">Most Recent Leads</h3>
            <Link
              href="/leads"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-2 font-medium">Created</th>
                  <th className="px-2 py-2 font-medium">Lead</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-5 py-2 font-medium">Next Task</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/40">
                    <td className="whitespace-nowrap px-5 py-2.5 text-xs text-muted-foreground">
                      {formatDate(l.createdAt)}
                    </td>
                    <td className="px-2 py-2.5 font-medium">
                      <Link href="/leads" className="hover:text-primary">
                        {l.name}
                      </Link>
                    </td>
                    <td className="px-2 py-2.5">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-5 py-2.5 text-xs text-muted-foreground">
                      {l.nextTask ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
  warn,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <Card className="p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tracking-tight",
          accent && "text-primary",
          warn && "text-rose-500",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
        <TrendingUp className="h-3 w-3" /> {sub}
      </p>
    </Card>
  );
}
