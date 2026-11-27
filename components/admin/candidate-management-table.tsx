"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  FileCheck,
  Send,
  Download,
  MapPin,
  Mail,
  Phone,
  Copy,
  Check,
  FileText,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CandidateDetailData, CandidateDetailsDialog } from "./candidate-details-dialog";

interface DistrictOption {
  id: string;
  name: string;
}

interface CandidateManagementTableProps {
  initialCandidates: CandidateDetailData[];
  districts: DistrictOption[];
  stats: {
    totalCandidates: number;
    totalApplications: number;
    openToWorkCount: number;
    candidatesWithCvCount: number;
  };
}

export function CandidateManagementTable({
  initialCandidates,
  districts,
  stats,
}: CandidateManagementTableProps) {
  const router = useRouter();
  const candidates = initialCandidates;
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [cvFilter, setCvFilter] = useState<"ALL" | "HAS_CV" | "NO_CV">("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<"ALL" | "OPEN">("ALL");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDetailData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    // District
    if (districtFilter !== "ALL") {
      if (c.candidateProfile?.district?.id !== districtFilter) return false;
    }

    // CV
    if (cvFilter === "HAS_CV" && !c.latestCv) return false;
    if (cvFilter === "NO_CV" && c.latestCv) return false;

    // Availability
    if (availabilityFilter === "OPEN" && !c.candidateProfile?.openToWork) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      const matchHeadline = c.candidateProfile?.headline?.toLowerCase().includes(q);
      const matchDistrict = c.candidateProfile?.district?.name?.toLowerCase().includes(q);
      const matchSummary = c.candidateProfile?.summary?.toLowerCase().includes(q);

      if (
        !matchName &&
        !matchEmail &&
        !matchPhone &&
        !matchHeadline &&
        !matchDistrict &&
        !matchSummary
      ) {
        return false;
      }
    }

    return true;
  });

  const copyToClipboard = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(`${label} copied to clipboard`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const exportToCSV = () => {
    if (filteredCandidates.length === 0) {
      toast.error("No candidates to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "District",
      "Headline",
      "Experience (Years)",
      "Education Level",
      "Expected Salary Min (LKR)",
      "Expected Salary Max (LKR)",
      "Open to Work",
      "Applications Count",
      "Has CV",
      "Registered Date",
    ];

    const rows = filteredCandidates.map((c) => [
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone || ""}"`,
      `"${c.candidateProfile?.district?.name || ""}"`,
      `"${(c.candidateProfile?.headline || "").replace(/"/g, '""')}"`,
      c.candidateProfile?.experienceYears ?? "",
      `"${c.candidateProfile?.educationLevel || ""}"`,
      c.candidateProfile?.expectedSalaryMin ?? "",
      c.candidateProfile?.expectedSalaryMax ?? "",
      c.candidateProfile?.openToWork ? "Yes" : "No",
      c.candidateProfile?.applications?.length || 0,
      c.latestCv ? "Yes" : "No",
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `prime_hire_candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredCandidates.length} candidate records`);
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Candidates */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Candidates
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.totalCandidates}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Registered job seekers</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Uploaded CVs */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Uploaded Resumes (CVs)
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.candidatesWithCvCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats.totalCandidates > 0
                ? `${((stats.candidatesWithCvCount / stats.totalCandidates) * 100).toFixed(0)}% with ready PDF CV`
                : "0% ready"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Open to Work */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Open to Work
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {stats.openToWorkCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Immediate availability</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Applications */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Total Applications
            </span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {stats.totalApplications}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Platform submissions</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
            <Send className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by candidate name, email, phone, headline, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="h-10 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Sri Lanka Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* CV Filter */}
            <select
              value={cvFilter}
              onChange={(e) => setCvFilter(e.target.value as any)}
              className="h-10 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All CV Statuses</option>
              <option value="HAS_CV">Has Uploaded CV</option>
              <option value="NO_CV">No CV Uploaded</option>
            </select>

            {/* Availability Filter */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="h-10 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Availabilities</option>
              <option value="OPEN">Open to Work Only</option>
            </select>

            {/* Export CSV Button */}
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="h-10 text-xs flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV ({filteredCandidates.length})</span>
            </Button>
          </div>
        </div>

        {/* Active Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredCandidates.length}</strong> of{" "}
            <strong className="text-slate-900 dark:text-white">{candidates.length}</strong> candidate profiles
          </span>
          {(search || districtFilter !== "ALL" || cvFilter !== "ALL" || availabilityFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setDistrictFilter("ALL");
                setCvFilter("ALL");
                setAvailabilityFilter("ALL");
              }}
              className="text-primary hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Candidate Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Career Credentials</th>
                <th className="py-3.5 px-4">Applications</th>
                <th className="py-3.5 px-4">CV / Resume</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((c) => {
                  const profile = c.candidateProfile;
                  const latestCv = c.latestCv;
                  const appsCount = profile?.applications?.length || 0;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Candidate Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center justify-center shrink-0 border border-emerald-300/40">
                            {c.name?.[0]?.toUpperCase() || "C"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{c.name || "Unnamed"}</span>
                              {profile?.openToWork && (
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Open to Work" />
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Joined {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a
                              href={`mailto:${c.email}`}
                              className="text-slate-700 dark:text-slate-300 hover:underline max-w-[160px] truncate"
                              title={c.email}
                            >
                              {c.email}
                            </a>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(c.email, `email-${c.id}`, "Email")}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              {copiedId === `email-${c.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {c.phone ? (
                              <>
                                <a
                                  href={`tel:${c.phone}`}
                                  className="text-slate-700 dark:text-slate-300 hover:underline"
                                >
                                  {c.phone}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(c.phone!, `phone-${c.id}`, "Phone")}
                                  className="text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                  {copiedId === `phone-${c.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </>
                            ) : (
                              <span className="text-slate-400 text-[11px]">No phone</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        {profile?.district ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {profile.district.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not specified</span>
                        )}
                      </td>

                      {/* Career Credentials */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-[200px]">
                          <p className="font-semibold text-slate-900 dark:text-white truncate" title={profile?.headline || ""}>
                            {profile?.headline || "No headline"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {profile?.experienceYears !== null && profile?.experienceYears !== undefined
                              ? `${profile.experienceYears} yrs exp`
                              : "Exp: N/A"}
                            {profile?.educationLevel ? ` • ${profile.educationLevel}` : ""}
                          </p>
                        </div>
                      </td>

                      {/* Applications Count */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(c)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                            appsCount > 0
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-200"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          <span>{appsCount} {appsCount === 1 ? "Job" : "Jobs"}</span>
                        </button>
                      </td>

                      {/* Resume / CV Download */}
                      <td className="py-3.5 px-4">
                        {latestCv ? (
                          <a
                            href={`/api/files/${latestCv.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download CV</span>
                            <span className="text-[10px] font-normal opacity-85">
                              ({formatFileSize(latestCv.sizeBytes)})
                            </span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                            <FileText className="w-3 h-3 text-slate-400" />
                            No CV
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCandidate(c)}
                          className="h-8 text-xs font-medium gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No candidate profiles found
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      No candidates match your current search and filter criteria. Try adjusting your query or resetting filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Full Profile & Application Dialog */}
      <CandidateDetailsDialog
        candidate={selectedCandidate}
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        onApplicationStatusUpdated={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
