"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge, statusVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { usePackages } from "@/hooks/use-admin";
import { useCreateWedding, useWeddings } from "@/hooks/use-weddings";
import { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const weddingSchema = z.object({
  wedding_name: z.string().min(1, "Wedding name is required"),
  bride_name: z.string().min(1, "Bride name is required"),
  groom_name: z.string().min(1, "Groom name is required"),
  wedding_date: z.string().optional(),
  wedding_time: z.string().optional(),
  ceremony_venue: z.string().optional(),
  reception_venue: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  package_id: z.string().optional(),
});

type WeddingForm = z.infer<typeof weddingSchema>;

export default function WeddingsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useWeddings({
    search: search || undefined,
    status: status || undefined,
    page,
  });
  const { data: packages } = usePackages();
  const createWedding = useCreateWedding();

  const form = useForm<WeddingForm>({
    resolver: zodResolver(weddingSchema),
    defaultValues: { wedding_name: "", bride_name: "", groom_name: "" },
  });

  const onCreate = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createWedding.mutateAsync({
        ...values,
        email: values.email || null,
        wedding_date: values.wedding_date || null,
        wedding_time: values.wedding_time || null,
        package_id: values.package_id ? Number(values.package_id) : null,
      });
      form.reset();
      setCreateOpen(false);
    } catch (error) {
      setFormError(apiErrorMessage(error));
    }
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Weddings</h1>
          <p className="text-sm text-zinc-500">Manage all wedding projects.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Wedding
        </Button>
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
          description="Create your first wedding project to get started."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New Wedding
            </Button>
          }
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Wedding"
        description="Start a new wedding project."
      >
        <form onSubmit={onCreate} className="space-y-3">
          <div>
            <Label htmlFor="wedding_name">Wedding name</Label>
            <Input id="wedding_name" {...form.register("wedding_name")} />
            {form.formState.errors.wedding_name ? (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.wedding_name.message}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bride_name">Bride name</Label>
              <Input id="bride_name" {...form.register("bride_name")} />
              {form.formState.errors.bride_name ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.bride_name.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="groom_name">Groom name</Label>
              <Input id="groom_name" {...form.register("groom_name")} />
              {form.formState.errors.groom_name ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.groom_name.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="wedding_date">Date</Label>
              <Input id="wedding_date" type="date" {...form.register("wedding_date")} />
            </div>
            <div>
              <Label htmlFor="wedding_time">Time</Label>
              <Input id="wedding_time" type="time" {...form.register("wedding_time")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
          </div>
          <div>
            <Label htmlFor="ceremony_venue">Ceremony venue</Label>
            <Input id="ceremony_venue" {...form.register("ceremony_venue")} />
          </div>
          <div>
            <Label htmlFor="reception_venue">Reception venue</Label>
            <Input id="reception_venue" {...form.register("reception_venue")} />
          </div>
          <div>
            <Label htmlFor="package_id">Package</Label>
            <Select id="package_id" {...form.register("package_id")}>
              <option value="">No package</option>
              {(packages ?? []).map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </Select>
          </div>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createWedding.isPending}>
              {createWedding.isPending ? "Creating..." : "Create Wedding"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
