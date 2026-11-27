"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Briefcase, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobSearchBarProps {
  districts: { name: string; code: string }[];
  sectors: { name: string; slug: string }[];
  initialKeyword?: string;
  initialDistrict?: string;
  initialSector?: string;
}

export function JobSearchBar({
  districts,
  sectors,
  initialKeyword = "",
  initialDistrict = "",
  initialSector = "",
}: JobSearchBarProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [district, setDistrict] = useState(initialDistrict);
  const [sector, setSector] = useState(initialSector);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (keyword.trim()) params.set("q", keyword.trim());
    if (district) params.set("district", district);
    if (sector) params.set("sector", sector);

    const query = params.toString();
    router.push(`/jobs${query ? `?${query}` : ""}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full rounded-xl border bg-card p-2.5 shadow-lg sm:p-3"
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-3">
        {/* Keyword input */}
        <div className="relative md:col-span-5 flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Job title, keywords, or company..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="h-12 w-full rounded-lg bg-background pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-input"
          />
        </div>

        {/* District dropdown */}
        <div className="relative md:col-span-3 flex items-center">
          <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="h-12 w-full appearance-none rounded-lg bg-background pl-10 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-input text-foreground truncate cursor-pointer"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Sector dropdown */}
        <div className="relative md:col-span-3 flex items-center">
          <Briefcase className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="h-12 w-full appearance-none rounded-lg bg-background pl-10 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-input text-foreground truncate cursor-pointer"
          >
            <option value="">All Sectors</option>
            {sectors.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Search Submit button */}
        <div className="md:col-span-1">
          <Button
            type="submit"
            className="h-12 w-full font-semibold shadow hover:shadow-md flex items-center justify-center gap-2 px-4 md:px-0"
            aria-label="Search Jobs"
          >
            <Search className="h-5 w-5 shrink-0" />
            <span className="md:hidden">Search</span>
          </Button>
        </div>
      </div>
    </form>
  );
}

