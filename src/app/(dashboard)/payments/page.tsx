"use client";

import { CheckCircle2, Clock, CreditCard, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useConfirmSubscription, useSubscriptions } from "@/hooks/use-admin";
import { formatDate, formatMoney } from "@/lib/utils";
import type { SubscriptionStatus } from "@/types/api";

const STATUS_VARIANT: Record<SubscriptionStatus, "secondary" | "warning" | "success" | "destructive"> = {
  pending: "secondary",
  submitted: "warning",
  paid: "success",
  rejected: "destructive",
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  pending: "Pending",
  submitted: "Awaiting confirmation",
  paid: "Paid",
  rejected: "Rejected",
};

export default function PaymentsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSubscriptions({ status: status || undefined, page });
  const confirm = useConfirmSubscription();
  const counts = data?.summary?.status_counts;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Payments</h1>
        <p className="text-sm text-zinc-500">
          Package payments submitted by couples. Confirm a payment to mark it as paid.
        </p>
      </div>

      {counts ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Awaiting confirmation" value={counts.submitted ?? 0} icon={Clock} accent="amber" />
          <StatCard label="Paid" value={counts.paid ?? 0} icon={CheckCircle2} accent="emerald" />
          <StatCard label="Pending selection" value={counts.pending ?? 0} icon={CreditCard} accent="sky" />
          <StatCard label="Rejected" value={counts.rejected ?? 0} icon={XCircle} accent="rose" />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Select
          className="w-56"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="submitted">Awaiting confirmation</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending selection</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      {isLoading ? (
        <PageLoader label="Loading payments..." />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="No payments yet"
          description="Payments appear here once couples select a package and submit a payment."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wedding</TableHead>
                <TableHead>Couple</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-mono text-xs text-zinc-500">
                    {sub.wedding_code ?? `#${sub.wedding_id}`}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-800">
                    {sub.couple ?? sub.wedding_name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{sub.package?.name ?? "—"}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(sub.amount, sub.currency)}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {sub.payment_method ? (
                      <span>
                        <span className="uppercase">{sub.payment_method}</span>
                        {sub.payment_reference ? ` · ${sub.payment_reference}` : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[sub.status]}>
                      {STATUS_LABELS[sub.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {formatDate(sub.paid_at ?? sub.submitted_at ?? sub.created_at ?? null)}
                  </TableCell>
                  <TableCell className="text-right">
                    {sub.status === "submitted" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={confirm.isPending}
                          onClick={() =>
                            confirm.mutate({ subscriptionId: sub.id, paid: true })
                          }
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={confirm.isPending}
                          onClick={() =>
                            confirm.mutate({ subscriptionId: sub.id, paid: false })
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
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
