"use client";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { useTemplates } from "@/hooks/use-admin";

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

                {/* Slug — admin context */}
                <p
                  className="font-mono text-[10px]"
                  style={{ color: v.descColor, opacity: 0.7 }}
                >
                  {tpl.slug}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
