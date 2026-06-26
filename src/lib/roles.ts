import type { User } from "@/types/api";

/**
 * Role keys allowed into the admin portal. Couple (Bride/Groom) accounts are
 * deliberately excluded — they belong to the couple portal, not here.
 */
export const ADMIN_ROLE_KEYS = ["super_admin", "organizer"] as const;

/** True when the user holds at least one admin-portal role. */
export function isAdminUser(user: User | null | undefined): boolean {
  return (user?.roles ?? []).some((role) =>
    (ADMIN_ROLE_KEYS as readonly string[]).includes(role.key),
  );
}
