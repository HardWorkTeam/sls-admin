"use client";

import {
  CheckCircle2,
  Circle,
  Download,
  Pencil,
  Plus,
  QrCode,
  ScanLine,
  Search,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
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
import {
  useBulkInvite,
  useCheckInStats,
  useCreateGuest,
  useDeleteGuest,
  useGuestGroups,
  useGuests,
  useImportGuests,
  useSetCheckIn,
  useUpdateGuest,
} from "@/hooks/use-guests";
import { useInvitations } from "@/hooks/use-invitations";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { guestService } from "@/services/guest-service";
import type { Guest } from "@/types/api";
import { CheckInScanner } from "./check-in-scanner";
import { GuestQrDialog } from "./guest-qr-dialog";

// Public RSVP site base used to build personalized invitation links.
const RSVP_URL = process.env.NEXT_PUBLIC_RSVP_URL ?? "http://localhost:3002";

const guestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  note: z.string().optional(),
  is_vip: z.boolean().optional(),
  guest_group_id: z.string().optional(),
});

type GuestForm = z.infer<typeof guestSchema>;

export function GuestsTab({
  weddingId,
  canCheckIn = true,
}: {
  weddingId: number;
  // Whether the wedding's plan includes wedding-day QR check-in. When false the
  // scanner, per-guest QR and arrival column are hidden (API also 403s).
  canCheckIn?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [groupId, setGroupId] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [bulkInvitationId, setBulkInvitationId] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Wedding-day check-in UI state.
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrGuest, setQrGuest] = useState<Guest | null>(null);

  // Debounce the search term so typing doesn't fire a request per keystroke —
  // the term is part of the query key, so only the settled value hits the API.
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data, isLoading } = useGuests(weddingId, {
    search: debouncedSearch || undefined,
    guest_group_id: groupId ? Number(groupId) : undefined,
    page,
  });
  const { data: groups } = useGuestGroups(weddingId);
  const { data: invitations } = useInvitations(weddingId);

  const createGuest = useCreateGuest(weddingId);
  const updateGuest = useUpdateGuest(weddingId);
  const deleteGuest = useDeleteGuest(weddingId);
  const importGuests = useImportGuests(weddingId);
  const bulkInvite = useBulkInvite(weddingId);
  const setCheckIn = useSetCheckIn(weddingId);
  const { data: checkInStats } = useCheckInStats(weddingId, canCheckIn);
  const confirm = useConfirm();

  const toggleCheckIn = (guest: Guest) => {
    setError(null);
    setCheckIn
      .mutateAsync({ guestId: guest.id, arrived: !guest.checked_in_at })
      .catch((err) => setError(apiErrorMessage(err)));
  };

  const form = useForm<GuestForm>({ resolver: zodResolver(guestSchema) });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", phone: "", email: "", address: "", note: "", is_vip: false, guest_group_id: "" });
    setDialogOpen(true);
  };

  const openEdit = (guest: Guest) => {
    setEditing(guest);
    form.reset({
      name: guest.name,
      phone: guest.phone ?? "",
      email: guest.email ?? "",
      address: guest.address ?? "",
      note: guest.note ?? "",
      is_vip: guest.is_vip,
      guest_group_id: guest.group ? String(guest.group.id) : "",
    });
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const payload = {
      ...values,
      email: values.email || null,
      guest_group_id: values.guest_group_id ? Number(values.guest_group_id) : null,
    };
    try {
      if (editing) {
        await updateGuest.mutateAsync({ guestId: editing.id, payload });
      } else {
        await createGuest.mutateAsync(payload);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  });

  const onImport = async (file: File) => {
    setFeedback(null);
    setError(null);
    try {
      const result = await importGuests.mutateAsync(file);
      setFeedback(result.message);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const onExport = async () => {
    const blob = await guestService.exportCsv(weddingId);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "guests.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onBulkInvite = async () => {
    if (!bulkInvitationId || selected.length === 0) return;
    setError(null);
    try {
      const result = await bulkInvite.mutateAsync({
        guestIds: selected,
        invitationId: Number(bulkInvitationId),
      });
      setFeedback(result.message);
      setSelected([]);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const toggleSelected = (id: number) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );

  // Copy a personalized invitation link for a guest. Uses the guest's assigned
  // invitation, falling back to the wedding's first invitation when none is set.
  const copyInviteLink = async (guest: Guest) => {
    setFeedback(null);
    setError(null);
    const code = guest.invitation?.invitation_code ?? invitations?.[0]?.invitation_code;
    if (!code) {
      setError("Create an invitation first, then you can send a personalized link.");
      return;
    }
    // Include the guest's short check-in code so their invite shows a personal
    // "my check-in QR" pass they can present at the door on the wedding day —
    // only when the plan includes the check-in feature. The code drives both
    // the QR and the readable text on the pass.
    const tokenParam =
      canCheckIn && guest.check_in_code ? `&t=${guest.check_in_code}` : "";
    const link = `${RSVP_URL}/invite/${code}?to=${encodeURIComponent(guest.name)}${tokenParam}`;
    try {
      await navigator.clipboard.writeText(link);
      setFeedback(`Invitation link for ${guest.name} copied to clipboard.`);
    } catch {
      // Clipboard API may be unavailable (e.g. non-secure context) — surface the
      // link so the user can copy it manually.
      setError(`Couldn't copy automatically. Link: ${link}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search guests..."
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
          value={groupId}
          onChange={(event) => {
            setGroupId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All groups</option>
          {(groups ?? []).map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
        <div className="ml-auto flex flex-wrap gap-2">
          <input
            ref={fileInput}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImport(file);
              event.target.value = "";
            }}
          />
          <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
          {canCheckIn ? (
            <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
              <ScanLine className="h-4 w-4" /> Check-in Scanner
            </Button>
          ) : null}
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Guest
          </Button>
        </div>
      </div>

      {canCheckIn && checkInStats && checkInStats.total > 0 ? (
        <p className="text-sm text-zinc-500">
          <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-600" />
          <span className="font-medium text-emerald-700">{checkInStats.arrived}</span>{" "}
          of {checkInStats.total} guests checked in ({checkInStats.pending} not yet
          arrived).
        </p>
      ) : null}

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
          <p className="text-sm text-emerald-800">{selected.length} selected</p>
          <Select
            className="w-56"
            value={bulkInvitationId}
            onChange={(event) => setBulkInvitationId(event.target.value)}
          >
            <option value="">Choose invitation...</option>
            {(invitations ?? []).map((invitation) => (
              <option key={invitation.id} value={invitation.id}>
                {invitation.title ?? invitation.invitation_code}
              </option>
            ))}
          </Select>
          <Button
            size="sm"
            onClick={onBulkInvite}
            disabled={!bulkInvitationId || bulkInvite.isPending}
          >
            Bulk Invite
          </Button>
        </div>
      ) : null}

      {feedback ? <p className="text-sm text-emerald-700">{feedback}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {isLoading ? (
        <PageLoader label="Loading guests..." />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="No guests yet"
          description="Add guests manually or import a CSV file (columns: name, phone, email, address, group, is_vip, note)."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Guest
            </Button>
          }
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={selected.length === data.data.length && data.data.length > 0}
                    onChange={(event) =>
                      setSelected(event.target.checked ? data.data.map((g) => g.id) : [])
                    }
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Table / Seat</TableHead>
                <TableHead>Invitation</TableHead>
                {canCheckIn ? <TableHead>Arrived</TableHead> : null}
                <TableHead className={canCheckIn ? "w-32" : "w-24"}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Select ${guest.name}`}
                      checked={selected.includes(guest.id)}
                      onChange={() => toggleSelected(guest.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-zinc-800">
                      {guest.name}{" "}
                      {guest.is_vip ? <Badge variant="warning">VIP</Badge> : null}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-zinc-700">{guest.phone ?? "—"}</p>
                    <p className="text-xs text-zinc-500">{guest.email ?? ""}</p>
                  </TableCell>
                  <TableCell>{guest.group?.name ?? "—"}</TableCell>
                  <TableCell>
                    {guest.seating?.table
                      ? `${guest.seating.table.table_name}${guest.seating.seat_number ? ` · #${guest.seating.seat_number}` : ""}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {guest.invitation ? (
                      <span className="font-mono text-xs text-zinc-500">
                        {guest.invitation.invitation_code}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  {canCheckIn ? (
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => toggleCheckIn(guest)}
                        disabled={setCheckIn.isPending}
                        title={
                          guest.checked_in_at
                            ? `Arrived ${new Date(guest.checked_in_at).toLocaleString()} — click to undo`
                            : "Mark as arrived"
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                          guest.checked_in_at
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
                        )}
                      >
                        {guest.checked_in_at ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Circle className="h-3.5 w-3.5" />
                        )}
                        {guest.checked_in_at ? "Arrived" : "Mark"}
                      </button>
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <div className="flex gap-1">
                      {canCheckIn ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Show check-in QR for ${guest.name}`}
                          title="Check-in QR code"
                          onClick={() => setQrGuest(guest)}
                        >
                          <QrCode className="h-4 w-4 text-zinc-600" />
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Copy invitation link for ${guest.name}`}
                        title="Copy personalized invitation link"
                        onClick={() => copyInviteLink(guest)}
                      >
                        <Send className="h-4 w-4 text-emerald-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${guest.name}`}
                        onClick={() => openEdit(guest)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${guest.name}`}
                        onClick={async () => {
                          if (
                            await confirm({
                              title: `Delete guest "${guest.name}"?`,
                              description:
                                "The guest and their RSVP/seating assignments will be removed.",
                            })
                          ) {
                            deleteGuest.mutate(guest.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? `Edit ${editing.name}` : "Add Guest"}
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="guest-name">Name</Label>
            <Input id="guest-name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="guest-phone">Phone</Label>
              <Input id="guest-phone" {...form.register("phone")} />
            </div>
            <div>
              <Label htmlFor="guest-email">Email</Label>
              <Input id="guest-email" type="email" {...form.register("email")} />
            </div>
          </div>
          <div>
            <Label htmlFor="guest-address">Address</Label>
            <Input id="guest-address" {...form.register("address")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="guest-group">Group</Label>
              <Select id="guest-group" {...form.register("guest_group_id")}>
                <option value="">No group</option>
                {(groups ?? []).map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end gap-2 pb-1.5">
              <input id="guest-vip" type="checkbox" {...form.register("is_vip")} />
              <Label htmlFor="guest-vip">VIP guest</Label>
            </div>
          </div>
          <div>
            <Label htmlFor="guest-note">Note</Label>
            <Input id="guest-note" {...form.register("note")} />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGuest.isPending || updateGuest.isPending}
            >
              {editing ? "Save Changes" : "Add Guest"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Wedding-day check-in scanner */}
      <Dialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        title="Check-in Scanner"
        description="Scan each guest's invitation QR code as they arrive."
        className="max-w-md"
      >
        {scannerOpen ? <CheckInScanner weddingId={weddingId} /> : null}
      </Dialog>

      {/* Per-guest QR code */}
      <GuestQrDialog
        weddingId={weddingId}
        guest={qrGuest}
        onClose={() => setQrGuest(null)}
      />
    </div>
  );
}
