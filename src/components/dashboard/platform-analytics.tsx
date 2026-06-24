"use client";

import {
  Box,
  CalendarHeart,
  DollarSign,
  Users,
} from "lucide-react";
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { StatCard } from "@/components/ui/stat-card";
import { usePlatformAnalytics } from "@/hooks/use-admin";

// Pastel palette aligned with the rest of the admin portal.
const DONUT_COLORS = [
  "#10b981", // emerald
  "#0ea5e9", // sky
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#ec4899", // pink
];

const BAR_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f43f5e"];

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

// "2026-06-23" -> "06-23"
function shortDay(iso: string) {
  return iso.length >= 10 ? iso.slice(5) : iso;
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-72 items-center justify-center text-sm text-zinc-400">
      {label}
    </div>
  );
}

export function PlatformAnalytics() {
  const { data, isLoading, isError } = usePlatformAnalytics();

  if (isLoading) return <PageLoader label="Loading platform analytics..." />;
  if (isError || !data) {
    return <p className="text-sm text-red-600">Unable to load platform analytics.</p>;
  }

  const { cards, charts, currency } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Platform Analytics</h1>
        <p className="text-sm text-zinc-500">
          Monitor your SaaS platform&apos;s business health, revenue, and feature usage.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Registered Users"
          value={cards.total_registered_users}
          icon={Users}
          accent="sky"
        />
        <StatCard
          label="Total Weddings Created"
          value={cards.total_weddings_created}
          icon={CalendarHeart}
          accent="rose"
        />
        <StatCard
          label="Total Revenue (Packages)"
          value={money(cards.total_revenue, currency)}
          icon={DollarSign}
          accent="emerald"
        />
        <StatCard
          label="Active Selling Packages"
          value={cards.active_selling_packages}
          icon={Box}
          accent="amber"
        />
      </div>

      {/* Revenue trend + system growth */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {charts.revenue_trend.length === 0 ? (
              <EmptyChart label="No revenue in the last 30 days." />
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <AreaChart
                  data={charts.revenue_trend}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={shortDay}
                    tick={{ fontSize: 12, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(v: number) => money(v, currency)}
                    tick={{ fontSize: 12, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value) => [money(Number(value), currency), "Revenue"]}
                    labelFormatter={(label) => shortDay(String(label))}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#059669"
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Growth (New Users)</CardTitle>
          </CardHeader>
          <CardContent>
            {charts.system_growth.length === 0 ? (
              <EmptyChart label="No new users in the last 30 days." />
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <BarChart
                  data={charts.system_growth}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={shortDay}
                    tick={{ fontSize: 12, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    formatter={(value) => [Number(value), "New users"]}
                    labelFormatter={(label) => shortDay(String(label))}
                  />
                  <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Package sales + template usage */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Package Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {charts.package_sales.length === 0 ? (
              <EmptyChart label="No package sales yet." />
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <BarChart
                  layout="vertical"
                  data={charts.package_sales}
                  margin={{ top: 8, right: 24, left: 12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(v: number) => money(v, currency)}
                    tick={{ fontSize: 12, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="package_name"
                    tick={{ fontSize: 12, fill: "#3f3f46" }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value, _name, item) => [
                      `${money(Number(value), currency)} (${(item as { payload?: { count?: number } })?.payload?.count ?? 0} sold)`,
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={36}>
                    {charts.package_sales.map((_, index) => (
                      <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invitation Template Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {charts.template_usage.length === 0 ? (
              <EmptyChart label="No invitations created yet." />
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <PieChart>
                  <Tooltip formatter={(value) => [Number(value), "Invitations"]} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Pie
                    data={charts.template_usage}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {charts.template_usage.map((_, index) => (
                      <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
