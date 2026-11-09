"use client";

import * as React from "react";
import { useState } from "react";
import { updateCandidateProfileAction } from "@/server/actions/profile.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, FileUp, Loader2, Save } from "lucide-react";
import { EducationLevel, ProfileVisibility } from "@prisma/client";

interface DistrictOption {
  id: string;
  name: string;
}

interface CandidateProfileFormProps {
  initialData?: {
    headline?: string | null;
    summary?: string | null;
    phone?: string | null;
    districtId?: string | null;
    expectedSalaryMin?: number | null;
    expectedSalaryMax?: number | null;
    experienceYears?: number | null;
    educationLevel?: EducationLevel | null;
    visibility?: ProfileVisibility | null;
    openToWork?: boolean | null;
  } | null;
  districts: DistrictOption[];
  latestCv?: {
    id: string;
    url: string;
    key: string;
  } | null;
}

export function CandidateProfileForm({
  initialData,
  districts,
  latestCv,
}: CandidateProfileFormProps) {
  const [headline, setHeadline] = useState(initialData?.headline || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [districtId, setDistrictId] = useState(initialData?.districtId || "");
  const [expectedSalaryMin, setExpectedSalaryMin] = useState<string>(
    initialData?.expectedSalaryMin?.toString() || "",
  );
  const [expectedSalaryMax, setExpectedSalaryMax] = useState<string>(
    initialData?.expectedSalaryMax?.toString() || "",
  );
  const [experienceYears, setExperienceYears] = useState<string>(
    initialData?.experienceYears?.toString() || "",
  );
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(
    initialData?.educationLevel || "BACHELORS",
  );
  const [visibility, setVisibility] = useState<ProfileVisibility>(
    initialData?.visibility || "PUBLIC",
  );
  const [openToWork, setOpenToWork] = useState<boolean>(
    initialData?.openToWork ?? true,
  );

  const [currentCv, setCurrentCv] = useState(latestCv);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCvUpload = async (file: File) => {
    setIsUploadingCv(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "CV");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload resume");
      }

      setCurrentCv({
        id: data.file.id,
        url: data.file.url,
        key: data.file.fileName,
      });
      toast.success("Resume uploaded and updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const result = await updateCandidateProfileAction({
      headline,
      summary,
      phone,
      districtId: districtId || undefined,
      expectedSalaryMin: expectedSalaryMin ? parseInt(expectedSalaryMin, 10) : undefined,
      expectedSalaryMax: expectedSalaryMax ? parseInt(expectedSalaryMax, 10) : undefined,
      experienceYears: experienceYears ? parseInt(experienceYears, 10) : undefined,
      educationLevel,
      visibility,
      openToWork,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error("Failed to save profile changes");
      return;
    }

    toast.success("Candidate profile updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* 1. Resume / CV Section */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Curriculum Vitae (CV / Resume)</span>
        </h3>

        {currentCv ? (
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Current Resume (PDF)</p>
                <a
                  href={`/api/files/${currentCv.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  View / Download Attached File
                </a>
              </div>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors">
              <FileUp className="h-3.5 w-3.5" />
              <span>Replace</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={isUploadingCv}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCvUpload(file);
                }}
              />
            </label>
          </div>
        ) : (
          <div>
            <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input p-6 cursor-pointer hover:border-primary transition-colors">
              <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium text-foreground">
                {isUploadingCv ? "Uploading PDF resume..." : "Upload your resume (PDF only, max 5MB)"}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Used to fast-track applications across Sri Lankan employers
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={isUploadingCv}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCvUpload(file);
                }}
              />
            </label>
          </div>
        )}
      </div>

      {/* 2. Professional Headline & Summary */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground">Professional Summary</h3>

        <div className="space-y-1.5">
          <Label htmlFor="headline">Professional Headline</Label>
          <Input
            id="headline"
            placeholder="e.g. Senior Full Stack Engineer (React / Node / PostgreSQL)"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            A concise title highlighting your core specialization.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="summary">About &amp; Career Objective</Label>
          <Textarea
            id="summary"
            placeholder="Briefly describe your experience, achievements, and the roles you are targeting..."
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Location & Career Preferences */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground">Location &amp; Compensation</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Contact Number</Label>
            <Input
              id="phone"
              placeholder="0771234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="district">District of Residence</Label>
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
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="salary-min">Expected Minimum Monthly Salary (LKR)</Label>
            <Input
              id="salary-min"
              type="number"
              placeholder="e.g. 150000"
              value={expectedSalaryMin}
              onChange={(e) => setExpectedSalaryMin(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="salary-max">Expected Maximum Monthly Salary (LKR)</Label>
            <Input
              id="salary-max"
              type="number"
              placeholder="e.g. 250000"
              value={expectedSalaryMax}
              onChange={(e) => setExpectedSalaryMax(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="experience">Years of Professional Experience</Label>
            <Input
              id="experience"
              type="number"
              placeholder="e.g. 4"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="education">Highest Level of Education</Label>
            <select
              id="education"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
            >
              <option value="ORDINARY_LEVEL">G.C.E. Ordinary Level</option>
              <option value="ADVANCED_LEVEL">G.C.E. Advanced Level</option>
              <option value="DIPLOMA">Diploma / NVQ</option>
              <option value="BACHELORS">Bachelor&apos;s Degree</option>
              <option value="MASTERS">Master&apos;s Degree</option>
              <option value="DOCTORATE">Doctorate (PhD)</option>
              <option value="OTHER">Other Professional Certificate</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Privacy & Availability */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground">Visibility &amp; Availability</h3>

        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <Label className="text-sm font-semibold">Immediate Availability</Label>
            <p className="text-xs text-muted-foreground">Show employers that you are actively seeking work.</p>
          </div>
          <input
            type="checkbox"
            checked={openToWork}
            onChange={(e) => setOpenToWork(e.target.checked)}
            className="h-5 w-5 rounded border-input text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        <div className="space-y-1.5 pt-2">
          <Label htmlFor="visibility">Profile Visibility</Label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as ProfileVisibility)}
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
          >
            <option value="PUBLIC">Public (Visible to verified recruiters &amp; search)</option>
            <option value="EMPLOYERS_ONLY">Employers Only (Hidden from general web)</option>
            <option value="HIDDEN">Private / Hidden (Only visible to jobs I apply to)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" type="submit" disabled={isSaving} className="font-semibold px-8 shadow">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
