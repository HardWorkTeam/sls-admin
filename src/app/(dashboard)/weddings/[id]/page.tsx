"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge, statusVariant } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { TabPanel, Tabs } from "@/components/ui/tabs";
import { ExpensesTab } from "@/components/wedding/expenses-tab";
import { GalleryTab } from "@/components/wedding/gallery-tab";
import { GiftsTab } from "@/components/wedding/gifts-tab";
import { GuestsTab } from "@/components/wedding/guests-tab";
import { InvitationsTab } from "@/components/wedding/invitations-tab";
import { OverviewTab } from "@/components/wedding/overview-tab";
import { RsvpTab } from "@/components/wedding/rsvp-tab";
import { SeatingTab } from "@/components/wedding/seating-tab";
import { TimelineTab } from "@/components/wedding/timeline-tab";
import { useWedding } from "@/hooks/use-weddings";
import type { GatedModule } from "@/types/api";

// Tab gating mirrors the couple portal (client-shell): features unlock only
// once the wedding holds a PAID plan. `module` tabs need that module in the
// paid package; `requiresPackage` tabs need any paid plan. Tabs with neither
// (Overview, Invitations) always show, so an admin can still inspect a
// wedding that has not selected a package yet.
const TABS: {
  value: string;
  label: string;
  module?: GatedModule;
  requiresPackage?: boolean;
}[] = [
  { value: "overview", label: "Overview" },
  { value: "invitations", label: "Invitations" },
  { value: "guests", label: "Guests", requiresPackage: true },
  { value: "rsvp", label: "RSVP", module: "rsvp" },
  { value: "seating", label: "Seating", module: "seating" },
  { value: "gifts", label: "Gifts", module: "gifts" },
  { value: "expenses", label: "Expenses", module: "expense" },
  { value: "timeline", label: "Timeline", module: "timeline" },
  { value: "gallery", label: "Gallery", module: "gallery" },
];

export default function WeddingDetailPage() {
  const params = useParams<{ id: string }>();
  const weddingId = Number(params.id);
  const [tab, setTab] = useState("overview");

  const { data: wedding, isLoading } = useWedding(weddingId);

  if (isLoading) return <PageLoader label="Loading wedding..." />;
  if (!wedding) {
    return <p className="text-sm text-red-600">Wedding not found.</p>;
  }

  // Only a PAID plan unlocks features. Key off `has_active_plan` (any paid
  // subscription) rather than `payment_status` (the latest subscription), so a
  // Free-plan wedding mid-upgrade keeps its features while payment is pending.
  const isPaid = wedding.has_active_plan ?? wedding.payment_status === "paid";
  const capabilities = wedding.capabilities;
  const visibleTabs = TABS.filter((t) => {
    if (t.module) return Boolean(capabilities?.modules[t.module]);
    if (t.requiresPackage) return isPaid;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/weddings"
            className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:text-zinc-800"
            aria-label="Back to weddings"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-zinc-900">
                {wedding.wedding_name}
              </h1>
              <Badge variant={statusVariant(wedding.status)}>
                <span className="capitalize">{wedding.status}</span>
              </Badge>
            </div>
            <p className="text-sm text-zinc-500">
              {wedding.wedding_code} · {wedding.bride_name} & {wedding.groom_name}
            </p>
          </div>
        </div>
      </div>

      <Tabs tabs={visibleTabs} value={tab} onChange={setTab} />

      <TabPanel active={tab === "overview"}>
        <OverviewTab wedding={wedding} />
      </TabPanel>
      <TabPanel active={tab === "invitations"}>
        <InvitationsTab weddingId={weddingId} />
      </TabPanel>
      {isPaid && (
        <TabPanel active={tab === "guests"}>
          <GuestsTab
            weddingId={weddingId}
            canCheckIn={capabilities ? capabilities.modules.checkin : false}
          />
        </TabPanel>
      )}
      {capabilities?.modules.rsvp && (
        <TabPanel active={tab === "rsvp"}>
          <RsvpTab weddingId={weddingId} />
        </TabPanel>
      )}
      {capabilities?.modules.seating && (
        <TabPanel active={tab === "seating"}>
          <SeatingTab weddingId={weddingId} />
        </TabPanel>
      )}
      {capabilities?.modules.gifts && (
        <TabPanel active={tab === "gifts"}>
          <GiftsTab weddingId={weddingId} />
        </TabPanel>
      )}
      {capabilities?.modules.expense && (
        <TabPanel active={tab === "expenses"}>
          <ExpensesTab weddingId={weddingId} />
        </TabPanel>
      )}
      {capabilities?.modules.timeline && (
        <TabPanel active={tab === "timeline"}>
          <TimelineTab weddingId={weddingId} />
        </TabPanel>
      )}
      {capabilities?.modules.gallery && (
        <TabPanel active={tab === "gallery"}>
          <GalleryTab weddingId={weddingId} />
        </TabPanel>
      )}
    </div>
  );
}
