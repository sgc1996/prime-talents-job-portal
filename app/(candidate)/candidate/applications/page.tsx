import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Building2, MapPin, MessageSquare, AlertCircle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Job Applications",
  description: "Track the status of your submitted job applications.",
};

export const dynamic = "force-dynamic";

export default async function CandidateApplicationsPage() {
  const user = await requireRoleUser(["CANDIDATE", "SUPER_ADMIN"]);

  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
  });

  const applications = candidate
    ? await prisma.application.findMany({
        where: { candidateId: candidate.id },
        include: {
          job: {
            include: {
              employer: true,
              district: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          My Applications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time tracking of positions you have applied for on Prime Hire.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Applications Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You haven&apos;t applied to any job vacancies yet. Start exploring active job openings!
          </p>
          <div className="pt-2">
            <Link href="/jobs">
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
              >
                Browse Vacancies
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border bg-card p-5 shadow-sm space-y-4 transition-all hover:border-primary/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div className="space-y-1">
                  <Link
                    href={`/jobs/${app.job.slug}`}
                    className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {app.job.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      <span>{app.job.employer.companyName}</span>
                    </span>

                    {app.job.district && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{app.job.district.name}</span>
                      </span>
                    )}

                    <span>Applied on {formatDate(app.createdAt)}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {getStatusBadge(app.status)}
                </div>
              </div>

              {/* Employer Feedback Note if provided */}
              {app.employerNote && (
                <div className="rounded-lg bg-muted/50 p-3 text-xs text-foreground flex items-start gap-2 border">
                  <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[10px]">Note from Recruiter:</span>
                    <p className="mt-0.5">{app.employerNote}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
