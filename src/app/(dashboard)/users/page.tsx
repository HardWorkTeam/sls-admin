"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
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
import {
  useCreateUser,
  useDeleteUser,
  useRoles,
  useUpdateUser,
  useUsers,
} from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/api";

interface UserForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  is_active: boolean;
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const { data, isLoading } = useUsers({
    search: search || undefined,
    role: roleFilter || undefined,
    page,
  });
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const form = useForm<UserForm>();

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", email: "", phone: "", password: "", role: "organizer", is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    form.reset({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      password: "",
      role: user.roles?.[0]?.key ?? "organizer",
      is_active: user.is_active,
    });
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      if (editing) {
        await updateUser.mutateAsync({
          userId: editing.id,
          payload: {
            name: values.name,
            email: values.email,
            phone: values.phone || null,
            is_active: values.is_active,
            roles: [values.role],
            ...(values.password ? { password: values.password } : {}),
          },
        });
      } else {
        await createUser.mutateAsync({
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          password: values.password,
          roles: [values.role],
          is_active: values.is_active,
        });
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
          <h1 className="text-xl font-semibold text-zinc-900">Users & Roles</h1>
          <p className="text-sm text-zinc-500">
            Manage portal accounts and their access levels.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New User
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          className="w-48"
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          {(roles ?? []).map((role) => (
            <option key={role.id} value={role.key}>
              {role.name}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <PageLoader label="Loading users..." />
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-zinc-800">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(user.roles ?? []).map((role) => (
                        <Badge key={role.id} variant="secondary">
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "success" : "destructive"}>
                      {user.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${user.name}`}
                        onClick={() => openEdit(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${user.name}`}
                        disabled={user.id === currentUser?.id}
                        onClick={() => {
                          if (confirm(`Delete user "${user.name}"?`)) {
                            deleteUser.mutate(user.id);
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
        title={editing ? `Edit ${editing.name}` : "New User"}
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="user-name">Name</Label>
            <Input id="user-name" {...form.register("name", { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" {...form.register("email", { required: true })} />
            </div>
            <div>
              <Label htmlFor="user-phone">Phone</Label>
              <Input id="user-phone" {...form.register("phone")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="user-password">
                {editing ? "New password (optional)" : "Password"}
              </Label>
              <Input
                id="user-password"
                type="password"
                {...form.register("password", { required: !editing, minLength: 8 })}
              />
            </div>
            <div>
              <Label htmlFor="user-role">Role</Label>
              <Select id="user-role" {...form.register("role")}>
                {(roles ?? []).map((role) => (
                  <option key={role.id} value={role.key}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="user-active" type="checkbox" {...form.register("is_active")} />
            <Label htmlFor="user-active">Account active</Label>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
              {editing ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
