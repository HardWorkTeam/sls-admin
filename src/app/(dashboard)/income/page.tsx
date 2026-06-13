"use client";

import { DollarSign, Receipt, Wallet } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { PageLoader } from "@/components/ui/spinner";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIncome, useIncomeSummary } from "@/hooks/use-admin";
import { formatDate, formatMoney } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "secondary" | "warning" | "success" | "destructive"> = {
  draft: "secondary",
  published: "success",
  completed: "warning",
  cancelled: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  published: "In Progress",
  completed: "Finished",
  cancelled: "Cancelled",
};

export default function IncomePage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useIncome({ status: status || undefined, page });
  const { data: summary } = useIncomeSummary();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Platform Income</h1>
        <p className="text-sm text-zinc-500">
          Revenue from package purchases across all weddings.
        </p>
      </div>

      {summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Income"
            value={formatMoney(summary.total_income, summary.currency)}
            icon={DollarSign}
            accent="emerald"
          />
          <StatCard
            label="Subscriptions"
            value={summary.total_subscriptions}
            icon={Receipt}
            accent="sky"
          />
          {summary.by_package.slice(0, 2).map((pkg) => (
            <StatCard
              key={pkg.package_id ?? pkg.package_name}
              label={`${pkg.package_name} (${pkg.count})`}
              value={formatMoney(pkg.amount, summary.currency)}
              icon={Wallet}
              accent="amber"
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Select
          className="w-48"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All event statuses</option>
          <option value="published">In Progress</option>
          <option value="completed">Finished</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {isLoading ? (
        <PageLoader label="Loading income..." />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="No income recorded"
          description="Platform income appears once weddings are assigned a package."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event ID</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((row) => (
                <TableRow key={row.event_id}>
                  <TableCell className="font-mono text-xs text-zinc-500">
                    {row.wedding_code}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-800">
                    {row.event_name}
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {row.user_name ?? `#${row.user_id ?? "—"}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.package_name ?? "—"}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(row.amount, row.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[row.event_status] ?? "secondary"}>
                      {STATUS_LABELS[row.event_status] ?? row.event_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {row.purchased_at ? formatDate(row.purchased_at) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
