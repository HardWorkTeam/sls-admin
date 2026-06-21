"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { PageLoader } from "@/components/ui/spinner";
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

const STATUS_VARIANT: Record<string, "secondary" | "warning" | "success" | "destructive"> = {
  pending: "secondary",
  submitted: "warning",
  paid: "success",
  cancelled: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting payment",
  submitted: "Awaiting confirmation",
  paid: "Paid",
  cancelled: "Cancelled",
};

export default function PaymentsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSubscriptions({ status: status || undefined, page });
  const confirm = useConfirmSubscription();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Payments</h1>
        <p className="text-sm text-zinc-500">
          Package payments from couples. Confirm a payment once you&apos;ve
          received it.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          className="w-52"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="submitted">Awaiting confirmation</option>
          <option value="pending">Awaiting payment</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {isLoading ? (
        <PageLoader label="Loading payments..." />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="No payments yet"
          description="Payments appear here once couples select a package and submit payment."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wedding</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-40">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium text-zinc-800">
                    {sub.wedding?.wedding_name ?? `#${sub.wedding_id}`}
                  </TableCell>
                  <TableCell>{sub.package_name ?? "—"}</TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(sub.amount, sub.currency)}
                  </TableCell>
                  <TableCell className="uppercase text-zinc-600">
                    {sub.payment_method ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-500">
                    {sub.payment_reference ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[sub.status] ?? "secondary"}>
                      {STATUS_LABELS[sub.status] ?? sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sub.status === "submitted" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={confirm.isPending}
                          onClick={() => confirm.mutate({ id: sub.id, paid: true })}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={confirm.isPending}
                          onClick={() => confirm.mutate({ id: sub.id, paid: false })}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : sub.status === "paid" ? (
                      <span className="text-xs text-zinc-500">
                        {sub.paid_at ? formatDate(sub.paid_at) : "Paid"}
                      </span>
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
