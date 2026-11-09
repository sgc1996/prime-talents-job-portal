"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";

interface FilterSidebarProps {
  districts: { name: string; code: string }[];
  sectors: { name: string; slug: string }[];
}

export function JobFilterSidebar({ districts, sectors }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentKeyword = searchParams.get("q") || "";
  const currentSector = searchParams.get("sector") || "";
  const currentDistrict = searchParams.get("district") || "";
  const currentType = searchParams.get("type") || "";
  const currentLevel = searchParams.get("level") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset page on filter change
    router.push(`/jobs?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/jobs");
  };

  const hasActiveFilters =
    Boolean(currentKeyword) ||
    Boolean(currentSector) ||
    Boolean(currentDistrict) ||
    Boolean(currentType) ||
    Boolean(currentLevel);

  const jobTypes = [
    { label: "Full Time", value: "FULL_TIME" },
    { label: "Part Time", value: "PART_TIME" },
    { label: "Contract", value: "CONTRACT" },
    { label: "Remote", value: "REMOTE" },
    { label: "Hybrid", value: "HYBRID" },
    { label: "Internship", value: "INTERNSHIP" },
  ];

  const experienceLevels = [
    { label: "Entry Level", value: "ENTRY_LEVEL" },
    { label: "Junior", value: "JUNIOR" },
    { label: "Mid Level", value: "MID_LEVEL" },
    { label: "Senior", value: "SENIOR" },
    { label: "Lead / Manager", value: "LEAD" },
  ];

  return (
    <div className="space-y-6 rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Filter Vacancies</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
          >
            <X className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Sector filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Industry Sector
        </label>
        <select
          value={currentSector}
          onChange={(e) => updateFilter("sector", e.target.value)}
          className="w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Sectors</option>
          {sectors.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* District filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          District
        </label>
        <select
          value={currentDistrict}
          onChange={(e) => updateFilter("district", e.target.value)}
          className="w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All 25 Districts</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name} District
            </option>
          ))}
        </select>
      </div>

      {/* Job Type filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Job Type
        </label>
        <div className="space-y-1.5 pt-1">
          {jobTypes.map((type) => {
            const isChecked = currentType === type.value;
            return (
              <label
                key={type.value}
                className="flex cursor-pointer items-center space-x-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => updateFilter("type", isChecked ? "" : type.value)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span>{type.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Experience Level filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Experience Level
        </label>
        <div className="space-y-1.5 pt-1">
          {experienceLevels.map((level) => {
            const isChecked = currentLevel === level.value;
            return (
              <label
                key={level.value}
                className="flex cursor-pointer items-center space-x-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => updateFilter("level", isChecked ? "" : level.value)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span>{level.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
}

