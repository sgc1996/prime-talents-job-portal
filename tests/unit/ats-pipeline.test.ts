import { describe, it, expect } from "vitest";
import { ApplicationStatus } from "@prisma/client";

// ATS Pipeline State Machine logic
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  NEW: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFERED", "REJECTED"],
  OFFERED: ["HIRED", "REJECTED"],
  HIRED: ["ARCHIVED" as any], // terminal or archived
  REJECTED: ["SHORTLISTED"], // allow reconsideration
};

function canTransition(current: ApplicationStatus, next: ApplicationStatus): boolean {
  if (current === next) return true;
  const allowed = VALID_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

function getNextPipelineStage(current: ApplicationStatus): ApplicationStatus | null {
  switch (current) {
    case "NEW":
      return "SHORTLISTED";
    case "SHORTLISTED":
      return "INTERVIEW";
    case "INTERVIEW":
      return "OFFERED";
    case "OFFERED":
      return "HIRED";
    default:
      return null;
  }
}

describe("Phase 2: ATS Pipeline & Candidate Lifecycle", () => {
  it("allows standard linear progression: NEW -> SHORTLISTED -> INTERVIEW -> OFFERED -> HIRED", () => {
    let current: ApplicationStatus = "NEW";

    const next1 = getNextPipelineStage(current)!;
    expect(next1).toBe("SHORTLISTED");
    expect(canTransition(current, next1)).toBe(true);

    current = next1;
    const next2 = getNextPipelineStage(current)!;
    expect(next2).toBe("INTERVIEW");
    expect(canTransition(current, next2)).toBe(true);

    current = next2;
    const next3 = getNextPipelineStage(current)!;
    expect(next3).toBe("OFFERED");
    expect(canTransition(current, next3)).toBe(true);

    current = next3;
    const next4 = getNextPipelineStage(current)!;
    expect(next4).toBe("HIRED");
    expect(canTransition(current, next4)).toBe(true);

    expect(getNextPipelineStage(next4)).toBeNull();
  });

  it("permits rejection at any active interview stage", () => {
    expect(canTransition("NEW", "REJECTED")).toBe(true);
    expect(canTransition("SHORTLISTED", "REJECTED")).toBe(true);
    expect(canTransition("INTERVIEW", "REJECTED")).toBe(true);
    expect(canTransition("OFFERED", "REJECTED")).toBe(true);
  });

  it("allows reconsideration of rejected candidates back to shortlisted", () => {
    expect(canTransition("REJECTED", "SHORTLISTED")).toBe(true);
  });

  it("blocks direct jump from NEW to HIRED without evaluation", () => {
    expect(canTransition("NEW", "HIRED")).toBe(false);
  });
});

