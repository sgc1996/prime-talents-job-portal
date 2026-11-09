import { requireRoleUser } from "@/lib/auth/session";
import { PlaceholderNav } from "@/components/layout/placeholder-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default async function EmployerPlaceholderPage() {
  const user = await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PlaceholderNav name={user.name} role={user.role} />

      <main className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Employer Portal</CardTitle>
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
                Your employer company profile and recruitment access are active.
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              Employer Dashboard &amp; Job Management UI will be implemented in subsequent phases.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
