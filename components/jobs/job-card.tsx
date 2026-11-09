import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SaveJobButton } from "./save-job-button";
import { MapPin, Building2, Banknote, Clock, Sparkles } from "lucide-react";

export interface JobCardProps {
  job: {
    id: string;
    title: string;
    slug: string;
    jobType: string;
    experienceLevel: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string | null;
    salaryVisible?: boolean | null;
    isFeatured?: boolean | null;
    publishedAt?: Date | string | null;
    employer: {
      companyName: string;
      slug: string;
      logoUrl?: string | null;
      verificationStatus?: string | null;
    };
    sector?: {
      name: string;
      slug: string;
    } | null;
    district?: {
      name: string;
      code: string;
    } | null;
    skills?: {
      skill: {
        name: string;
      };
    }[];
  };
  isSaved?: boolean;
}

export function JobCard({ job, isSaved = false }: JobCardProps) {
  const formatJobType = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className={`group relative rounded-lg border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md ${job.isFeatured ? "border-primary/30 bg-primary/[0.01]" : ""}`}>
      {/* Featured ribbon if applicable */}
      {job.isFeatured && (
        <div className="absolute -top-2.5 right-4 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow">
          <Sparkles className="h-3 w-3" />
          <span>Featured</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Company Avatar / Logo */}
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-muted text-lg font-bold text-primary">
            {job.employer.companyName.charAt(0)}
          </div>

          <div>
            <Link
              href={`/jobs/${job.slug}`}
              className="text-base font-semibold text-foreground group-hover:text-primary transition-colors"
            >
              {job.title}
            </Link>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <Link
                href={`/companies/${job.employer.slug}`}
                className="flex items-center gap-1 hover:text-foreground transition-colors font-medium"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>{job.employer.companyName}</span>
                {job.employer.verificationStatus === "VERIFIED" && (
                  <span className="text-primary font-bold" title="Verified Employer">✓</span>
                )}
              </Link>

              {job.district && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{job.district.name}, Sri Lanka</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Save button */}
        <SaveJobButton jobId={job.id} initialSaved={isSaved} />
      </div>

      {/* Salary & Details */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          {formatJobType(job.jobType)}
        </Badge>

        {job.sector && (
          <Badge variant="outline">
            {job.sector.name}
          </Badge>
        )}

        {job.salaryVisible && (job.salaryMin || job.salaryMax) ? (
          <Badge variant="success" className="flex items-center gap-1">
            <Banknote className="h-3.5 w-3.5" />
            <span>
              {job.salaryMin && job.salaryMax
                ? `${formatCurrency(job.salaryMin, job.salaryCurrency || "LKR")} - ${formatCurrency(job.salaryMax, job.salaryCurrency || "LKR")}`
                : job.salaryMin
                  ? `From ${formatCurrency(job.salaryMin, job.salaryCurrency || "LKR")}`
                  : `Up to ${formatCurrency(job.salaryMax!, job.salaryCurrency || "LKR")}`}
            </span>
          </Badge>
        ) : null}
      </div>

      {/* Skills tags */}
      {job.skills && job.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t text-[11px] text-muted-foreground">
          {job.skills.map((s) => (
            <span
              key={s.skill.name}
              className="rounded bg-muted px-2 py-0.5 font-medium"
            >
              {s.skill.name}
            </span>
          ))}
        </div>
      )}

      {/* Published timestamp */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{job.publishedAt ? formatDate(job.publishedAt) : "Recently posted"}</span>
        </span>
        <Link
          href={`/jobs/${job.slug}`}
          className="font-semibold text-primary hover:underline"
        >
          View Vacancy &rarr;
        </Link>
      </div>
    </div>
  );
}
