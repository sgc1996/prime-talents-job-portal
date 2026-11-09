import { JobRepository } from "@/server/repositories/job.repository";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilterSidebar } from "@/components/jobs/job-filter-sidebar";
import { JobType, ExperienceLevel } from "@prisma/client";
import Link from "next/link";
import { Metadata } from "next";
import { Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Search Jobs in Sri Lanka",
  description: "Browse thousands of career vacancies across all 25 districts of Sri Lanka.",
};

export const dynamic = "force-dynamic";

interface SearchJobsPageProps {
  searchParams: {
    q?: string;
    sector?: string;
    district?: string;
    type?: string;
    level?: string;
    page?: string;
    sort?: "recent" | "salary_desc";
  };
}

export default async function SearchJobsPage({ searchParams }: SearchJobsPageProps) {
  const [districts, sectors] = await Promise.all([
    JobRepository.getDistricts(),
    JobRepository.getSectorsWithCounts(),
  ]);

  const page = parseInt(searchParams.page || "1", 10);
  const result = await JobRepository.searchJobs({
    keyword: searchParams.q,
    sectorSlug: searchParams.sector,
    districtCode: searchParams.district,
    jobType: searchParams.type as JobType | undefined,
    experienceLevel: searchParams.level as ExperienceLevel | undefined,
    sortBy: searchParams.sort,
    page,
    limit: 12,
  });

  const buildPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (searchParams.q) params.set("q", searchParams.q);
    if (searchParams.sector) params.set("sector", searchParams.sector);
    if (searchParams.district) params.set("district", searchParams.district);
    if (searchParams.type) params.set("type", searchParams.type);
    if (searchParams.level) params.set("level", searchParams.level);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    params.set("page", newPage.toString());
    return `/jobs?${params.toString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Find Career Vacancies in Sri Lanka
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Showing {result.total} {result.total === 1 ? "vacancy" : "vacancies"} matching your criteria
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1">
          <JobFilterSidebar districts={districts} sectors={sectors} />
        </div>

        {/* Right Job Cards Feed */}
        <div className="lg:col-span-3 space-y-4">
          {result.items.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No Vacancies Found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                No active jobs matched your filter criteria. Try adjusting or clearing your filters.
              </p>
              <div className="mt-4">
                <Link
                  href="/jobs"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Clear All Filters
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {result.items.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-6">
              <span className="text-xs text-muted-foreground">
                Page {result.page} of {result.totalPages}
              </span>

              <div className="flex items-center gap-2">
                {result.page > 1 && (
                  <Link
                    href={buildPaginationUrl(result.page - 1)}
                    className="rounded-md border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    &larr; Previous
                  </Link>
                )}

                {result.page < result.totalPages && (
                  <Link
                    href={buildPaginationUrl(result.page + 1)}
                    className="rounded-md border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Next &rarr;
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
