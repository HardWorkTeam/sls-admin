"use client";

import { PageLoader } from "@/components/ui/spinner";
import { useLogout, useMe } from "@/hooks/use-auth";
import { isAdminUser } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  CalendarHeart,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Package as PackageIcon,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/weddings", label: "Weddings", icon: CalendarHeart },
  { href: "/users", label: "Users & Roles", icon: Users, role: "super_admin" },
  {
    href: "/income",
    label: "Platform Income",
    icon: DollarSign,
    role: "super_admin",
  },
  {
    href: "/payments",
    label: "Payments",
    icon: CreditCard,
    role: "super_admin",
  },
  {
    href: "/packages",
    label: "Packages",
    icon: PackageIcon,
    role: "super_admin",
  },
  {
    href: "/templates",
    label: "Templates",
    icon: LayoutTemplate,
    role: "super_admin",
  },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hasRole = useAuthStore((state) => state.hasRole);
  const clear = useAuthStore((state) => state.clear);
  const logout = useLogout();
  const [hydrated, setHydrated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useMe();

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/");
    }
  }, [hydrated, token, router]);

  // Bounce non-admin (Bride/Groom) accounts that reach the admin portal with a
  // persisted session — once their profile loads and proves they lack an admin
  // role, clear the session and send them back to the login screen.
  useEffect(() => {
    if (hydrated && token && user && !isAdminUser(user)) {
      clear();
      router.replace("/");
    }
  }, [hydrated, token, user, clear, router]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMobileNavOpen(false), [pathname]);

  if (!hydrated || !token) {
    return <PageLoader label="Checking session..." />;
  }

  const navItems = NAV_ITEMS.filter(
    (item) => !("role" in item) || hasRole(item.role as string),
  );

  const sidebar = (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-zinc-100 px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/srolanh-logo.png"
          alt="Srolanh — Digital Event Management"
          className="h-16 w-auto shrink-0"
        />
        <span className="text-[11px] text-zinc-500">Admin Portal</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-zinc-600 hover:bg-zinc-100",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-100 p-3">
        <div className="mb-2 px-3">
          <p className="truncate text-sm font-medium text-zinc-800">
            {user?.name}
          </p>
          <p className="truncate text-xs text-zinc-500">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={() => logout.mutate()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-dvh bg-zinc-50">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 max-w-[80%] flex-col bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="-ml-1 flex items-center gap-2 rounded-lg p-1.5 text-zinc-700 hover:bg-zinc-100"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/srolanh-logo.png"
              alt="Srolanh Admin"
              className="h-12 w-auto"
            />
          </button>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="text-sm text-zinc-600"
          >
            Log out
          </button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
