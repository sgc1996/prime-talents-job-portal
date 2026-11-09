import { requireRoleUser } from "@/lib/auth/session";
import { PlaceholderNav } from "@/components/layout/placeholder-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, Check, X } from "lucide-react";
import { can } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export default async function AdminPlaceholderPage() {
  const user = await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);

  const canManageUsers = can(user, PERMISSIONS.USER_CREATE);
  const canManageSettings = can(user, PERMISSIONS.SETTINGS_MANAGE);
  const canModerateJobs = can(user, PERMISSIONS.MODERATION_JOBS);
  const canModerateReviews = can(user, PERMISSIONS.MODERATION_REVIEWS);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PlaceholderNav name={user.name} role={user.role} />

      <main className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                {user.role === "SUPER_ADMIN" ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  <ShieldAlert className="h-6 w-6" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">Admin Backend Portal</CardTitle>
                <CardDescription>
                  Protected Area: Authorized for SUPER_ADMIN &amp; MODERATOR
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md bg-muted p-4">
              <p className="text-lg font-medium text-foreground">
                Hello, <span className="text-primary font-bold">{user.name}</span> ({user.role})
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                You are authenticated with administrative privileges. Guards and RBAC verified.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Permission Audit for {user.role}
              </h4>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
                <div className="flex items-center space-x-2">
                  {canModerateJobs ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                  <span>Job Content Moderation</span>
                </div>

                <div className="flex items-center space-x-2">
                  {canModerateReviews ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                  <span>Review Moderation</span>
                </div>

                <div className="flex items-center space-x-2">
                  {canManageUsers ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                  <span>User &amp; Role Management</span>
                </div>

                <div className="flex items-center space-x-2">
                  {canManageSettings ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                  <span>System Configuration</span>
                </div>
              </div>

              {user.role === "MODERATOR" && (
                <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                  Note: As a Moderator, user management and system settings are strictly blocked.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

