"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitBankSlipAction } from "@/server/actions/manual-payment.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Sparkles,
  Upload,
  Building,
  CheckCircle2,
  Loader2,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface BankSlipUploadFormProps {
  job: {
    id: string;
    title: string;
    slug: string;
    isFeatured: boolean;
  };
  existingPendingOrder?: {
    id: string;
    createdAt: Date | string;
    bankReference?: string | null;
  } | null;
}

export function BankSlipUploadForm({ job, existingPendingOrder }: BankSlipUploadFormProps) {
  const router = useRouter();

  const [slipFileId, setSlipFileId] = useState("");
  const [bankReference, setBankReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If there's already a pending order under review
  if (existingPendingOrder) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center space-y-3">
        <Clock className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Payment Slip Under Verification
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          You have already uploaded a bank deposit slip for this vacancy (Ref:{" "}
          <span className="font-mono font-semibold">{existingPendingOrder.bankReference || "N/A"}</span>). Our team is verifying the deposit. Once approved, your listing will be featured for 30 days.
        </p>
        <Badge variant="outline" className="text-amber-600 border-amber-500/40">
          Status: Verification Pending
        </Badge>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "BANK_SLIP");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload slip");
      }

      const result = await res.json();
      setSlipFileId(result.fileId);
      toast.success("Bank deposit slip uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slipFileId) {
      toast.error("Please upload your bank deposit slip or transfer receipt");
      return;
    }
    if (!bankReference.trim()) {
      toast.error("Please provide the bank transfer reference number");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitBankSlipAction({
        jobId: job.id,
        slipFileId,
        bankReference,
        notes: notes.trim() || undefined,
      });

      toast.success("Deposit slip submitted! WorkLanka admin will verify and activate your featured promotion.");
      router.push(`/employer/jobs`);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit promotion request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Package Header Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            30-Day Featured Job Promotion
          </h2>
          <Badge className="bg-amber-500 text-white ml-auto">LKR 15,000</Badge>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Target vacancy: <span className="font-semibold text-slate-900 dark:text-white">{job.title}</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-500/20">
            <p className="font-bold text-slate-900 dark:text-white">Pinned to Top</p>
            <p className="text-[11px] text-slate-500">Highlighted in search results above standard ads</p>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-500/20">
            <p className="font-bold text-slate-900 dark:text-white">Homepage Spotlight</p>
            <p className="text-[11px] text-slate-500">Included in the Featured Vacancies carousel</p>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-500/20">
            <p className="font-bold text-slate-900 dark:text-white">4x More Applicants</p>
            <p className="text-[11px] text-slate-500">Prominent badge attracts higher qualified candidates</p>
          </div>
        </div>
      </div>

      {/* Official Bank Account Details */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Building className="w-4 h-4 text-emerald-600" />
          <span>Official WorkLanka Bank Accounts (Direct Deposit / Online Transfer)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Account 1: Commercial Bank */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Commercial Bank of Ceylon</span>
            <p><span className="text-slate-500">Account Name:</span> WorkLanka Technologies (Pvt) Ltd</p>
            <p><span className="text-slate-500">Account Number:</span> <span className="font-mono font-bold">1000 8472 9182</span></p>
            <p><span className="text-slate-500">Branch:</span> Kollupitiya Super Branch (Code: 045)</p>
          </div>

          {/* Account 2: BOC */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
            <span className="font-bold text-amber-600 dark:text-amber-400">Bank of Ceylon (BOC)</span>
            <p><span className="text-slate-500">Account Name:</span> WorkLanka Technologies (Pvt) Ltd</p>
            <p><span className="text-slate-500">Account Number:</span> <span className="font-mono font-bold">0089 2819 2819</span></p>
            <p><span className="text-slate-500">Branch:</span> Corporate Branch (Code: 001)</p>
          </div>
        </div>
      </div>

      {/* Upload Deposit Slip Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Upload Bank Receipt / Deposit Slip
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="slip">Attach Slip (Photo or PDF) *</Label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <input
                id="slip"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <div className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition">
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>{slipFileId ? "Replace Slip" : "Choose Slip File"}</span>
                  </>
                )}
              </div>
            </label>

            {slipFileId && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Receipt Attached
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <Label htmlFor="ref">Bank Transfer Reference / Transaction ID *</Label>
          <Input
            id="ref"
            required
            placeholder="e.g. TXN-98218274 or Slip Ref No."
            value={bankReference}
            onChange={(e) => setBankReference(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Additional Comments / Billing Notes (Optional)</Label>
          <Textarea
            id="notes"
            rows={2}
            placeholder="e.g. Transferred via Commercial Bank Online banking on 9th Nov..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !slipFileId}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Slip...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Submit Slip for Verification
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
