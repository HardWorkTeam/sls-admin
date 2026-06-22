"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin-service";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => adminService.dashboard(),
  });
}

export function useUsers(params: { search?: string; role?: string; page?: number } = {}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminService.users(params),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["admin", "roles"],
    queryFn: () => adminService.roles(),
    staleTime: Infinity,
  });
}

export function usePackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: () => adminService.packages(),
    staleTime: 5 * 60_000,
  });
}

export function useIncome(params: { status?: string; page?: number } = {}) {
  return useQuery({
    queryKey: ["admin", "income", params],
    queryFn: () => adminService.income(params),
  });
}

export function useIncomeSummary() {
  return useQuery({
    queryKey: ["admin", "income", "summary"],
    queryFn: () => adminService.incomeSummary(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: Parameters<typeof adminService.updateUser>[1];
    }) => adminService.updateUser(userId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => adminService.removeUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createPackage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["packages"] }),
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      packageId,
      payload,
    }: {
      packageId: number;
      payload: Parameters<typeof adminService.updatePackage>[1];
    }) => adminService.updatePackage(packageId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["packages"] }),
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (packageId: number) => adminService.removePackage(packageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["packages"] }),
  });
}

