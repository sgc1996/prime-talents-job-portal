import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Bookmark,
  Calendar,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CandidateDashboardPage() {
  const user = await requireRoleUser(["CANDIDATE", "SUPER_ADMIN"]);

  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
    include: {
      district: true,
      applications: {
        include: {
          job: {
            include: {
              employer: true,
              district: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      savedJobs: true,
    },
  });

  const applications = candidate?.applications || [];
  const totalApps = applications.length;
  const shortlisted = applications.filter((a) => a.status === "SHORTLISTED").length;
  const interviews = applications.filter((a) => a.status === "INTERVIEW").length;
  const savedCount = candidate?.savedJobs.length || 0;
  const completeness = candidate?.profileCompleteness || 25;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <Badge variant="secondary">Applied</Badge>;
      case "SHORTLISTED":
        return <Badge variant="info">Shortlisted</Badge>;
      case "INTERVIEW":
        return <Badge variant="success">Interview Call</Badge>;
      case "OFFERED":
        return <Badge variant="default">Offer Extended</Badge>;
      case "HIRED":
        return <Badge variant="success">Hired 🎉</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Not Selected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-xl border bg-card p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              Welcome back, {user.name}!
            </h1>
            <p className="text-sm text-muted-foreground">
              {candidate?.headline || "Complete your profile to increase visibility to Sri Lankan recruiters."}
            </p>
          </div>

          <Link href="/jobs">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              <Briefcase className="h-4 w-4" />
              <span>Browse Vacancies</span>
            </button>
          </Link>
        </div>

        {/* Profile Completeness Bar */}
        <div className="mt-6 border-t pt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Profile Completeness: {completeness}%
            </span>
            {completeness < 100 && (
              <Link href="/candidate/profile" className="text-primary hover:underline font-medium">
                Complete profile &rarr;
              </Link>
            )}
          </div>
          <Progress value={completeness} />
          {completeness < 100 && (
            <p className="text-[11px] text-muted-foreground">
              Tip: Upload a PDF resume and add your expected salary to reach 100% and get noticed faster.
            </p>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Total Applied</span>
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalApps}</p>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Shortlisted</span>
            <CheckCircle2 className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{shortlisted}</p>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Interviews</span>
            <Calendar className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{interviews}</p>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Saved Jobs</span>
            <Bookmark className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{savedCount}</p>
        </div>
      </div>

      {/* Recent Applications Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Applications</CardTitle>
            <CardDescription>Live status of your submitted job applications</CardDescription>
          </div>
          {totalApps > 0 && (
            <Link href="/candidate/applications" className="text-xs font-semibold text-primary hover:underline">
              View All ({totalApps}) &rarr;
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">You haven&apos;t applied for any positions yet.</p>
              <Link href="/jobs">
                <button
                  type="button"
                  className="rounded-md border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Start Exploring Vacancies
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <Link
                      href={`/jobs/${app.job.slug}`}
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block"
                    >
                      {app.job.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {app.job.employer.companyName} • Applied {formatDate(app.createdAt)}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {getStatusBadge(app.status)}
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
