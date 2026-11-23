"use client";
/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminJobAction } from "@/server/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { JobType, ExperienceLevel, EducationLevel, ApplyMethod } from "@prisma/client";
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  Sparkles,
  Building2,
} from "lucide-react";

interface Option {
  id: string;
  name: string;
}

interface EmployerOption {
  id: string;
  companyName: string;
}

interface AdminJobPostFormProps {
  sectors: Option[];
  districts: Option[];
  employers: EmployerOption[];
}

export function AdminJobPostForm({
  sectors,
  districts,
  employers,
}: AdminJobPostFormProps) {
  const router = useRouter();

  // Basic Information
  const [title, setTitle] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [city, setCity] = useState("");

  // Company affiliation
  const [companyMode, setCompanyMode] = useState<"EXISTING" | "DIRECT">("DIRECT");
  const [employerId, setEmployerId] = useState("");
  const [companyNameIfDirect, setCompanyNameIfDirect] = useState("");

  // Poster Image Upload
  const [posterUrl, setPosterUrl] = useState<string>("");
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  // Job specifics
  const [jobType, setJobType] = useState<JobType>("FULL_TIME");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("MID_LEVEL");
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("BACHELORS");

  // Salary
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryVisible, setSalaryVisible] = useState(true);

  // Content
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [requirementsHtml, setRequirementsHtml] = useState("");
  const [benefitsHtml, setBenefitsHtml] = useState("");

  // Apply channel
  const [applyMethod, setApplyMethod] = useState<ApplyMethod>("EMAIL");
  const [applyUrl, setApplyUrl] = useState("");
  const [applyEmail, setApplyEmail] = useState("");

  // Featuring
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Image Flyer Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image (JPG, PNG, or WebP)");
      return;
    }

    try {
      setIsUploadingPoster(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "POSTER");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload image");
      }

      const result = await res.json();
      setPosterUrl(result.url);
      toast.success("Job flyer/poster image uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload poster");
    } finally {
      setIsUploadingPoster(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Job title is required");
      return;
    }
    if (!sectorId) {
      toast.error("Please select a sector");
      return;
    }
    if (companyMode === "EXISTING" && !employerId) {
      toast.error("Please select an employer");
      return;
    }
    if (companyMode === "DIRECT" && !companyNameIfDirect.trim()) {
      toast.error("Please enter company name");
      return;
    }
    if (!descriptionHtml.trim() && !posterUrl) {
      toast.error("Please provide either a job description or upload a flyer poster image");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createAdminJobAction({
        title,
        employerId: companyMode === "EXISTING" ? employerId : undefined,
        companyNameIfDirect: companyMode === "DIRECT" ? companyNameIfDirect : undefined,
        posterUrl: posterUrl || undefined,
        sectorId,
        districtId: districtId || undefined,
        city: city || undefined,
        jobType,
        experienceLevel,
        educationLevel,
        salaryMin: salaryMin ? parseInt(salaryMin, 10) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax, 10) : undefined,
        salaryVisible,
        descriptionHtml: descriptionHtml.trim() || "See attached job advertisement flyer for complete vacancy details.",
        requirementsHtml: requirementsHtml.trim() || undefined,
        benefitsHtml: benefitsHtml.trim() || undefined,
        applyMethod,
        applyUrl: applyUrl.trim() || undefined,
        applyEmail: applyEmail.trim() || undefined,
        isFeatured,
      });

      toast.success("Vacancy published successfully by Admin!");
      router.push(`/jobs/${res.slug}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* 1. Job Basics & Company */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5 border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>1. Role &amp; Hiring Organization</span>
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="title">Vacancy Title *</Label>
          <Input
            id="title"
            required
            placeholder="e.g. Accounts Executive / Software Engineer / Management Trainee"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Company Selection Mode */}
        <div className="space-y-3 pt-1">
          <Label>Publishing on behalf of:</Label>
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="radio"
                name="companyMode"
                checked={companyMode === "DIRECT"}
                onChange={() => setCompanyMode("DIRECT")}
                className="text-emerald-600"
              />
              <span>Direct / Paper Ad (Enter Company Name)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="radio"
                name="companyMode"
                checked={companyMode === "EXISTING"}
                onChange={() => setCompanyMode("EXISTING")}
                className="text-emerald-600"
              />
              <span>Registered Portal Employer</span>
            </label>
          </div>

          {companyMode === "DIRECT" ? (
            <div className="space-y-1.5">
              <Label htmlFor="companyNameIfDirect">Company Name *</Label>
              <Input
                id="companyNameIfDirect"
                required
                placeholder="e.g. Commercial Bank of Ceylon PLC / Dialog Axiata / MAS"
                value={companyNameIfDirect}
                onChange={(e) => setCompanyNameIfDirect(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="employerId">Select Registered Employer *</Label>
              <select
                id="employerId"
                required
                value={employerId}
                onChange={(e) => setEmployerId(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-sm"
              >
                <option value="">Choose Employer Organization</option>
                {employers.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="sector">Sector / Industry *</Label>
            <select
              id="sector"
              required
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-sm"
            >
              <option value="">Select Industry Sector</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="district">District Location</Label>
            <select
              id="district"
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-sm"
            >
              <option value="">All Sri Lanka / Islandwide</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} District
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">City / Town (Optional)</Label>
            <Input
              id="city"
              placeholder="e.g. Kollupitiya, Kandy City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <Label>Employment Type</Label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value as JobType)}
              className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-sm"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Experience Level</Label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-sm"
            >
              <option value="ENTRY_LEVEL">Entry Level / Trainee</option>
              <option value="MID_LEVEL">Mid Level (2-4 yrs)</option>
              <option value="SENIOR">Senior (5+ yrs)</option>
              <option value="EXECUTIVE">Executive / Lead</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Education Level</Label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
              className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-sm"
            >
              <option value="BACHELORS">Bachelor&apos;s Degree</option>
              <option value="MASTERS">Master&apos;s / Postgraduate</option>
              <option value="DIPLOMA">Diploma / HND</option>
              <option value="ADVANCED_LEVEL">A/L Passed</option>
              <option value="ORDINARY_LEVEL">O/L Passed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <Label htmlFor="salaryMin">Minimum Salary (LKR)</Label>
            <Input
              id="salaryMin"
              type="number"
              placeholder="e.g. 150000"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="salaryMax">Maximum Salary (LKR)</Label>
            <Input
              id="salaryMax"
              type="number"
              placeholder="e.g. 250000"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
              <input
                type="checkbox"
                checked={salaryVisible}
                onChange={(e) => setSalaryVisible(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600"
              />
              <span>Display salary on public card</span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Poster / Flyer Image Upload (HIGHLIGHTED FEATURE) */}
      <div className="rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Vacancy Flyer / Paper Ad Image (Graphic Poster)</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Upload the graphic newspaper clipping, social media poster, or flyer (PNG, JPG, or WebP up to 10MB).
            </p>
          </div>

          {posterUrl && (
            <button
              type="button"
              onClick={() => setPosterUrl("")}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-xs flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Remove Poster</span>
            </button>
          )}
        </div>

        {posterUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 max-h-96 flex items-center justify-center p-2">
            <img
              src={posterUrl}
              alt="Uploaded Vacancy Flyer Preview"
              className="max-h-80 object-contain rounded-lg shadow-sm"
            />
            <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Poster Attached
            </div>
          </div>
        ) : (
          <label className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 transition group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploadingPoster}
              className="hidden"
            />
            {isUploadingPoster ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs font-medium text-slate-600">Uploading poster image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Click to Browse or Drag &amp; Drop Image Flyer
                </p>
                <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP (Max 10MB)</p>
              </div>
            )}
          </label>
        )}
      </div>

      {/* 3. Description & Details */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          3. Vacancy Description &amp; Requirements
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="desc">Overview / Key Responsibilities</Label>
          <Textarea
            id="desc"
            placeholder="Outline responsibilities or summarize the poster ad..."
            rows={4}
            value={descriptionHtml}
            onChange={(e) => setDescriptionHtml(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reqs">Qualifications &amp; Requirements (Optional)</Label>
          <Textarea
            id="reqs"
            placeholder="Qualifications, skills, or experience needed..."
            rows={3}
            value={requirementsHtml}
            onChange={(e) => setRequirementsHtml(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="benefits">Benefits &amp; Allowances (Optional)</Label>
          <Textarea
            id="benefits"
            placeholder="Transport allowances, medical insurance, flexible hours..."
            rows={2}
            value={benefitsHtml}
            onChange={(e) => setBenefitsHtml(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Application Channel */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          4. How Should Candidates Apply?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: "EMAIL", label: "Direct Email", desc: "Candidates send CV to specific email" },
            { id: "EXTERNAL_URL", label: "External Link", desc: "Redirects to external company career URL" },
            { id: "ON_PLATFORM", label: "Prime Hire Easy Apply", desc: "Submit PDF resume on Prime Hire" },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setApplyMethod(m.id as ApplyMethod)}
              className={`p-3 text-left rounded-xl border text-xs transition ${
                applyMethod === m.id
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <p className="font-semibold text-slate-900 dark:text-white mb-1">{m.label}</p>
              <p className="text-slate-500 text-[11px]">{m.desc}</p>
            </button>
          ))}
        </div>

        {applyMethod === "EMAIL" && (
          <div className="space-y-1.5 pt-2">
            <Label htmlFor="applyEmail">Destination Email *</Label>
            <Input
              id="applyEmail"
              type="email"
              required
              placeholder="careers@company.com"
              value={applyEmail}
              onChange={(e) => setApplyEmail(e.target.value)}
            />
          </div>
        )}

        {applyMethod === "EXTERNAL_URL" && (
          <div className="space-y-1.5 pt-2">
            <Label htmlFor="applyUrl">Career Link / URL *</Label>
            <Input
              id="applyUrl"
              type="url"
              required
              placeholder="https://careers.company.com/apply/..."
              value={applyUrl}
              onChange={(e) => setApplyUrl(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* 5. Featured Toggle */}
      <div className="rounded-2xl border bg-amber-500/10 border-amber-500/30 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Feature this Vacancy on Homepage &amp; Top of Search
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pins vacancy to featured showcase for 30 days.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 h-11"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publishing Vacancy...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Publish Vacancy (Live)
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
