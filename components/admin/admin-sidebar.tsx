"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  PlusCircle,
  CheckSquare,
  Building2,
  CreditCard,
  Users,
  ShieldCheck,
  Globe,
  LogOut,
  ChevronRight,
  Sliders,
  UserCircle,
  GraduationCap,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email: string;
    role: UserRole;
  };
  counts?: {
    pendingJobs: number;
    pendingEmployers: number;
    pendingSlips: number;
  };
}

export function AdminSidebar({ user, counts }: AdminSidebarProps) {
  const pathname = usePathname();

  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: "Candidates & CVs",
      href: "/admin/candidates",
      icon: GraduationCap,
      badge: null,
    },
    {
      name: "Post Vacancy (Flyer)",
      href: "/admin/jobs/new",
      icon: PlusCircle,
      badge: null,
    },
    {
      name: "Review Jobs",
      href: "/admin/moderation/jobs",
      icon: CheckSquare,
      badge: counts?.pendingJobs || null,
    },
    {
      name: "Verify Employers",
      href: "/admin/moderation/employers",
      icon: Building2,
      badge: counts?.pendingEmployers || null,
    },
    {
      name: "Bank Slip Payments",
      href: "/admin/payments",
      icon: CreditCard,
      badge: counts?.pendingSlips || null,
    },
    ...(isSuperAdmin
      ? [
          {
            name: "User Governance",
            href: "/admin/users",
            icon: Users,
            badge: null,
          },
          {
            name: "Audit Trail",
            href: "/admin/audit-logs",
            icon: ShieldCheck,
            badge: null,
          },
          {
            name: "Platform Settings",
            href: "/admin/settings",
            icon: Sliders,
            badge: null,
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 sticky top-0 h-screen z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image
            src="/images/logo.png"
            alt="Prime Hire"
            width={34}
            height={34}
            className="w-8 h-8 shrink-0 object-contain rounded-lg"
          />
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-tight">
              Prime Hire
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Control Panel
            </span>
          </div>
        </Link>
      </div>

      {/* User Info & Quick Logout Bar (Placed Right Under Logo) */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <Link
            href="/admin/profile"
            className="flex items-center gap-2 min-w-0 flex-1 group"
            title="Manage Profile & Password"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                {user.name || "Administrator"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate -mt-0.5 font-medium">
                {user.role}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Links (Scrollable area) */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Administration
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{item.name}</span>
              </div>

              {item.badge !== null && item.badge > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Account
        </div>
        <Link
          href="/admin/profile"
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
            pathname === "/admin/profile"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <UserCircle
              className={`w-4 h-4 ${
                pathname === "/admin/profile"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 group-hover:text-slate-600"
              }`}
            />
            <span>Profile &amp; Password</span>
          </div>
        </Link>

        <div className="pt-4 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Public Site
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Visit Job Board</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </nav>

      {/* Bottom Status */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400">
        Prime Hire • Admin Panel
      </div>
    </aside>
  );
}

