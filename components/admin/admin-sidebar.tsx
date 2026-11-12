"use client";

import * as React from "react";
import Link from "next/link";
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
  Shield,
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
        ]
      : []),
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Shield className="w-5 h-5 text-emerald-400 dark:text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block">
              WorkLanka
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 block -mt-0.5">
              Control Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
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

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="truncate mr-2">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {user.name || "Administrator"}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {user.role}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

