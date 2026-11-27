"use client";
import {
  Area, Bar, CartesianGrid, Cell, ComposedChart, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { Dashboard } from "@/lib/types";

export const STATUS_COLORS: Record<string, string> = {
  PLACED: "#2563eb", PAID: "#7c3aed", SHIPPED: "#d97706", DELIVERED: "#059669", CANCELLED: "#dc2626",
};
const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;
const short = (n: number) => (n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `₹${(n / 1e3).toFixed(0)}k` : `₹${n}`);
const tip = { contentStyle: { borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 } };

export function RevenueChart({ data }: { data: Dashboard["revenueByDay"] }) {
  const rows = data.map((d) => ({
    ...d, revenue: Number(d.revenue),
    label: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeOpacity={0.25} />
        <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} minTickGap={20} />
        <YAxis yAxisId="r" fontSize={12} tickLine={false} axisLine={false} tickFormatter={short} width={56} />
        <YAxis yAxisId="o" orientation="right" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} width={30} />
        <Tooltip {...tip} formatter={(v, name) => (name === "Revenue" ? inr(Number(v)) : v)} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
        <Bar yAxisId="o" dataKey="orders" name="Orders" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={18} />
        <Area yAxisId="r" type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#rev)" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function StatusDonut({ data }: { data: Dashboard["ordersByStatus"] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="donut-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" innerRadius={68} outerRadius={100} paddingAngle={2} stroke="none">
            {data.map((s) => <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? "#9ca3af"} />)}
          </Pie>
          <Tooltip {...tip} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center"><div><b>{total}</b><span>Total orders</span></div></div>
    </div>
  );
}
