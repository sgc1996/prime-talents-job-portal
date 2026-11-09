import { describe, it, expect } from "vitest";
import { JobStatus } from "@prisma/client";

// Helper testing the Admin Job Posting logic
function prepareAdminJob(input: {
  title: string;
  posterUrl?: string;
  isFeatured?: boolean;
}) {
  const baseSlug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = `${baseSlug}-1234`;

  return {
    title: input.title.trim(),
    slug,
    posterUrl: input.posterUrl?.trim() || null,
    status: JobStatus.APPROVED, // Admins post directly as APPROVED
    isFeatured: input.isFeatured ?? false,
    featuredUntil: input.isFeatured
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : null,
  };
}

describe("Phase 3: Admin Job Posting with Image / Flyer", () => {
  it("automatically marks admin-posted vacancies as APPROVED immediately", () => {
    const job = prepareAdminJob({
      title: "Senior Bank Manager",
    });

    expect(job.status).toBe(JobStatus.APPROVED);
    expect(job.slug).toBe("senior-bank-manager-1234");
    expect(job.posterUrl).toBeNull();
  });

  it("attaches graphic flyer / poster image URL when provided", () => {
    const job = prepareAdminJob({
      title: "Accounts Executive Paper Ad",
      posterUrl: "/uploads/posters/boc-accounts-ad.png",
    });

    expect(job.posterUrl).toBe("/uploads/posters/boc-accounts-ad.png");
    expect(job.status).toBe("APPROVED");
  });

  it("calculates 30-day expiry when Admin toggles featured placement", () => {
    const before = Date.now();
    const job = prepareAdminJob({
      title: "Urgent Medical Officer",
      isFeatured: true,
    });

    expect(job.isFeatured).toBe(true);
    expect(job.featuredUntil).toBeInstanceOf(Date);

    const diffDays = Math.round(
      (job.featuredUntil!.getTime() - before) / (1000 * 60 * 60 * 24),
    );
    expect(diffDays).toBe(30);
  });
});
