import { api } from "@/lib/api";
import type {
  DashboardOverview,
  InvitationTemplate,
  Package,
  Paginated,
  PlatformIncome,
  PlatformIncomeSummary,
  Role,
  User,
} from "@/types/api";

export interface PackagePayload {
  name?: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  features?: string[];
  is_active?: boolean;
}

export interface TemplatePayload {
  slug?: string;
  name?: string;
  preview_image_path?: string | null;
  config?: Record<string, unknown> | null;
  is_active?: boolean;
}

export const adminService = {
  async dashboard(): Promise<DashboardOverview> {
    const { data } = await api.get<{ data: DashboardOverview }>("/dashboard/overview");
    return data.data;
  },

  async users(
    params: { search?: string; role?: string; page?: number; per_page?: number } = {},
  ): Promise<Paginated<User>> {
    const { data } = await api.get<Paginated<User>>("/admin/users", { params });
    return data;
  },

  async createUser(payload: {
    name: string;
    email: string;
    phone?: string | null;
    password: string;
    roles: string[];
    is_active?: boolean;
  }): Promise<User> {
    const { data } = await api.post<{ data: User }>("/admin/users", payload);
    return data.data;
  },

  async updateUser(
    userId: number,
    payload: Partial<{
      name: string;
      email: string;
      phone: string | null;
      password: string;
      roles: string[];
      is_active: boolean;
    }>,
  ): Promise<User> {
    const { data } = await api.put<{ data: User }>(`/admin/users/${userId}`, payload);
    return data.data;
  },

  async removeUser(userId: number): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },

  async roles(): Promise<Role[]> {
    const { data } = await api.get<{ data: Role[] }>("/admin/roles");
    return data.data;
  },

  async packages(): Promise<Package[]> {
    const { data } = await api.get<{ data: Package[] }>("/packages");
    return data.data;
  },

  async createPackage(payload: PackagePayload): Promise<Package> {
    const { data } = await api.post<{ data: Package }>("/packages", payload);
    return data.data;
  },

  async updatePackage(
    packageId: number,
    payload: PackagePayload,
  ): Promise<Package> {
    const { data } = await api.put<{ data: Package }>(
      `/packages/${packageId}`,
      payload,
    );
    return data.data;
  },

  async removePackage(packageId: number): Promise<void> {
    await api.delete(`/packages/${packageId}`);
  },

  async templates(): Promise<InvitationTemplate[]> {
    const { data } = await api.get<{ data: InvitationTemplate[] }>("/templates");
    return data.data;
  },

  async createTemplate(payload: TemplatePayload): Promise<InvitationTemplate> {
    const { data } = await api.post<{ data: InvitationTemplate }>(
      "/templates",
      payload,
    );
    return data.data;
  },

  async updateTemplate(
    templateId: number,
    payload: TemplatePayload,
  ): Promise<InvitationTemplate> {
    const { data } = await api.put<{ data: InvitationTemplate }>(
      `/templates/${templateId}`,
      payload,
    );
    return data.data;
  },

  async removeTemplate(templateId: number): Promise<void> {
    await api.delete(`/templates/${templateId}`);
  },

  async income(
    params: { status?: string; page?: number; per_page?: number } = {},
  ): Promise<Paginated<PlatformIncome>> {
    const { data } = await api.get<Paginated<PlatformIncome>>("/admin/income", {
      params,
    });
    return data;
  },

  async incomeSummary(): Promise<PlatformIncomeSummary> {
    const { data } = await api.get<{ data: PlatformIncomeSummary }>(
      "/admin/income/summary",
    );
    return data.data;
  },
};
