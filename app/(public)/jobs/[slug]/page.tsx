import { notFound } from "next/navigation";
import { JobRepository } from "@/server/repositories/job.repository";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { ApplyModal } from "@/components/jobs/apply-modal";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Metadata } from "next";
import {
  Building2,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

interface JobDetailPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const job = await JobRepository.getJobBySlug(params.slug);
  if (!job) return { title: "Vacancy Not Found" };

  return {
    title: `${job.title} at ${job.employer.companyName}`,
    description: `Apply for ${job.title} vacancy in ${job.district?.name || "Sri Lanka"}. Offered by ${job.employer.companyName}.`,
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job = await JobRepository.getJobBySlug(params.slug);
  if (!job) notFound();

  const user = await getCurrentUser();
  let isCandidate = false;
  let isSaved = false;
  let hasApplied = false;
  let defaultCvId: string | null = null;

  if (user) {
    if (user.role === "CANDIDATE") {
      isCandidate = true;
      const candidate = await prisma.candidateProfile.findUnique({
        where: { userId: user.id },
      });

      if (candidate) {
        const [savedRecord, appRecord, latestCv] = await Promise.all([
          prisma.savedJob.findUnique({
            where: {
              candidateId_jobId: {
                candidateId: candidate.id,
                jobId: job.id,
              },
            },
          }),
          prisma.application.findUnique({
            where: {
              jobId_candidateId: {
                jobId: job.id,
                candidateId: candidate.id,
              },
            },
          }),
          prisma.storedFile.findFirst({
            where: {
              ownerId: user.id,
              kind: "CV",
            },
            orderBy: { createdAt: "desc" },
          }),
        ]);

        isSaved = Boolean(savedRecord);
        hasApplied = Boolean(appRecord);
        defaultCvId = latestCv?.id || null;
      }
    }
  }

  // JSON-LD structured data for Google Jobs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.descriptionHtml,
    datePosted: job.publishedAt ? new Date(job.publishedAt).toISOString() : new Date().toISOString(),
    validThrough: job.deadline ? new Date(job.deadline).toISOString() : undefined,
    employmentType: job.jobType,
    hiringOrganization: {
      "@type": "Organization",
      name: job.employer.companyName,
      sameAs: job.employer.website || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.district?.name || "Colombo",
        addressCountry: "LK",
      },
    },
    baseSalary:
      job.salaryVisible && job.salaryMin
        ? {
            "@type": "MonetaryAmount",
            currency: job.salaryCurrency || "LKR",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salaryMin,
              maxValue: job.salaryMax || job.salaryMin,
              unitText: "MONTH",
            },
          }
        : undefined,
  };

  const formatEnumText = (val: string) => {
    return val.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <>
      {/* Inject Google Jobs Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Vacancies</span>
          </Link>
        </div>

        {/* Top Header Card */}
        <div className="rounded-xl border bg-card p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border bg-muted text-2xl font-bold text-primary">
                {job.employer.companyName.charAt(0)}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                    {job.title}
                  </h1>
                  {job.isFeatured && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Featured</span>
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <Link
                    href={`/companies/${job.employer.slug}`}
                    className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>{job.employer.companyName}</span>
                    {job.employer.verificationStatus === "VERIFIED" && (
                      <span className="text-primary font-bold" title="Verified Organization">✓</span>
                    )}
                  </Link>

                  {job.district && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.district.name}, {job.district.province?.name}</span>
                    </span>
                  )}

                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Posted {job.publishedAt ? formatDate(job.publishedAt) : "Recently"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <SaveJobButton jobId={job.id} initialSaved={isSaved} />

              {hasApplied ? (
                <div className="flex items-center gap-2 rounded-md bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Already Applied</span>
                </div>
              ) : (
                <ApplyModal
                  jobId={job.id}
                  jobTitle={job.title}
                  companyName={job.employer.companyName}
                  applyMethod={job.applyMethod}
                  applyUrl={job.applyUrl}
                  applyEmail={job.applyEmail}
                  screeningQuestions={job.screeningQuestions}
                  isLoggedIn={Boolean(user)}
                  isCandidate={isCandidate}
                  defaultCvId={defaultCvId}
                />
              )}
            </div>
          </div>

          {/* Quick Specs bar */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4 text-xs">
            <div>
              <span className="text-muted-foreground">Job Type</span>
              <p className="mt-1 font-semibold text-foreground">{formatEnumText(job.jobType)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Experience</span>
              <p className="mt-1 font-semibold text-foreground">{formatEnumText(job.experienceLevel)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Education</span>
              <p className="mt-1 font-semibold text-foreground">{formatEnumText(job.educationLevel)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Salary (LKR)</span>
              <p className="mt-1 font-semibold text-foreground">
                {job.salaryVisible && (job.salaryMin || job.salaryMax)
                  ? `${job.salaryMin ? formatCurrency(job.salaryMin) : ""} ${job.salaryMin && job.salaryMax ? "-" : ""} ${job.salaryMax ? formatCurrency(job.salaryMax) : ""}`
                  : "Negotiable / Undisclosed"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Description & Requirements */}
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-xl border bg-card p-6 md:p-8 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">Job Description</h2>
                <div
                  className="prose prose-slate dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: job.descriptionHtml }}
                />
              </div>

              {/* Requirements */}
              {job.requirementsHtml && (
                <div className="border-t pt-6">
                  <h2 className="text-lg font-bold text-foreground mb-3">Requirements &amp; Qualifications</h2>
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: job.requirementsHtml }}
                  />
                </div>
              )}

              {/* Benefits */}
              {job.benefitsHtml && (
                <div className="border-t pt-6">
                  <h2 className="text-lg font-bold text-foreground mb-3">Perks &amp; Benefits</h2>
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: job.benefitsHtml }}
                  />
                </div>
              )}

              {/* Skills required */}
              {job.skills.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-bold text-foreground mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s) => (
                      <span
                        key={s.skill.name}
                        className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Company Info */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-foreground text-base">About the Employer</h3>
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted font-bold text-primary">
                  {job.employer.companyName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{job.employer.companyName}</h4>
                  {job.employer.sector && (
                    <span className="text-xs text-muted-foreground">{job.employer.sector.name}</span>
                  )}
                </div>
              </div>

              {job.employer.about && (
                <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed">
                  {job.employer.about}
                </p>
              )}

              <div className="space-y-2 border-t pt-3 text-xs text-muted-foreground">
                {job.employer.companySize && (
                  <div className="flex items-center justify-between">
                    <span>Company Size:</span>
                    <span className="font-medium text-foreground">{formatEnumText(job.employer.companySize)}</span>
                  </div>
                )}
                {job.employer.district && (
                  <div className="flex items-center justify-between">
                    <span>Headquarters:</span>
                    <span className="font-medium text-foreground">{job.employer.district.name}</span>
                  </div>
                )}
                {job.employer.website && (
                  <div className="flex items-center justify-between">
                    <span>Website:</span>
                    <a
                      href={job.employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline truncate max-w-[150px]"
                    >
                      {job.employer.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link href={`/companies/${job.employer.slug}`}>
                  <button
                    type="button"
                    className="w-full rounded-md border border-input bg-background py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    View All Company Jobs
                  </button>
                </Link>
              </div>
            </div>

            {/* Application Deadline reminder */}
            {job.deadline && (
              <div className="rounded-xl border bg-amber-500/10 border-amber-500/20 p-4 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
                <Calendar className="h-5 w-5 shrink-0" />
                <span>
                  Applications close on <strong>{formatDate(job.deadline)}</strong>.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
