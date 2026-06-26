"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { useTemplates } from "@/hooks/use-admin";
import { Dialog } from "@/components/ui/dialog";
import { Eye, ExternalLink, Smartphone, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InvitationTemplate } from "@/types/api";

const RSVP_URL = process.env.NEXT_PUBLIC_RSVP_URL ?? "http://localhost:3002";

// Static visual config keyed by slug — mirrors the couple portal's
// invitation editor (TemplatePicker) so the catalog looks identical.
// Palette/description are presentation-only and not stored in the DB.
const VISUAL: Record<
  string,
  {
    bg: string;
    border: string;
    labelColor: string;
    labelBg: string;
    descColor: string;
    palette: string[];
    description: string;
  }
> = {
  "royal-khmer-v1": {
    bg: "#1f100a",
    border: "#C9A84C",
    labelColor: "#C9A84C",
    labelBg: "rgba(201,168,76,0.12)",
    descColor: "#a8a29e",
    palette: ["#C9A84C", "#FAF6EF", "#2C1810"],
    description: "Dark luxury. Gold shimmer, floating particles, cinematic reveals.",
  },
  "angkor-heritage-v1": {
    bg: "#FFF8E8",
    border: "#D4A020",
    labelColor: "#92400e",
    labelBg: "#fef3c7",
    descColor: "#78716c",
    palette: ["#D4A020", "#FFF3D0", "#5C3A00"],
    description: "Angkor Wat illustration. Warm golden palette, falling petals.",
  },
  "blue-botanical-v1": {
    bg: "#ffffff",
    border: "#6A8CB2",
    labelColor: "#1d4ed8",
    labelBg: "#eff6ff",
    descColor: "#78716c",
    palette: ["#2C3E56", "#6A8CB2", "#BEA56E"],
    description: "Watercolor leaves. White clean design, gold ring, elegant serif.",
  },
  "phanaroth-luxury-v1": {
    bg: "#4A0404",
    border: "#E8C97A",
    labelColor: "#E8C97A",
    labelBg: "rgba(232,201,122,0.12)",
    descColor: "#f9a8a8",
    palette: ["#5C030C", "#E8C97A", "#FAF6EF"],
    description: "Royal crimson. Sliding gates, falling rose petals, live wishes scroll.",
  },
  "butterfly-editorial-v1": {
    bg: "#FCFBF9",
    border: "#C5A059",
    labelColor: "#C5A059",
    labelBg: "rgba(197,160,89,0.10)",
    descColor: "#78716c",
    palette: ["#5A121D", "#F5E6E3", "#C5A059"],
    description: "Luxury editorial. 3D butterflies, opening burgundy envelope, elegant scripts.",
  },
  "emerald-elegance-v1": {
    bg: "#0d1f0d",
    border: "#c9a84c",
    labelColor: "#c9a84c",
    labelBg: "rgba(201,168,76,0.10)",
    descColor: "#a8a29e",
    palette: ["#1a2818", "#c9a84c", "#f5f0e8"],
    description: "Deep forest green. Botanical line art, gold accents, smooth parallax.",
  },
};

const FALLBACK = {
  bg: "#ffffff",
  border: "#d1d5db",
  labelColor: "#374151",
  labelBg: "#f3f4f6",
  descColor: "#6b7280",
  palette: ["#9ca3af"],
  description: "",
};

export default function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<InvitationTemplate | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("mobile");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Templates</h1>
        <p className="text-sm text-zinc-500">
          Invitation templates available to couples across the platform.
        </p>
      </div>

      {isLoading ? (
        <PageLoader label="Loading templates..." />
      ) : !templates || templates.length === 0 ? (
        <EmptyState
          title="No templates yet"
          description="Invitation templates will appear here once they are added."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((tpl) => {
            const v = VISUAL[tpl.slug] ?? FALLBACK;
            return (
              <div
                key={tpl.id}
                className="relative flex flex-col justify-between gap-3 rounded-xl border-2 p-4 text-left"
                style={{ background: v.bg, borderColor: `${v.border}66` }}
              >
                {!tpl.is_active ? (
                  <span className="absolute right-2 top-2">
                    <Badge variant="secondary">Inactive</Badge>
                  </span>
                ) : null}

                <div className="space-y-2">
                  {/* Name badge */}
                  <span
                    className="inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      color: v.labelColor,
                      background: v.labelBg,
                      borderColor: `${v.labelColor}40`,
                    }}
                  >
                    {tpl.name}
                  </span>

                  {/* Palette swatches */}
                  <div className="flex gap-1.5">
                    {v.palette.map((color) => (
                      <span
                        key={color}
                        className="h-3.5 w-3.5 rounded-full border border-white/20"
                        style={{ background: color }}
                      />
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-[11px] leading-relaxed" style={{ color: v.descColor }}>
                    {v.description}
                  </p>
                </div>

                {/* Footer section with slug & preview button */}
                <div
                  className="mt-2 flex items-center justify-between gap-2 border-t pt-3"
                  style={{ borderColor: `${v.border}30` }}
                >
                  <p
                    className="font-mono text-[10px]"
                    style={{ color: v.descColor, opacity: 0.7 }}
                  >
                    {tpl.slug}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(tpl);
                      setPreviewDevice("mobile");
                    }}
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold border transition-all cursor-pointer hover:opacity-80"
                    style={{
                      color: v.labelColor,
                      borderColor: `${v.labelColor}60`,
                      background: v.labelBg,
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog
          open={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          title={`Preview: ${selectedTemplate.name}`}
          className="max-w-5xl w-full h-[90vh] flex flex-col p-4 md:p-6 overflow-hidden"
        >
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 border-b border-zinc-100 pb-3">
              {/* Device Switcher */}
              <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                    previewDevice === "mobile"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                    previewDevice === "desktop"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Desktop
                </button>
              </div>

              {/* External link */}
              <a
                href={`${RSVP_URL}/preview/${selectedTemplate.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in New Tab
              </a>
            </div>

            {/* Preview Area */}
            <div className="flex-1 flex items-center justify-center bg-zinc-900 rounded-xl p-4 overflow-hidden min-h-[400px]">
              {previewDevice === "mobile" ? (
                /* Phone Mockup */
                <div className="relative w-[320px] h-[480px] sm:w-[340px] sm:h-[550px] md:w-[360px] md:h-[580px] rounded-[36px] border-[10px] border-zinc-950 bg-zinc-950 shadow-2xl overflow-hidden ring-1 ring-zinc-900/10">
                  {/* Speaker/Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-28 rounded-full bg-zinc-950 z-20 flex items-center justify-center">
                    <div className="h-1.5 w-12 rounded-full bg-zinc-800/80" />
                  </div>
                  
                  {/* Screen Container */}
                  <div className="w-full h-full rounded-[26px] overflow-hidden bg-white">
                    <iframe
                      src={`${RSVP_URL}/preview/${selectedTemplate.slug}`}
                      title={`Mobile preview of ${selectedTemplate.name}`}
                      className="w-full h-full border-0 select-none"
                    />
                  </div>
                </div>
              ) : (
                /* Desktop Browser Mockup */
                <div className="w-full h-full max-h-[580px] rounded-xl border border-zinc-850 bg-zinc-950 overflow-hidden shadow-inner flex flex-col">
                  {/* Browser header bar */}
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900 select-none">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                    </div>
                    <div className="flex-1 max-w-md mx-auto text-center">
                      <div className="inline-block w-full rounded-md bg-zinc-800 px-3 py-0.5 text-[10px] text-zinc-500 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                        {`${RSVP_URL}/preview/${selectedTemplate.slug}`}
                      </div>
                    </div>
                  </div>
                  {/* Iframe */}
                  <iframe
                    src={`${RSVP_URL}/preview/${selectedTemplate.slug}`}
                    title={`Desktop preview of ${selectedTemplate.name}`}
                    className="w-full flex-1 border-0 bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
