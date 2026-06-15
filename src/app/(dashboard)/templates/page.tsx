"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageLoader } from "@/components/ui/spinner";
import {
  useCreateTemplate,
  useDeleteTemplate,
  useTemplates,
  useUpdateTemplate,
} from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import type { InvitationTemplate } from "@/types/api";

interface TemplateForm {
  slug: string;
  name: string;
  preview_image_path: string;
  primary_color: string;
  font: string;
  layout: string;
  is_active: string;
}

const EMPTY: TemplateForm = {
  slug: "",
  name: "",
  preview_image_path: "",
  primary_color: "#c9a227",
  font: "",
  layout: "traditional",
  is_active: "true",
};

function configValue(
  config: Record<string, unknown> | null,
  key: string,
): string {
  const value = config?.[key];
  return typeof value === "string" ? value : "";
}

export default function TemplatesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InvitationTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: templates, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const form = useForm<TemplateForm>({ defaultValues: EMPTY });

  const openCreate = () => {
    setEditing(null);
    form.reset(EMPTY);
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (template: InvitationTemplate) => {
    setEditing(template);
    form.reset({
      slug: template.slug,
      name: template.name,
      preview_image_path: template.preview_image_path ?? "",
      primary_color: configValue(template.config, "primary_color") || "#c9a227",
      font: configValue(template.config, "font"),
      layout: configValue(template.config, "layout") || "traditional",
      is_active: template.is_active ? "true" : "false",
    });
    setError(null);
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const payload = {
      slug: values.slug,
      name: values.name,
      preview_image_path: values.preview_image_path || null,
      config: {
        primary_color: values.primary_color || null,
        font: values.font || null,
        layout: values.layout || null,
      },
      is_active: values.is_active === "true",
    };
    try {
      if (editing) {
        await updateTemplate.mutateAsync({ templateId: editing.id, payload });
      } else {
        await createTemplate.mutateAsync(payload);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Invitation Templates</h1>
          <p className="text-sm text-zinc-500">
            Configure invitation designs available to couples.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>

      {isLoading ? (
        <PageLoader label="Loading templates..." />
      ) : !templates || templates.length === 0 ? (
        <EmptyState
          title="No templates yet"
          description="Create your first invitation template."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New Template
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <div
                className="h-24 rounded-t-xl"
                style={{
                  background: configValue(template.config, "primary_color") || "#e4e4e7",
                }}
              />
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-zinc-900">
                      {template.name}
                    </h3>
                    <Badge variant={template.is_active ? "success" : "secondary"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-zinc-500">
                    {template.slug}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit template"
                    onClick={() => openEdit(template)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete template"
                    onClick={() => {
                      if (confirm(`Delete template "${template.name}"?`)) {
                        deleteTemplate.mutate(template.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-zinc-600">
                {configValue(template.config, "font") ? (
                  <p>Font: {configValue(template.config, "font")}</p>
                ) : null}
                {configValue(template.config, "layout") ? (
                  <p>Layout: {configValue(template.config, "layout")}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit Template" : "New Template"}
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tpl-name">Name</Label>
              <Input id="tpl-name" {...form.register("name", { required: true })} />
            </div>
            <div>
              <Label htmlFor="tpl-slug">Slug</Label>
              <Input
                id="tpl-slug"
                placeholder="golden-khmer"
                {...form.register("slug", { required: true })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tpl-preview">Preview image URL</Label>
            <Input id="tpl-preview" {...form.register("preview_image_path")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="tpl-color">Primary color</Label>
              <Input id="tpl-color" type="color" {...form.register("primary_color")} />
            </div>
            <div>
              <Label htmlFor="tpl-font">Font</Label>
              <Input id="tpl-font" placeholder="Moul" {...form.register("font")} />
            </div>
            <div>
              <Label htmlFor="tpl-layout">Layout</Label>
              <Input id="tpl-layout" {...form.register("layout")} />
            </div>
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
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTemplate.isPending || updateTemplate.isPending}
            >
              {editing ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
