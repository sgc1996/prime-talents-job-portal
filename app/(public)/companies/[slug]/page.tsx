import { notFound } from "next/navigation";
import { JobRepository } from "@/server/repositories/job.repository";
import { JobCard } from "@/components/jobs/job-card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Calendar, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

interface CompanyProfilePageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CompanyProfilePageProps): Promise<Metadata> {
  const company = await JobRepository.getCompanyBySlug(params.slug);
  if (!company) return { title: "Company Not Found" };

  return {
    title: `${company.companyName} Careers & Jobs in Sri Lanka`,
    description: company.about || `Explore career openings at ${company.companyName} on WorkLanka.`,
  };
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const company = await JobRepository.getCompanyBySlug(params.slug);
  if (!company) notFound();

  const formatEnum = (val: string) => {
    return val.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Vacancies</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-xl border bg-card p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border bg-muted text-3xl font-extrabold text-primary">
              {company.companyName.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                  {company.companyName}
                </h1>
                {company.verificationStatus === "VERIFIED" && (
                  <Badge variant="default" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {company.sector && (
                  <span className="flex items-center gap-1 font-medium">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span>{company.sector.name}</span>
                  </span>
                )}

                {company.district && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{company.district.name}, Sri Lanka</span>
                  </span>
                )}

                {company.foundedYear && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Founded {company.foundedYear}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors shrink-0"
            >
              <Globe className="h-4 w-4 text-primary" />
              <span>Visit Website</span>
            </a>
          )}
        </div>
      </div>

      {/* Company Details Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* About & Culture */}
        <div className="space-y-6 lg:col-span-2">
          {company.about && (
            <div className="rounded-xl border bg-card p-6 space-y-3">
              <h2 className="text-lg font-bold text-foreground">About the Organization</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {company.about}
              </p>
            </div>
          )}

          {company.mission && (
            <div className="rounded-xl border bg-card p-6 space-y-3">
              <h2 className="text-lg font-bold text-foreground">Our Mission</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {company.mission}
              </p>
            </div>
          )}

          {/* Active Job Openings */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-foreground">
              Current Openings at {company.companyName} ({company.jobs.length})
            </h2>

            {company.jobs.length === 0 ? (
              <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
                No active openings currently available. Check back soon!
              </div>
            ) : (
              <div className="space-y-4">
                {company.jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={{
                      ...job,
                      employer: {
                        companyName: company.companyName,
                        slug: company.slug,
                        logoUrl: company.logoUrl,
                        verificationStatus: company.verificationStatus,
                      },
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Company Quick Facts */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 space-y-4 text-xs">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
              Company Snapshot
            </h3>

            {company.companySize && (
              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="text-muted-foreground">Company Size</span>
                <span className="font-semibold text-foreground">{formatEnum(company.companySize)}</span>
              </div>
            )}

            {company.address && (
              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold text-foreground text-right max-w-[180px]">{company.address}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-b pb-2.5">
              <span className="text-muted-foreground">Verification</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {company.verificationStatus === "VERIFIED" ? "Verified Employer" : "Pending Verification"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Vacancies</span>
              <span className="font-semibold text-primary">{company.jobs.length} roles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
