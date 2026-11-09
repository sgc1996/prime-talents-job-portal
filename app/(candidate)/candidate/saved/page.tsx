import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { JobCard } from "@/components/jobs/job-card";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Vacancies",
  description: "View and manage your bookmarked job openings.",
};

export const dynamic = "force-dynamic";

export default async function CandidateSavedJobsPage() {
  const user = await requireRoleUser(["CANDIDATE", "SUPER_ADMIN"]);

  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
  });

  const savedJobs = candidate
    ? await prisma.savedJob.findMany({
        where: { candidateId: candidate.id },
        include: {
          job: {
            include: {
              employer: true,
              district: true,
              sector: true,
              skills: {
                include: { skill: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Saved Vacancies
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Job openings you have bookmarked for later review.
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Bookmark className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Saved Jobs</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You haven&apos;t bookmarked any jobs yet. Browse vacancies and click the bookmark icon to save them here!
          </p>
          <div className="pt-2">
            <Link href="/jobs">
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
              >
                Find Jobs to Save
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((item) => (
            <JobCard key={item.id} job={item.job} isSaved={true} />
          ))}
        </div>
      )}
    </div>
  );
}
