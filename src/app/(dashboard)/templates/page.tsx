"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageLoader } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTemplates, useUpdateTemplate } from "@/hooks/use-admin";
import { Eye, Pencil } from "lucide-react";
import { apiErrorMessage } from "@/lib/api";
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
    fallbackDescription: string;
  }
> = {
  "royal-khmer-v1": {
    bg: "#1f100a",
    border: "#C9A84C",
    labelColor: "#C9A84C",
    labelBg: "rgba(201,168,76,0.12)",
    descColor: "#a8a29e",
    palette: ["#C9A84C", "#FAF6EF", "#2C1810"],
    fallbackDescription: "Dark luxury. Gold shimmer, floating particles, cinematic reveals.",
  },
  "angkor-heritage-v1": {
    bg: "#FFF8E8",
    border: "#D4A020",
    labelColor: "#92400e",
    labelBg: "#fef3c7",
    descColor: "#78716c",
    palette: ["#D4A020", "#FFF3D0", "#5C3A00"],
    fallbackDescription: "Angkor Wat illustration. Warm golden palette, falling petals.",
  },
  "blue-botanical-v1": {
    bg: "#ffffff",
    border: "#6A8CB2",
    labelColor: "#1d4ed8",
    labelBg: "#eff6ff",
    descColor: "#78716c",
    palette: ["#2C3E56", "#6A8CB2", "#BEA56E"],
    fallbackDescription: "Watercolor leaves. White clean design, gold ring, elegant serif.",
  },
  "red-rose-luxury-v1": {
    bg: "#4A0404",
    border: "#E8C97A",
    labelColor: "#E8C97A",
    labelBg: "rgba(232,201,122,0.12)",
    descColor: "#f9a8a8",
    palette: ["#5C030C", "#E8C97A", "#FAF6EF"],
    fallbackDescription: "Royal crimson. Sliding gates, falling rose petals, live wishes scroll.",
  },
  "butterfly-editorial-v1": {
    bg: "#FCFBF9",
    border: "#C5A059",
    labelColor: "#C5A059",
    labelBg: "rgba(197,160,89,0.10)",
    descColor: "#78716c",
    palette: ["#5A121D", "#F5E6E3", "#C5A059"],
    fallbackDescription: "Luxury editorial. 3D butterflies, opening burgundy envelope, elegant scripts.",
  },
  "emerald-elegance-v1": {
    bg: "#0d1f0d",
    border: "#c9a84c",
    labelColor: "#c9a84c",
    labelBg: "rgba(201,168,76,0.10)",
    descColor: "#a8a29e",
    palette: ["#1a2818", "#c9a84c", "#f5f0e8"],
    fallbackDescription: "Deep forest green. Botanical line art, gold accents, smooth parallax.",
  },
};

const FALLBACK = {
  bg: "#ffffff",
  border: "#d1d5db",
  labelColor: "#374151",
  labelBg: "#f3f4f6",
  descColor: "#6b7280",
  palette: ["#9ca3af"],
  fallbackDescription: "",
};

interface TemplateForm {
  slug: string;
  name: string;
  is_active: string;
}

export default function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates();
  const updateTemplate = useUpdateTemplate();

  const [editingTemplate, setEditingTemplate] = useState<InvitationTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TemplateForm>({
    defaultValues: { slug: "", name: "", is_active: "true" },
  });

  // Valid slugs = the coded designs (VISUAL mirrors the RSVP TEMPLATE_REGISTRY).
  // The template's own current slug is appended so a legacy/broken slug still
  // shows in the dropdown and can be corrected.
  const slugOptions = Array.from(
    new Set(
      [...Object.keys(VISUAL), editingTemplate?.slug].filter(Boolean) as string[],
    ),
  );

  const openEdit = (tpl: InvitationTemplate) => {
    setEditingTemplate(tpl);
    form.reset({
      slug: tpl.slug,
      name: tpl.name,
      is_active: tpl.is_active ? "true" : "false",
    });
    setError(null);
    setEditDialogOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!editingTemplate) return;
    setError(null);
    try {
      await updateTemplate.mutateAsync({
        templateId: editingTemplate.id,
        payload: {
          slug: values.slug.trim(),
          name: values.name,
          is_active: values.is_active === "true",
        },
      });
      setEditDialogOpen(false);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  });

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
            const description = tpl.description || v.fallbackDescription;

            return (
              <div
                key={tpl.id}
                className="relative flex flex-col justify-between gap-3 rounded-xl border-2 p-4 text-left"
                style={{
                  background: v.bg,
                  borderColor: `${v.border}66`,
                  opacity: tpl.is_active === false ? 0.6 : 1,
                }}
              >
                {tpl.is_active === false ? (
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
                    {description}
                  </p>
                </div>

                {/* Footer section with slug & buttons */}
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

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(tpl)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold border transition-all cursor-pointer hover:opacity-80"
                      style={{
                        color: v.labelColor,
                        borderColor: `${v.labelColor}60`,
                        background: v.labelBg,
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>

                    <a
                      href={`${RSVP_URL}/preview/${tpl.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold border transition-all hover:opacity-80"
                      style={{
                        color: v.labelColor,
                        borderColor: `${v.labelColor}60`,
                        background: v.labelBg,
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Template Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        title="Edit Template"
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="tpl-slug">Slug (design)</Label>
            <Select
              id="tpl-slug"
              className="font-mono"
              {...form.register("slug", { required: true })}
            >
              {slugOptions.map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                  {VISUAL[slug] ? "" : "  (no design — will render empty)"}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-[11px] text-zinc-500">
              The slug is the key the RSVP app uses to pick which design to render.
              Only the coded designs are listed, so a template can never point at
              an empty/non-existent design. Adding a brand-new slug requires a new
              template folder + registry entry in the RSVP app.
            </p>
          </div>
          <div>
            <Label htmlFor="tpl-name">Name</Label>
            <Input id="tpl-name" {...form.register("name", { required: true })} />
          </div>
          <div>
            <Label htmlFor="tpl-active">Status</Label>
            <Select id="tpl-active" {...form.register("is_active")}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateTemplate.isPending}>
              {updateTemplate.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
