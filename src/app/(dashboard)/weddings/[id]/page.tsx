"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge, statusVariant } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { TabPanel, Tabs } from "@/components/ui/tabs";
import { AnnouncementsTab } from "@/components/wedding/announcements-tab";
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

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "invitations", label: "Invitations" },
  { value: "guests", label: "Guests" },
  { value: "rsvp", label: "RSVP" },
  { value: "seating", label: "Seating" },
  { value: "gifts", label: "Gifts" },
  { value: "expenses", label: "Expenses" },
  { value: "timeline", label: "Timeline" },
  { value: "gallery", label: "Gallery" },
  { value: "announcements", label: "Announcements" },
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

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      <TabPanel active={tab === "overview"}>
        <OverviewTab wedding={wedding} />
      </TabPanel>
      <TabPanel active={tab === "invitations"}>
        <InvitationsTab weddingId={weddingId} />
      </TabPanel>
      <TabPanel active={tab === "guests"}>
        <GuestsTab weddingId={weddingId} />
      </TabPanel>
      <TabPanel active={tab === "rsvp"}>
        <RsvpTab weddingId={weddingId} />
      </TabPanel>
      <TabPanel active={tab === "seating"}>
        <SeatingTab weddingId={weddingId} />
      </TabPanel>
      <TabPanel active={tab === "gifts"}>
        <GiftsTab weddingId={weddingId} />
      </TabPanel>
      <TabPanel active={tab === "expenses"}>
        <ExpensesTab weddingId={weddingId} />
      </TabPanel>
      <TabPanel active={tab === "timeline"}>
        <TimelineTab weddingId={weddingId} />
      </TabPanel>
      <TabPanel active={tab === "gallery"}>
        <GalleryTab weddingId={weddingId} />
      </TabPanel>
      <TabPanel active={tab === "announcements"}>
        <AnnouncementsTab weddingId={weddingId} />
      </TabPanel>
    </div>
  );
}
