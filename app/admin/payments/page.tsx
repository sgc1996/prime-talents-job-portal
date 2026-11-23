import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRoleUser } from "@/lib/auth/session";
import { AdminRepository } from "@/server/repositories/admin.repository";
import { PaymentVerificationTable } from "@/components/admin/payment-verification-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bank Slip Verifications | Prime Hire Admin",
  description: "Review uploaded employer bank deposit receipts and feature job postings.",
};

export default async function AdminPaymentsPage() {
  await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);
  const pendingSlips = await AdminRepository.getPendingSlips();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Bank Slip Payment Verifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Validate employer bank deposit receipts and transaction references to activate 30-day Featured placement.
          </p>
        </div>
      </div>

      <PaymentVerificationTable initialOrders={pendingSlips} />
    </div>
  );
}

