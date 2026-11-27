import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { JobRepository } from "@/server/repositories/job.repository";
import { JobSearchBar } from "@/components/jobs/job-search-bar";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Briefcase, Building2, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import { SystemSettingsRepository } from "@/server/repositories/system-settings.repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [districts, sectors, featuredJobs, allowEmployerReg] = await Promise.all([
    JobRepository.getDistricts(),
    JobRepository.getSectorsWithCounts(),
    JobRepository.getFeaturedJobs(6),
    SystemSettingsRepository.isPublicEmployerRegistrationEnabled(),
  ]);

  const topSectors = sectors.slice(0, 8);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Verified Careers in Sri Lanka
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
              Find Your Next Career Opportunity with <span className="text-primary">{siteConfig.name}</span>
            </h1>

            <p className="text-base text-muted-foreground sm:text-lg">
              Explore thousands of verified vacancies across all 9 provinces and 25 districts of Sri Lanka.
            </p>

            {/* Hero Search Box */}
            <div className="pt-6">
              <JobSearchBar districts={districts} sectors={sectors} />
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Popular:</span>
              <Link
                href="/jobs?sector=it-software"
                className="rounded-full bg-muted px-2.5 py-1 hover:bg-muted/80 transition-colors"
              >
                Software Engineering
              </Link>
              <Link
                href="/jobs?district=COL"
                className="rounded-full bg-muted px-2.5 py-1 hover:bg-muted/80 transition-colors"
              >
                Colombo Jobs
              </Link>
              <Link
                href="/jobs?type=REMOTE"
                className="rounded-full bg-muted px-2.5 py-1 hover:bg-muted/80 transition-colors"
              >
                Remote
              </Link>
              <Link
                href="/jobs?sector=banking-finance"
                className="rounded-full bg-muted px-2.5 py-1 hover:bg-muted/80 transition-colors"
              >
                Banking &amp; Finance
              </Link>
              <Link
                href="/jobs?sector=apparel-garments"
                className="rounded-full bg-muted px-2.5 py-1 hover:bg-muted/80 transition-colors"
              >
                Apparel &amp; Garments
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Featured Opportunities
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Top curated vacancies from verified Sri Lankan employers
            </p>
          </div>
          <Link href="/jobs">
            <Button variant="outline" className="hidden sm:flex items-center gap-1.5">
              <span>View All Vacancies</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/jobs">
            <Button variant="outline" className="w-full">
              View All Vacancies &rarr;
            </Button>
          </Link>
        </div>
      </section>

      {/* Browse by Sector Section */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Browse by Industry Sector
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Over 35 clean, standardized career sectors tailored for Sri Lanka&apos;s economy
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {topSectors.map((sector) => (
              <Link
                key={sector.id}
                href={`/jobs?sector=${sector.slug}`}
                className="group rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-md bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {sector.jobCount} {sector.jobCount === 1 ? "job" : "jobs"}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-sm mt-3 group-hover:text-primary transition-colors line-clamp-1">
                  {sector.name}
                </h3>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/jobs">
              <Button variant="ghost" className="text-sm font-semibold text-primary">
                Explore all 35+ Industry Sectors &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sri Lanka Geography Section */}
      <section className="container mx-auto px-4">
        <div className="rounded-2xl border bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-12 text-white shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-sky-300">
                Nationwide Coverage
              </span>
              <h2 className="text-3xl font-extrabold sm:text-4xl text-white">
                Jobs in Every District of Sri Lanka
              </h2>
              <p className="text-slate-300 text-sm">
                From tech hubs in Colombo to agricultural enterprises in Nuwara Eliya and tourism in Galle, find opportunities closer to home.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Western (Colombo, Gampaha)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Central (Kandy, Matale)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Southern (Galle, Matara)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Northern &amp; Eastern Provinces</span>
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <Link href="/jobs">
                <Button size="lg" className="bg-primary text-primary-foreground font-semibold px-8 shadow-lg hover:bg-primary/90">
                  <MapPin className="mr-2 h-4 w-4" />
                  Explore by Location
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Employer Banner (Shown only when Public Employer Registration is enabled) */}
      {allowEmployerReg && (
        <section className="container mx-auto px-4">
          <div className="rounded-xl border bg-card p-8 text-center sm:p-12 shadow-sm">
            <div className="mx-auto max-w-2xl space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Are You Hiring in Sri Lanka?
              </h2>
              <p className="text-sm text-muted-foreground">
                Reach thousands of qualified local job seekers with advanced filtering, built-in screening questions, and full applicant tracking.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link href="/register">
                  <Button size="lg" className="font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow">
                    <Building2 className="mr-2 h-4 w-4" />
                    Register as an Employer
                  </Button>
                </Link>
                <Link href="/employer">
                  <Button size="lg" variant="outline">
                    Go to Employer Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
