"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GREEN = "hsl(153 90% 32%)";

// Reliable width measurement (ResponsiveContainer misbehaves in sandboxed iframes)
function useMeasure() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  return { ref, width };
}

const axisTick = { fontSize: 11, fill: "hsl(215 12% 47%)" };
const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid hsl(214 20% 90%)",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

export interface RevenuePoint {
  label: string;
  received: number;
  unpaid: number;
  leads: number;
  shoots: number;
}

export function RevenueAreaChart({ data, symbol = "$" }: { data: RevenuePoint[]; symbol?: string }) {
  const { ref, width } = useMeasure();
  return (
    <div ref={ref} className="h-[260px] w-full">
      {width > 0 && (
        <AreaChart width={width} height={260} data={data} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="revGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
              <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="revRose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(340 75% 62%)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(340 75% 62%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214 20% 90%)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} minTickGap={16} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            width={52}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [
              `${symbol}${Number(value).toLocaleString()}`,
              name === "received" ? "Payments received" : "Unpaid payments",
            ]}
          />
          <Area isAnimationActive={false} type="monotone" dataKey="received" stroke={GREEN} strokeWidth={2.5} fill="url(#revGreen)" dot={false} activeDot={{ r: 4 }} />
          <Area isAnimationActive={false} type="monotone" dataKey="unpaid" stroke="hsl(340 75% 62%)" strokeWidth={2} fill="url(#revRose)" dot={false} />
        </AreaChart>
      )}
    </div>
  );
}

// Single-series area chart (payments)
export function MetricAreaChart({ data, dataKey, symbol = "$" }: { data: RevenuePoint[]; dataKey: keyof RevenuePoint; symbol?: string }) {
  const { ref, width } = useMeasure();
  return (
    <div ref={ref} className="h-[260px] w-full">
      {width > 0 && (
        <AreaChart width={width} height={260} data={data} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="metricGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
              <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214 20% 90%)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} minTickGap={16} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            width={52}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${symbol}${Number(value).toLocaleString()}`, "Payments"]} />
          <Area isAnimationActive={false} type="monotone" dataKey={dataKey as string} stroke={GREEN} strokeWidth={2.5} fill="url(#metricGreen)" dot={false} activeDot={{ r: 4 }} />
        </AreaChart>
      )}
    </div>
  );
}

// Count bar chart (leads / shoots)
export function MetricBarChart({ data, dataKey, label }: { data: RevenuePoint[]; dataKey: keyof RevenuePoint; label: string }) {
  const { ref, width } = useMeasure();
  return (
    <div ref={ref} className="h-[260px] w-full">
      {width > 0 && (
        <BarChart width={width} height={260} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214 20% 90%)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} minTickGap={16} />
          <YAxis tickLine={false} axisLine={false} tick={axisTick} allowDecimals={false} width={40} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value)}`, label]} cursor={{ fill: "hsl(153 40% 94%)" }} />
          <Bar isAnimationActive={false} dataKey={dataKey as string} fill={GREEN} radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      )}
    </div>
  );
}

export interface PieDatum {
  name: string;
  value: number;
}

const PIE_COLORS = [
  "hsl(153 90% 36%)",
  "hsl(199 70% 55%)",
  "hsl(43 90% 60%)",
  "hsl(340 75% 62%)",
  "hsl(265 55% 62%)",
  "hsl(174 60% 45%)",
  "hsl(24 85% 60%)",
  "hsl(215 20% 65%)",
];

export function LeadSourcesPie({ data }: { data: PieDatum[] }) {
  const { ref, width } = useMeasure();
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        No lead data yet
      </div>
    );
  }
  return (
    <div ref={ref} className="h-[240px] w-full">
      {width > 0 && (
        <PieChart width={width} height={240}>
          <Pie isAnimationActive={false} data={data} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={45} outerRadius={80} paddingAngle={2} stroke="none">
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid hsl(214 20% 90%)", fontSize: 12 }}
            formatter={(value, name) => [`${Number(value)} (${Math.round((Number(value) / total) * 100)}%)`, name]}
          />
          <Legend layout="horizontal" align="center" verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      )}
    </div>
  );
}
