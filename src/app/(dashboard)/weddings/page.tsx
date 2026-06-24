"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge, statusVariant } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
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
import { useWeddings } from "@/hooks/use-weddings";
import { formatDate } from "@/lib/utils";

const PAYMENT_VARIANT: Record<string, "secondary" | "warning" | "success" | "destructive"> = {
  paid: "success",
  submitted: "warning",
  pending: "secondary",
  unpaid: "secondary",
  rejected: "destructive",
};

const PAYMENT_LABELS: Record<string, string> = {
  paid: "Paid",
  submitted: "Awaiting",
  pending: "Pending",
  unpaid: "Unpaid",
  rejected: "Rejected",
};

export default function WeddingsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useWeddings({
    search: search || undefined,
    status: status || undefined,
    page,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Weddings</h1>
        <p className="text-sm text-zinc-500">
          Oversee all wedding projects. Couples create their own weddings from
          the client portal.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search weddings..."
            className="pl-9"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          className="w-44"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {isLoading ? (
        <PageLoader label="Loading weddings..." />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="No weddings found"
          description="Weddings appear here once couples create them in the client portal."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Wedding</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((wedding) => (
                <TableRow key={wedding.id}>
                  <TableCell className="font-mono text-xs text-zinc-500">
                    {wedding.wedding_code}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/weddings/${wedding.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {wedding.wedding_name}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {wedding.bride_name} & {wedding.groom_name}
                    </p>
                  </TableCell>
                  <TableCell>{formatDate(wedding.wedding_date)}</TableCell>
                  <TableCell>{wedding.guests_count ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(wedding.status)}>
                      <span className="capitalize">{wedding.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{wedding.package?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={PAYMENT_VARIANT[wedding.payment_status ?? "unpaid"] ?? "secondary"}>
                      {PAYMENT_LABELS[wedding.payment_status ?? "unpaid"] ?? "Unpaid"}
                    </Badge>
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
