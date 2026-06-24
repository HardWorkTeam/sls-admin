"use client";

import {
  CalendarHeart,
  CheckCircle2,
  MailCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { StatCard } from "@/components/ui/stat-card";
import { Badge, statusVariant } from "@/components/ui/badge";
import { PlatformAnalytics } from "@/components/dashboard/platform-analytics";
import { useDashboardOverview } from "@/hooks/use-admin";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const hasRole = useAuthStore((state) => state.hasRole);

  // Super admins see platform-wide business analytics; organizers keep the
  // wedding/RSVP-focused dashboard.
  if (hasRole("super_admin")) {
    return <PlatformAnalytics />;
  }

  return <OrganizerDashboard />;
}

function OrganizerDashboard() {
  const { data, isLoading, isError } = useDashboardOverview();

  if (isLoading) return <PageLoader label="Loading dashboard..." />;
  if (isError || !data) {
    return <p className="text-sm text-red-600">Unable to load the dashboard.</p>;
  }

  const trendMax = Math.max(...data.charts.rsvp_trend.map((point) => point.total), 1);
  const distribution = Object.entries(data.charts.guest_distribution);
  const distributionTotal = distribution.reduce((sum, [, total]) => sum + total, 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">
          Overview of all weddings, guests and RSVP activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Weddings"
          value={data.cards.total_weddings}
          icon={CalendarHeart}
          accent="emerald"
        />
        <StatCard
          label="Total Guests"
          value={data.cards.total_guests}
          icon={Users}
          accent="sky"
        />
        <StatCard
          label="Total RSVP"
          value={data.cards.total_rsvp}
          icon={MailCheck}
          accent="amber"
        />
        <StatCard
          label="Attendance Rate"
          value={`${data.cards.attendance_rate}%`}
          icon={CheckCircle2}
          accent="rose"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>RSVP Trend (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.charts.rsvp_trend.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                No RSVP activity yet.
              </p>
            ) : (
              <div className="flex h-44 items-end gap-2">
                {data.charts.rsvp_trend.map((point) => (
                  <div
                    key={point.date}
                    className="group flex flex-1 flex-col items-center gap-1"
                    title={`${point.date}: ${point.total}`}
                  >
                    <span className="text-xs text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100">
                      {point.total}
                    </span>
                    <div
                      className="w-full max-w-10 rounded-t bg-emerald-500/90 transition-colors group-hover:bg-emerald-600"
                      style={{ height: `${(point.total / trendMax) * 100}%`, minHeight: 6 }}
                    />
                    <span className="text-[10px] text-zinc-400">
                      {point.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guest Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {distribution.length === 0 ? (
                <p className="text-sm text-zinc-500">No guests yet.</p>
              ) : (
                distribution.map(([type, total]) => (
                  <div key={type}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="capitalize text-zinc-600">{type}</span>
                      <span className="font-medium text-zinc-800">{total}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${(total / distributionTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wedding Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Object.entries(data.charts.wedding_status).map(([status, total]) => (
                <Badge key={status} variant={statusVariant(status)}>
                  <span className="capitalize">{status}</span>: {total}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
