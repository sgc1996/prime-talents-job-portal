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
  Shield,
  ShieldAlert,
  Building2,
  User,
} from "lucide-react";
import { AddStaffDialog } from "./add-staff-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";

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
  currentAdminId?: string;
}

export function UserManagementTable({
  initialUsers,
  currentAdminId,
}: UserManagementTableProps) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loadingStatusId, setLoadingStatusId] = useState<string | null>(null);

  const superAdminCount = users.filter((u) => u.role === "SUPER_ADMIN").length;
  const canAddMoreSuperAdmins = superAdminCount < 2;

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchName = u.name?.toLowerCase().includes(q) || false;
      const matchCompany =
        u.employerProfile?.companyName.toLowerCase().includes(q) || false;
      if (!matchEmail && !matchName && !matchCompany) return false;
    }
    return true;
  });

  const handleToggleStatus = async (
    userId: string,
    currentStatus: UserStatus,
  ) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      setLoadingStatusId(userId);
      await toggleUserStatusAction(userId, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)),
      );
      toast.success(`User marked as ${nextStatus.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status");
    } finally {
      setLoadingStatusId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search, Filters, and Add Staff Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800/80 bg-purple-50/70 dark:bg-purple-950/30 text-xs font-semibold text-purple-700 dark:text-purple-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>
              Super Admins: <strong>{superAdminCount} / 2</strong>
            </span>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary"
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
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
          </select>

          <AddStaffDialog
            canCreateSuperAdmin={canAddMoreSuperAdmins}
            onSuccess={() => {
              window.location.reload();
            }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Assigned Role</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4 text-right">Governance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.map((user) => {
                const isStatusLoading = loadingStatusId === user.id;
                const isSelf = user.id === currentAdminId;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {user.name || "Anonymous User"}
                        </span>
                        {user.role === "SUPER_ADMIN" && (
                          <ShieldAlert className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        )}
                        {user.role === "MODERATOR" && (
                          <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          Tel: {user.phone}
                        </p>
                      )}
                      {user.employerProfile && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Company: {user.employerProfile.companyName}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {user.role === "SUPER_ADMIN" ? (
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-xs font-semibold gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            Super Admin
                          </Badge>
                          {isSelf && (
                            <span className="text-[10px] text-slate-400 font-mono italic">
                              (You)
                            </span>
                          )}
                        </div>
                      ) : user.role === "MODERATOR" ? (
                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs font-semibold gap-1">
                          <Shield className="w-3 h-3" />
                          Moderator
                        </Badge>
                      ) : user.role === "EMPLOYER" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1">
                          <Building2 className="w-3 h-3" />
                          Employer
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 text-xs font-medium gap-1"
                        >
                          <User className="w-3 h-3" />
                          Candidate
                        </Badge>
                      )}
                    </td>

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
                        <Badge
                          variant="outline"
                          className="text-xs text-amber-600 border-amber-500/30"
                        >
                          {user.status}
                        </Badge>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. Edit User Account Dialog */}
                        <EditUserDialog
                          user={{
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            role: user.role,
                            status: user.status,
                          }}
                          isSelf={isSelf}
                          canPromoteToSuperAdmin={canAddMoreSuperAdmins}
                          onSuccess={(updated) => {
                            setUsers((prev) =>
                              prev.map((u) =>
                                u.id === updated.id
                                  ? {
                                      ...u,
                                      name: updated.name,
                                      email: updated.email,
                                      phone: updated.phone,
                                      role: updated.role,
                                      status: updated.status,
                                    }
                                  : u,
                              ),
                            );
                          }}
                        />

                        {/* 2. Suspend / Activate Toggle */}
                        {!isSelf && user.role !== "SUPER_ADMIN" && (
                          <Button
                            size="sm"
                            variant={
                              user.status === "ACTIVE" ? "outline" : "default"
                            }
                            disabled={isStatusLoading}
                            onClick={() =>
                              handleToggleStatus(user.id, user.status)
                            }
                            className={`text-xs h-8 px-2.5 ${
                              user.status === "ACTIVE"
                                ? "text-amber-600 hover:bg-amber-50 border-amber-200 dark:hover:bg-amber-950/40"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                            title={
                              user.status === "ACTIVE"
                                ? "Suspend Account"
                                : "Activate Account"
                            }
                          >
                            {isStatusLoading ? (
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
                        )}

                        {/* 3. Delete User Dialog */}
                        {!isSelf && (
                          <DeleteUserDialog
                            user={{
                              id: user.id,
                              email: user.email,
                              name: user.name,
                              role: user.role,
                            }}
                            isSelf={isSelf}
                            onSuccess={(deletedId) => {
                              setUsers((prev) =>
                                prev.filter((u) => u.id !== deletedId),
                              );
                            }}
                          />
                        )}

                        {isSelf && (
                          <span className="text-xs text-slate-400 font-mono italic px-2">
                            (Current Session)
                          </span>
                        )}
                      </div>
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
