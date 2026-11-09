import { requireRoleUser } from "@/lib/auth/session";
import { PlaceholderNav } from "@/components/layout/placeholder-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

export default async function CandidatePlaceholderPage() {
  const user = await requireRoleUser(["CANDIDATE", "SUPER_ADMIN"]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PlaceholderNav name={user.name} role={user.role} />

      <main className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Candidate Portal</CardTitle>
                <CardDescription>Role-based Access Control Verified</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <p className="text-lg font-medium text-foreground">
                Hello, <span className="text-primary font-bold">{user.name}</span> ({user.role})
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your candidate session and profile are authenticated and guarded by RBAC.
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              Candidate Dashboard UI will be implemented in subsequent phases.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
