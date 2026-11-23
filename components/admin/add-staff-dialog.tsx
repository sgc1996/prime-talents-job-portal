"use client";

import { useState, useTransition } from "react";
import { UserRole } from "@prisma/client";
import { createStaffUserAction } from "@/server/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Loader2, Key, Shield, UserCheck, X } from "lucide-react";

interface AddStaffDialogProps {
  onSuccess?: () => void;
  canCreateSuperAdmin?: boolean;
}

export function AddStaffDialog({
  onSuccess,
  canCreateSuperAdmin = true,
}: AddStaffDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("MODERATOR");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let gen = "PH#";
    for (let i = 0; i < 9; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createStaffUserAction({
          name,
          email,
          role,
          password,
        });

        if (result.success) {
          toast.success(result.message);
          setName("");
          setEmail("");
          setPassword("");
          setIsOpen(false);
          if (onSuccess) onSuccess();
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to create staff account");
      }
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        className="flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90"
      >
        <UserPlus className="w-4 h-4" />
        <span>Add Staff / Admin</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Add Staff Member
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create a new internal staff or moderator account
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
                <Label htmlFor="staff-name">Full Name *</Label>
                <Input
                  id="staff-name"
                  required
                  placeholder="e.g. Kasun Fernando"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staff-email">Work Email *</Label>
                <Input
                  id="staff-email"
                  type="email"
                  required
                  placeholder="e.g. kasun@primehire.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staff-role">Role &amp; Permissions *</Label>
                <select
                  id="staff-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="MODERATOR">
                    Moderator (Review vacancies, post direct jobs, verify slips)
                  </option>
                  <option value="SUPER_ADMIN" disabled={!canCreateSuperAdmin}>
                    {canCreateSuperAdmin
                      ? "Super Admin (Full system control, settings, user management)"
                      : "Super Admin (Security Cap Reached: Max 2/2)"}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="staff-password">Password *</Label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" />
                    Auto-generate
                  </button>
                </div>
                <Input
                  id="staff-password"
                  required
                  type="text"
                  placeholder="Min 8 characters (or click Auto-generate)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  The staff member will use this email and password to log in.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="flex items-center gap-1.5 font-semibold"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Create Account
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
