"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJobAction } from "@/server/actions/employer.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { JobType, ExperienceLevel, EducationLevel, ApplyMethod } from "@prisma/client";
import { Plus, Trash2, Loader2, Send, Save } from "lucide-react";

interface Option {
  id: string;
  name: string;
}

interface JobWizardFormProps {
  sectors: Option[];
  districts: Option[];
}

interface Question {
  question: string;
  type: "TEXT" | "YES_NO";
  required: boolean;
}

export function JobWizardForm({ sectors, districts }: JobWizardFormProps) {
  const router = useRouter();

  // Basic info
  const [title, setTitle] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [jobType, setJobType] = useState<JobType>("FULL_TIME");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("MID_LEVEL");
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("BACHELORS");
  const [vacancies, setVacancies] = useState("1");

  // Location
  const [districtId, setDistrictId] = useState("");
  const [city, setCity] = useState("");

  // Compensation
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryVisible, setSalaryVisible] = useState(true);

  // Content
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [requirementsHtml, setRequirementsHtml] = useState("");
  const [benefitsHtml, setBenefitsHtml] = useState("");

  // Application method
  const [applyMethod, setApplyMethod] = useState<ApplyMethod>("ON_PLATFORM");
  const [applyUrl, setApplyUrl] = useState("");
  const [applyEmail, setApplyEmail] = useState("");

  // Screening questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { question: "", type: "TEXT", required: true }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: unknown) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index]!, [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (saveAsDraft = false) => {
    if (!title.trim()) {
      toast.error("Please enter a job title");
      return;
    }
    if (!sectorId) {
      toast.error("Please select an industry sector");
      return;
    }
    if (!descriptionHtml.trim()) {
      toast.error("Please provide a job description");
      return;
    }

    setIsSubmitting(true);

    try {
      await createJobAction({
        title,
        sectorId,
        jobType,
        experienceLevel,
        educationLevel,
        vacancies: parseInt(vacancies, 10) || 1,
        districtId: districtId || undefined,
        city: city || undefined,
        salaryMin: salaryMin ? parseInt(salaryMin, 10) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax, 10) : undefined,
        salaryVisible,
        descriptionHtml,
        requirementsHtml: requirementsHtml || undefined,
        benefitsHtml: benefitsHtml || undefined,
        applyMethod,
        applyUrl: applyUrl || undefined,
        applyEmail: applyEmail || undefined,
        screeningQuestions: questions.filter((q) => q.question.trim().length > 0),
        saveAsDraft,
      });

      toast.success(saveAsDraft ? "Draft saved successfully" : "Vacancy published successfully!");
      router.push(`/employer/jobs`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* 1. Job Basics */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground">1. Role &amp; Classification</h3>

        <div className="space-y-1.5">
          <Label htmlFor="job-title">Job Title</Label>
          <Input
            id="job-title"
            required
            placeholder="e.g. Senior Backend Engineer (Node.js & Postgres)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sector">Industry Sector</Label>
            <select
              id="sector"
              required
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
            >
              <option value="">Select Sector</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="job-type">Employment Type</Label>
            <select
              id="job-type"
              value={jobType}
              onChange={(e) => setJobType(e.target.value as JobType)}
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="REMOTE">Fully Remote</option>
              <option value="HYBRID">Hybrid (Work from Home + Office)</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="experience">Experience Level</Label>
            <select
              id="experience"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
            >
              <option value="ENTRY_LEVEL">Entry Level / Trainee</option>
              <option value="JUNIOR">Junior (1-2 yrs)</option>
              <option value="MID_LEVEL">Mid Level (3-5 yrs)</option>
              <option value="SENIOR">Senior (5+ yrs)</option>
              <option value="LEAD">Lead / Managerial</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="education">Minimum Education</Label>
            <select
              id="education"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
            >
              <option value="ORDINARY_LEVEL">G.C.E. O/L</option>
              <option value="ADVANCED_LEVEL">G.C.E. A/L</option>
              <option value="DIPLOMA">Diploma / NVQ</option>
              <option value="BACHELORS">Bachelor&apos;s Degree</option>
              <option value="MASTERS">Master&apos;s Degree</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vacancies">Vacancies</Label>
            <Input
              id="vacancies"
              type="number"
              min={1}
              value={vacancies}
              onChange={(e) => setVacancies(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2. Location & Compensation */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground">2. Location &amp; Salary</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="district">Primary District</Label>
            <select
              id="district"
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} District
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">City / Suburb (Optional)</Label>
            <Input
              id="city"
              placeholder="e.g. Kollupitiya, Nugegoda, Peradeniya"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sal-min">Min Monthly Salary (LKR)</Label>
            <Input
              id="sal-min"
              type="number"
              placeholder="e.g. 150000"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sal-max">Max Monthly Salary (LKR)</Label>
            <Input
              id="sal-max"
              type="number"
              placeholder="e.g. 250000"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="sal-vis"
            type="checkbox"
            checked={salaryVisible}
            onChange={(e) => setSalaryVisible(e.target.checked)}
            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
          />
          <Label htmlFor="sal-vis" className="text-xs cursor-pointer">
            Display salary range publicly on the vacancy listing (increases applicant engagement by 40%)
          </Label>
        </div>
      </div>

      {/* 3. Job Description & Requirements */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground">3. Description &amp; Details</h3>

        <div className="space-y-1.5">
          <Label htmlFor="desc">Job Description (HTML or plain text)</Label>
          <Textarea
            id="desc"
            required
            placeholder="Outline the core responsibilities, team structure, and day-to-day workflow..."
            rows={5}
            value={descriptionHtml}
            onChange={(e) => setDescriptionHtml(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reqs">Key Requirements &amp; Skills</Label>
          <Textarea
            id="reqs"
            placeholder="List required technical skills, qualifications, and past experience..."
            rows={4}
            value={requirementsHtml}
            onChange={(e) => setRequirementsHtml(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="benefits">Benefits &amp; Perks</Label>
          <Textarea
            id="benefits"
            placeholder="Medical insurance, allowances, performance bonuses, work equipment..."
            rows={3}
            value={benefitsHtml}
            onChange={(e) => setBenefitsHtml(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Application Channel */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground">4. Application Channel</h3>

        <div className="space-y-3">
          <Label>How should candidates apply?</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "ON_PLATFORM", label: "Prime Hire Easy Apply", desc: "Collect CV & screen candidates on Prime Hire ATS" },
              { id: "EXTERNAL_URL", label: "External Career Page", desc: "Redirect to your external website / ATS URL" },
              { id: "EMAIL", label: "Direct Email", desc: "Receive CVs and portfolios directly to your inbox" },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setApplyMethod(method.id as ApplyMethod)}
                className={`p-3.5 text-left rounded-xl border text-xs transition ${
                  applyMethod === method.id
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs"
                    : "border-input hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <p className="font-semibold text-slate-900 dark:text-white mb-1">{method.label}</p>
                <p className="text-slate-500 text-[11px] leading-relaxed">{method.desc}</p>
              </button>
            ))}
          </div>

          {applyMethod === "EXTERNAL_URL" && (
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="apply-url">Application URL</Label>
              <Input
                id="apply-url"
                type="url"
                placeholder="https://careers.yourcompany.com/apply/..."
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
              />
            </div>
          )}

          {applyMethod === "EMAIL" && (
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="apply-email">Destination Email</Label>
              <Input
                id="apply-email"
                type="email"
                placeholder="careers@yourcompany.com"
                value={applyEmail}
                onChange={(e) => setApplyEmail(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 5. Screening Questions */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">5. Screening Questions</h3>
            <p className="text-xs text-muted-foreground">Ask candidates specific questions before they submit.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuestion}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Question</span>
          </Button>
        </div>

        {questions.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 italic">
            No screening questions added. Candidates will submit with resume and optional cover note.
          </p>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="e.g. Do you have at least 3 years experience with Node.js?"
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                  />
                  <div className="flex items-center gap-4 text-xs">
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(idx, "type", e.target.value)}
                      className="rounded border border-input bg-background p-1 text-xs"
                    >
                      <option value="TEXT">Short Answer (Text)</option>
                      <option value="YES_NO">Yes / No</option>
                    </select>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(idx, "required", e.target.checked)}
                        className="rounded border-input text-primary"
                      />
                      <span>Required to answer</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeQuestion(idx)}
                  className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => handleSubmit(true)}
          className="flex items-center gap-1.5 font-semibold"
        >
          <Save className="h-4 w-4" />
          <span>Save as Draft</span>
        </Button>

        <Button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSubmit(false)}
          className="flex items-center gap-1.5 font-semibold px-6 shadow"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              <span>Publish Vacancy</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
