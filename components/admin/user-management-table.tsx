"use client";

import * as React from "react";
import { useState } from "react";
import { toggleUserStatusAction } from "@/server/actions/admin.actions";
import { UserRole, UserStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Search,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Calendar,
} from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date | string | null;
  createdAt: Date | string;
  employerProfile?: {
    companyName: string;
    verificationStatus: string;
  } | null;
}

interface UserManagementTableProps {
  initialUsers: UserRow[];
}

export function UserManagementTable({ initialUsers }: UserManagementTableProps) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchName = u.name?.toLowerCase().includes(q) || false;
      const matchCompany = u.employerProfile?.companyName.toLowerCase().includes(q) || false;
      if (!matchEmail && !matchName && !matchCompany) return false;
    }
    return true;
  });

  const handleToggleStatus = async (userId: string, currentStatus: UserStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      setLoadingId(userId);
      await toggleUserStatusAction(userId, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)),
      );
      toast.success(`User marked as ${nextStatus.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status");
    } finally {
      setLoadingId(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Super Admin</Badge>;
      case "MODERATOR":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Moderator</Badge>;
      case "EMPLOYER":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Employer</Badge>;
      case "CANDIDATE":
        return <Badge variant="secondary">Candidate</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admins</option>
            <option value="MODERATOR">Moderators</option>
            <option value="EMPLOYER">Employers</option>
            <option value="CANDIDATE">Candidates</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4 text-right">Governance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.map((user) => {
                const isLoading = loadingId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {user.name || "Anonymous User"}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
                      {user.employerProfile && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Company: {user.employerProfile.companyName}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>

                    <td className="px-6 py-4">
                      {user.status === "ACTIVE" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                          Active
                        </Badge>
                      ) : user.status === "SUSPENDED" ? (
                        <Badge variant="destructive" className="text-xs">
                          Suspended
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30">
                          {user.status}
                        </Badge>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {user.role !== "SUPER_ADMIN" ? (
                        <Button
                          size="sm"
                          variant={user.status === "ACTIVE" ? "outline" : "default"}
                          disabled={isLoading}
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`text-xs h-8 px-3 ${
                            user.status === "ACTIVE"
                              ? "text-rose-600 hover:bg-rose-50 border-rose-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : user.status === "ACTIVE" ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono italic">Protected</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
