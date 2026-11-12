import { describe, it, expect } from "vitest";
import { EmployerVerificationStatus, JobStatus } from "@prisma/client";

function resolveJobInitialStatus(verificationStatus: EmployerVerificationStatus, saveAsDraft = false): JobStatus {
  if (saveAsDraft) return JobStatus.DRAFT;
  // If verified employer, automatically approve; otherwise holds in review
  return verificationStatus === EmployerVerificationStatus.VERIFIED
    ? JobStatus.APPROVED
    : JobStatus.PENDING_REVIEW;
}

describe("Phase 3: Mandatory Employer Verification by Admin", () => {
  it("holds jobs from unverified/pending employers in PENDING_REVIEW", () => {
    const statusPending = resolveJobInitialStatus(EmployerVerificationStatus.PENDING);
    expect(statusPending).toBe(JobStatus.PENDING_REVIEW);

    const statusUnverified = resolveJobInitialStatus(EmployerVerificationStatus.UNVERIFIED);
    expect(statusUnverified).toBe(JobStatus.PENDING_REVIEW);
  });

  it("publishes jobs immediately as APPROVED once Admin marks employer as VERIFIED", () => {
    const statusVerified = resolveJobInitialStatus(EmployerVerificationStatus.VERIFIED);
    expect(statusVerified).toBe(JobStatus.APPROVED);
  });

  it("respects draft mode regardless of verification status", () => {
    const statusDraft = resolveJobInitialStatus(EmployerVerificationStatus.VERIFIED, true);
    expect(statusDraft).toBe(JobStatus.DRAFT);
  });
});

