"use client";

import { useState, useTransition } from "react";
import {
  updateAdminProfileAction,
  changeAdminPasswordAction,
} from "@/server/actions/profile.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  KeyRound,
  Shield,
  ShieldAlert,
  Loader2,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";

interface AdminProfileFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    role: string;
    status: string;
    createdAt: Date | string;
    lastLoginAt?: Date | string | null;
  };
}

export function AdminProfileForm({ user }: AdminProfileFormProps) {
  // Profile state
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [isProfilePending, startProfileTransition] = useTransition();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    startProfileTransition(async () => {
      try {
        const res = await updateAdminProfileAction({ name, phone });
        if (res.success) {
          toast.success(res.message);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update profile details");
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    startPasswordTransition(async () => {
      try {
        const res = await changeAdminPasswordAction({
          currentPassword,
          newPassword,
          confirmPassword,
        });

        if (res.success) {
          toast.success(res.message);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to change password");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Account Overview Card */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shadow-inner mb-3">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
              {user.name}
            </CardTitle>
            <CardDescription className="text-xs truncate font-mono">
              {user.email}
            </CardDescription>

            <div className="pt-2 flex justify-center">
              {user.role === "SUPER_ADMIN" ? (
                <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs flex items-center gap-1 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Super Administrator
                </Badge>
              ) : (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs flex items-center gap-1 font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  Content Moderator
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Account Status
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {user.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Member Since
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {user.lastLoginAt && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  Last Active
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {new Date(user.lastLoginAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Edit Details & Change Password Forms */}
      <div className="lg:col-span-2 space-y-6">
        {/* Form 1: Profile Details */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <User className="w-4 h-4" />
              <span>Personal Information</span>
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Profile Details
            </CardTitle>
            <CardDescription>
              Update your display name and contact details across the admin backend.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-name">Full Name *</Label>
                <Input
                  id="admin-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="admin-email"
                      disabled
                      value={user.email}
                      className="pl-9 bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed text-xs"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Email address is permanently linked to your admin identity.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-phone">Contact Phone</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="admin-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProfilePending}
                  className="font-medium"
                >
                  {isProfilePending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Saving Details...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Form 2: Change Password */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <KeyRound className="w-4 h-4" />
              <span>Authentication &amp; Security</span>
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Change Password
            </CardTitle>
            <CardDescription>
              Ensure your account uses a strong, unique password with at least 8 characters.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-password">Current Password *</Label>
                <Input
                  id="current-password"
                  type="password"
                  required
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">New Password *</Label>
                  <Input
                    id="new-password"
                    type="password"
                    required
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm New Password *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPasswordPending}
                  className="font-medium"
                >
                  {isPasswordPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
