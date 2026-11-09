"use client";
/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { useState } from "react";
import { approveBankSlipAction } from "@/server/actions/manual-payment.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  ExternalLink,
  Calendar,
  Sparkles,
  Loader2,
  Eye,
} from "lucide-react";

interface PendingOrder {
  id: string;
  amountLkr: number;
  slipFileId: string | null;
  bankReference: string | null;
  adminNote?: string | null;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  job?: {
    id: string;
    title: string;
    slug: string;
    isFeatured: boolean;
    employer: {
      companyName: string;
    };
  } | null;
  package: {
    name: string;
    durationDays: number;
  };
}

interface PaymentVerificationTableProps {
  initialOrders: PendingOrder[];
}

export function PaymentVerificationTable({ initialOrders }: PaymentVerificationTableProps) {
  const [orders, setOrders] = useState<PendingOrder[]>(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<PendingOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async (orderId: string) => {
    try {
      setLoadingId(orderId);
      await approveBankSlipAction(orderId, "APPROVE");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success("Bank slip verified! Vacancy has been promoted to Featured for 30 days.");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve bank slip");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingOrder) return;
    try {
      setLoadingId(rejectingOrder.id);
      await approveBankSlipAction(rejectingOrder.id, "REJECT", rejectReason);
      setOrders((prev) => prev.filter((o) => o.id !== rejectingOrder.id));
      setRejectingOrder(null);
      setRejectReason("");
      toast.success("Promotion bank slip rejected with explanation note.");
    } catch (err: any) {
      toast.error(err.message || "Failed to reject order");
    } finally {
      setLoadingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
        <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          No Pending Bank Slips
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          All employer bank transfer receipts and promotion requests have been verified.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Vacancy &amp; Employer</th>
                <th className="px-6 py-4">Package &amp; Fee</th>
                <th className="px-6 py-4">Bank Slip &amp; Reference</th>
                <th className="px-6 py-4">Submission Date</th>
                <th className="px-6 py-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {orders.map((order) => {
                const isLoading = loadingId === order.id;

                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {order.job?.title || "Promotion Order"}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.job?.employer?.companyName || order.user.name || order.user.email}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>LKR {order.amountLkr.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{order.package.name}</p>
                    </td>

                    <td className="px-6 py-4">
                      {order.slipFileId ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingSlipUrl(`/api/files/${order.slipFileId}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Slip</span>
                          </button>
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                            Ref: {order.bankReference || "N/A"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No slip attached</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleApprove(order.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Approve &amp; Feature
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoading}
                          onClick={() => setRejectingOrder(order)}
                          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs h-8 px-3"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Preview Modal */}
      {viewingSlipUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Bank Deposit Slip / Transaction Screenshot
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={viewingSlipUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  title="Open full resolution in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setViewingSlipUrl(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950/50">
              <img
                src={viewingSlipUrl}
                alt="Bank Transfer Slip"
                className="max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Slip Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reject Bank Slip
            </h3>
            <p className="text-xs text-slate-500">
              Provide feedback to the employer regarding why this transfer slip cannot be validated (e.g. unreadable image, incorrect amount, or duplicate reference).
            </p>

            <Textarea
              rows={3}
              placeholder="e.g. The uploaded receipt image is blurred. Please re-upload a clear slip with the reference visible..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="text-xs"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectingOrder(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReject}
                disabled={loadingId !== null}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
