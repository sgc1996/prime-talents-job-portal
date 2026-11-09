"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitApplicationAction } from "@/server/actions/application.actions";
import { toast } from "sonner";
import { CheckCircle2, FileUp, Loader2, Send } from "lucide-react";
import Link from "next/link";

interface ScreeningQuestion {
  id: string;
  question: string;
  type: string;
  required: boolean;
}

interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  applyMethod: string;
  applyUrl?: string | null;
  applyEmail?: string | null;
  screeningQuestions?: ScreeningQuestion[];
  isLoggedIn: boolean;
  isCandidate: boolean;
  defaultCvId?: string | null;
}

export function ApplyModal({
  jobId,
  jobTitle,
  companyName,
  applyMethod,
  applyUrl,
  applyEmail,
  screeningQuestions = [],
  isLoggedIn,
  isCandidate,
  defaultCvId,
}: ApplyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cvFileId, setCvFileId] = useState<string>(defaultCvId || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If external URL or email, handle simply
  if (applyMethod === "EXTERNAL_URL" && applyUrl) {
    return (
      <a href={applyUrl} target="_blank" rel="noopener noreferrer">
        <Button size="lg" className="w-full sm:w-auto font-semibold">
          Apply on Company Website &rarr;
        </Button>
      </a>
    );
  }

  if (applyMethod === "EMAIL" && applyEmail) {
    return (
      <a href={`mailto:${applyEmail}?subject=Application for ${encodeURIComponent(jobTitle)}`}>
        <Button size="lg" className="w-full sm:w-auto font-semibold">
          Apply via Email ({applyEmail})
        </Button>
      </a>
    );
  }

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);

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
        throw new Error(data.error || "Failed to upload CV");
      }

      setCvFileId(data.file.id);
      toast.success("Resume uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload error");
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cvFileId) {
      toast.error("Please upload or attach your CV (PDF)");
      return;
    }

    // Verify required screening questions
    for (const q of screeningQuestions) {
      if (q.required && (!answers[q.id] || answers[q.id]?.trim() === "")) {
        toast.error(`Please answer: "${q.question}"`);
        return;
      }
    }

    setIsSubmitting(true);
    const result = await submitApplicationAction({
      jobId,
      cvFileId,
      coverLetter,
      answers,
    });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error || "Failed to submit application");
      return;
    }

    setIsSuccess(true);
    toast.success("Application submitted successfully!");
  };

  return (
    <>
      <Button
        size="lg"
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto font-semibold shadow hover:shadow-md"
      >
        <Send className="mr-2 h-4 w-4" />
        Apply for Position
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {!isLoggedIn ? (
            <div className="py-6 text-center space-y-4">
              <DialogTitle className="text-xl">Sign in to Apply</DialogTitle>
              <DialogDescription>
                You need a verified Job Seeker profile to submit applications to {companyName}.
              </DialogDescription>
              <div className="flex flex-col gap-2 pt-4">
                <Link href={`/login?callbackUrl=/jobs/${jobId}`}>
                  <Button className="w-full">Sign In to Your Account</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="w-full">
                    Create a Job Seeker Account
                  </Button>
                </Link>
              </div>
            </div>
          ) : !isCandidate ? (
            <div className="py-6 text-center space-y-3">
              <DialogTitle className="text-xl">Employer Account Detected</DialogTitle>
              <DialogDescription>
                You are currently signed in with an employer profile. Applications can only be submitted by Job Seeker accounts.
              </DialogDescription>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="mt-4">
                Close
              </Button>
            </div>
          ) : isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <DialogTitle className="text-2xl font-bold">Application Sent!</DialogTitle>
              <DialogDescription className="text-sm max-w-sm mx-auto">
                Your resume and application details have been successfully transmitted to <strong>{companyName}</strong>.
              </DialogDescription>
              <div className="flex flex-col gap-2 pt-4">
                <Link href="/candidate/applications">
                  <Button className="w-full">Track Application Status</Button>
                </Link>
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Back to Vacancy
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <DialogHeader>
                <DialogTitle className="text-xl">Apply for {jobTitle}</DialogTitle>
                <DialogDescription>
                  Submitting to <strong className="text-foreground">{companyName}</strong>
                </DialogDescription>
              </DialogHeader>

              {/* CV Upload Section */}
              <div className="space-y-2 rounded-lg border p-4 bg-muted/30">
                <Label className="text-sm font-semibold">Resume / CV (PDF format, max 5MB)</Label>
                {cvFileId && !selectedFile ? (
                  <div className="flex items-center justify-between text-xs text-emerald-600 bg-emerald-500/10 p-2.5 rounded border border-emerald-500/20">
                    <span>✓ Using your profile resume</span>
                    <label className="cursor-pointer font-semibold underline text-primary">
                      Replace
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input p-6 cursor-pointer hover:border-primary transition-colors">
                      <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs font-medium text-foreground">
                        {isUploading
                          ? "Uploading resume..."
                          : selectedFile
                            ? selectedFile.name
                            : "Click or drag to upload your PDF resume"}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1">PDF only, max 5MB</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        required={!cvFileId}
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Screening Questions */}
              {screeningQuestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Employer Screening Questions
                  </h4>
                  {screeningQuestions.map((q) => (
                    <div key={q.id} className="space-y-1.5">
                      <Label htmlFor={`q-${q.id}`} className="text-xs font-medium">
                        {q.question} {q.required && <span className="text-destructive">*</span>}
                      </Label>
                      {q.type === "YES_NO" ? (
                        <select
                          id={`q-${q.id}`}
                          required={q.required}
                          value={answers[q.id] || ""}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="w-full rounded-md border border-input bg-background p-2 text-sm"
                        >
                          <option value="">Select option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <Input
                          id={`q-${q.id}`}
                          required={q.required}
                          value={answers[q.id] || ""}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder="Your answer..."
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Cover Letter Note */}
              <div className="space-y-1.5">
                <Label htmlFor="cover-letter" className="text-xs font-medium">
                  Cover Note / Message to Recruiter (Optional)
                </Label>
                <Textarea
                  id="cover-letter"
                  placeholder="Briefly state why you're a good fit for this role..."
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting || isUploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading || !cvFileId}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Confirm & Submit Application"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

