"use client";

import { Check, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreatePackage,
  useDeletePackage,
  usePackages,
  useUpdatePackage,
} from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import type { Package } from "@/types/api";

interface PackageForm {
  name: string;
  description: string;
  price: string;
  currency: string;
  features: string;
  module_seating: boolean;
  module_gallery: boolean;
  module_gifts: boolean;
  guest_limit: string;
  design_limit: string;
  is_active: string;
}

const EMPTY: PackageForm = {
  name: "",
  description: "",
  price: "",
  currency: "USD",
  features: "",
  module_seating: false,
  module_gallery: false,
  module_gifts: false,
  guest_limit: "",
  design_limit: "",
  is_active: "true",
};

export default function PackagesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: packages, isLoading } = usePackages();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();

  const form = useForm<PackageForm>({ defaultValues: EMPTY });

  const openCreate = () => {
    setEditing(null);
    form.reset(EMPTY);
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (pkg: Package) => {
    setEditing(pkg);
    const caps = pkg.capabilities;
    form.reset({
      name: pkg.name,
      description: pkg.description ?? "",
      price: pkg.price != null ? String(pkg.price) : "",
      currency: pkg.currency ?? "USD",
      features: (pkg.features ?? []).join("\n"),
      module_seating: caps?.modules.seating ?? false,
      module_gallery: caps?.modules.gallery ?? false,
      module_gifts: caps?.modules.gifts ?? false,
      guest_limit: caps?.guest_limit != null ? String(caps.guest_limit) : "",
      design_limit:
        caps?.invitation_design_limit != null
          ? String(caps.invitation_design_limit)
          : "",
      is_active: pkg.is_active ? "true" : "false",
    });
    setError(null);
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const payload = {
      name: values.name,
      description: values.description || null,
      price: values.price ? Number(values.price) : null,
      currency: values.currency || "USD",
      features: values.features
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      capabilities: {
        modules: {
          seating: values.module_seating,
          gallery: values.module_gallery,
          gifts: values.module_gifts,
        },
        // Blank = unlimited.
        guest_limit: values.guest_limit ? Number(values.guest_limit) : null,
        invitation_design_limit: values.design_limit
          ? Number(values.design_limit)
          : null,
      },
      is_active: values.is_active === "true",
    };
    try {
      if (editing) {
        await updatePackage.mutateAsync({ packageId: editing.id, payload });
      } else {
        await createPackage.mutateAsync(payload);
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
          <h1 className="text-xl font-semibold text-zinc-900">Packages</h1>
          <p className="text-sm text-zinc-500">
            Manage plan pricing, features and availability.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Package
        </Button>
      </div>

      {isLoading ? (
        <PageLoader label="Loading packages..." />
      ) : !packages || packages.length === 0 ? (
        <EmptyState
          title="No packages yet"
          description="Create your first pricing package."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New Package
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-zinc-900">
                      {pkg.name}
                    </h3>
                    <Badge variant={pkg.is_active ? "success" : "secondary"}>
                      {pkg.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-zinc-900">
                    {formatMoney(pkg.price, pkg.currency ?? "USD")}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit package"
                    onClick={() => openEdit(pkg)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete package"
                    onClick={() => {
                      if (confirm(`Delete package "${pkg.name}"?`)) {
                        deletePackage.mutate(pkg.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {pkg.description ? (
                  <p className="mb-3 text-sm text-zinc-500">{pkg.description}</p>
                ) : null}
                <ul className="space-y-1.5">
                  {(pkg.features ?? []).map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-zinc-700"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit Package" : "New Package"}
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="pkg-name">Name</Label>
            <Input id="pkg-name" {...form.register("name", { required: true })} />
          </div>
          <div>
            <Label htmlFor="pkg-desc">Description</Label>
            <Textarea id="pkg-desc" rows={2} {...form.register("description")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label htmlFor="pkg-price">Price</Label>
              <Input
                id="pkg-price"
                type="number"
                step="0.01"
                min="0"
                {...form.register("price")}
              />
            </div>
            <div>
              <Label htmlFor="pkg-currency">Currency</Label>
              <Input id="pkg-currency" maxLength={3} {...form.register("currency")} />
            </div>
          </div>
          <div>
            <Label htmlFor="pkg-features">Features (one per line)</Label>
            <Textarea id="pkg-features" rows={4} {...form.register("features")} />
            <p className="mt-1 text-xs text-zinc-400">
              Shown on the plan card. The settings below are what actually gets
              enforced.
            </p>
          </div>

          <div className="space-y-2 rounded-lg border border-zinc-200 p-3">
            <p className="text-sm font-medium text-zinc-700">Included modules</p>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600"
                  {...form.register("module_seating")}
                />
                Seating
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600"
                  {...form.register("module_gallery")}
                />
                Gallery
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600"
                  {...form.register("module_gifts")}
                />
                Gift tracking
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <Label htmlFor="pkg-guest-limit">Guest limit</Label>
                <Input
                  id="pkg-guest-limit"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  {...form.register("guest_limit")}
                />
              </div>
              <div>
                <Label htmlFor="pkg-design-limit">Invitation designs</Label>
                <Input
                  id="pkg-design-limit"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  {...form.register("design_limit")}
                />
              </div>
            </div>
            <p className="text-xs text-zinc-400">Leave a limit blank for unlimited.</p>
          </div>

          <div>
            <Label htmlFor="pkg-active">Status</Label>
            <Select id="pkg-active" {...form.register("is_active")}>
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
              disabled={createPackage.isPending || updatePackage.isPending}
            >
              {editing ? "Save Changes" : "Create Package"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
