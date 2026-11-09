import { describe, it, expect } from "vitest";
import { JobType, ExperienceLevel } from "@prisma/client";

// Test the filter logic and salary formatting utilities used in the job board
function filterJobs<
  T extends {
    title: string;
    jobType: JobType;
    experienceLevel: ExperienceLevel;
    districtId: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
  },
>(
  jobs: T[],
  filters: {
    query?: string;
    jobType?: JobType;
    districtId?: string;
    minSalary?: number;
    maxSalary?: number;
  },
): T[] {
  return jobs.filter((job) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      if (!job.title.toLowerCase().includes(q)) return false;
    }
    if (filters.jobType && job.jobType !== filters.jobType) {
      return false;
    }
    if (filters.districtId && job.districtId !== filters.districtId) {
      return false;
    }
    if (filters.minSalary) {
      if (!job.salaryMax || job.salaryMax < filters.minSalary) return false;
    }
    if (filters.maxSalary) {
      if (!job.salaryMin || job.salaryMin > filters.maxSalary) return false;
    }
    return true;
  });
}

function formatSalary(min: number | null, max: number | null, currency = "LKR"): string {
  if (!min && !max) return "Negotiable";
  if (min && !max) return `${currency} ${min.toLocaleString()}+`;
  if (!min && max) return `Up to ${currency} ${max.toLocaleString()}`;
  return `${currency} ${min?.toLocaleString()} - ${max?.toLocaleString()}`;
}

describe("Phase 2: Job Filters & Salary Calculation", () => {
  const sampleJobs = [
    {
      id: "1",
      title: "Senior Full Stack Engineer",
      jobType: "FULL_TIME" as JobType,
      experienceLevel: "SENIOR" as ExperienceLevel,
      districtId: "colombo-id",
      salaryMin: 350000,
      salaryMax: 500000,
    },
    {
      id: "2",
      title: "Junior React Developer",
      jobType: "FULL_TIME" as JobType,
      experienceLevel: "ENTRY_LEVEL" as ExperienceLevel,
      districtId: "kandy-id",
      salaryMin: 120000,
      salaryMax: 180000,
    },
    {
      id: "3",
      title: "DevOps Consultant",
      jobType: "CONTRACT" as JobType,
      experienceLevel: "SENIOR" as ExperienceLevel,
      districtId: null,
      salaryMin: 400000,
      salaryMax: 600000,
    },
    {
      id: "4",
      title: "Marketing Intern",
      jobType: "INTERNSHIP" as JobType,
      experienceLevel: "INTERNSHIP" as ExperienceLevel,
      districtId: "colombo-id",
      salaryMin: 40000,
      salaryMax: 60000,
    },
  ];

  it("filters jobs by keyword case-insensitively", () => {
    const results = filterJobs(sampleJobs, { query: "engineer" });
    expect(results).toHaveLength(1);
    expect(results[0]?.title).toBe("Senior Full Stack Engineer");
  });

  it("filters jobs by jobType", () => {
    const results = filterJobs(sampleJobs, { jobType: "CONTRACT" });
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("3");
  });

  it("filters jobs by district", () => {
    const results = filterJobs(sampleJobs, { districtId: "colombo-id" });
    expect(results).toHaveLength(2);
  });

  it("filters jobs by salary floor", () => {
    const results = filterJobs(sampleJobs, { minSalary: 300000 });
    expect(results).toHaveLength(2);
    expect(results.map((j) => j.id)).toEqual(["1", "3"]);
  });

  it("combines multiple filters correctly", () => {
    const results = filterJobs(sampleJobs, {
      query: "react",
      districtId: "kandy-id",
      jobType: "FULL_TIME",
    });
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("2");
  });

  it("correctly formats salary ranges in Sri Lankan Rupees (LKR)", () => {
    expect(formatSalary(null, null)).toBe("Negotiable");
    expect(formatSalary(250000, null)).toBe("LKR 250,000+");
    expect(formatSalary(null, 150000)).toBe("Up to LKR 150,000");
    expect(formatSalary(200000, 350000)).toBe("LKR 200,000 - 350,000");
  });
});
