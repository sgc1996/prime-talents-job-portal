import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Eye,
  PlusCircle,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmployerDashboardPage() {
  const user = await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
    include: {
      sector: true,
      district: true,
      jobs: {
        include: {
          applications: {
            include: {
              candidate: {
                include: { user: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const jobs = employer?.jobs || [];
  const activeJobs = jobs.filter((j) => j.status === "APPROVED");
  const allApplications = jobs.flatMap((j) => j.applications);
  const totalApplicants = allApplications.length;
  const shortlistedCount = allApplications.filter((a) => a.status === "SHORTLISTED").length;
  const totalViews = jobs.reduce((sum, j) => sum + j.viewCount, 0);

  // Recent 5 applicants
  const recentApplicants = allApplications
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-xl border bg-card p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-muted text-2xl font-bold text-primary">
              {employer?.companyName.charAt(0) || "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                  {employer?.companyName}
                </h1>
                <Badge variant={employer?.verificationStatus === "VERIFIED" ? "success" : "warning"}>
                  {employer?.verificationStatus === "VERIFIED" ? "Verified" : "Verification Pending"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {employer?.sector?.name} • {employer?.district?.name || "Sri Lanka"}
              </p>
            </div>
          </div>

          <Link href="/employer/jobs/new">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post a Vacancy</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Active Jobs</span>
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{activeJobs.length}</p>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Total Applicants</span>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalApplicants}</p>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Shortlisted</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{shortlistedCount}</p>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Vacancy Views</span>
            <Eye className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalViews}</p>
        </div>
      </div>

      {/* Recent Applicants Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Applicants</CardTitle>
            <CardDescription>Candidates who recently applied to your vacancies</CardDescription>
          </div>
          <Link href="/employer/jobs" className="text-xs font-semibold text-primary hover:underline">
            Manage Vacancies &rarr;
          </Link>
        </CardHeader>
        <CardContent>
          {recentApplicants.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">No applications received yet.</p>
              <Link href="/employer/jobs/new">
                <button
                  type="button"
                  className="rounded-md border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Create Your First Vacancy
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {recentApplicants.map((app) => (
                <div key={app.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {app.candidate.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Applied for <strong className="text-foreground">{jobs.find((j) => j.id === app.jobId)?.title}</strong> • {formatDate(app.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={app.status === "SHORTLISTED" ? "info" : "secondary"}>
                      {app.status}
                    </Badge>
                    <Link href={`/employer/jobs/${app.jobId}/applications`}>
                      <button
                        type="button"
                        className="rounded-md border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        Review
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
