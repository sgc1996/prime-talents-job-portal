"use client";

import { useState, useTransition } from "react";
import { UserRole, UserStatus } from "@prisma/client";
import { updateUserDetailsAdminAction } from "@/server/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Edit3,
  Loader2,
  Key,
  ShieldAlert,
  X,
  UserCheck,
  Phone,
  Mail,
  User,
  AlertTriangle,
} from "lucide-react";

interface EditUserTarget {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
}

interface EditUserDialogProps {
  user: EditUserTarget;
  isSelf: boolean;
  canPromoteToSuperAdmin?: boolean;
  onSuccess: (updatedUser: EditUserTarget) => void;
}

export function EditUserDialog({
  user,
  isSelf,
  canPromoteToSuperAdmin = true,
  onSuccess,
}: EditUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [newPassword, setNewPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    setName(user.name || "");
    setEmail(user.email);
    setPhone(user.phone || "");
    setRole(user.role);
    setStatus(user.status);
    setNewPassword("");
    setIsOpen(true);
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let gen = "PH#";
    for (let i = 0; i < 9; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(gen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    if (newPassword && newPassword.trim().length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateUserDetailsAdminAction({
          userId: user.id,
          name,
          email,
          phone: phone.trim() || null,
          role,
          status,
          newPassword: newPassword.trim() || undefined,
        });

        if (result.success && result.user) {
          toast.success(result.message);
          onSuccess({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone,
            role: result.user.role,
            status: result.user.status,
          });
          setIsOpen(false);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update user account");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={handleOpen}
        className="h-8 w-8 p-0 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg"
        title="Edit User Account"
      >
        <Edit3 className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Edit Account &amp; Access
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Full Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kasun Perera"
                  required
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Phone Number (Optional)
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0771234567"
                    className="text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">User Role</Label>
                  <select
                    value={role}
                    disabled={isSelf}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  >
                    <option value="CANDIDATE">Candidate (Job Seeker)</option>
                    <option value="EMPLOYER">Employer / Company</option>
                    <option value="MODERATOR">Moderator (Staff)</option>
                    <option
                      value="SUPER_ADMIN"
                      disabled={!canPromoteToSuperAdmin && user.role !== "SUPER_ADMIN"}
                    >
                      {!canPromoteToSuperAdmin && user.role !== "SUPER_ADMIN"
                        ? "Super Admin (Limit Reached: Max 2/2)"
                        : "Super Admin"}
                    </option>
                  </select>
                  {isSelf && (
                    <p className="text-[10px] text-slate-400 italic">
                      Cannot change role on your own account
                    </p>
                  )}
                  {(role === "SUPER_ADMIN" || role === "MODERATOR") &&
                    (user.role === "CANDIDATE" || user.role === "EMPLOYER") && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Warning: This will grant internal staff access.
                      </p>
                    )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Account Status</Label>
                  <select
                    value={status}
                    disabled={isSelf}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                    className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                  </select>
                  {isSelf && (
                    <p className="text-[10px] text-slate-400 italic">
                      Cannot suspend your own account
                    </p>
                  )}
                </div>
              </div>

              {/* Password Reset Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    Reset Password (Optional)
                  </Label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Generate Strong Password
                  </button>
                </div>
                <Input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave empty to keep existing password"
                  className="text-sm font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  If filled, the user's password will be directly updated immediately.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="text-xs bg-primary text-primary-foreground font-semibold flex items-center gap-1.5"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
