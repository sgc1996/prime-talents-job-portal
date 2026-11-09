"use server";

import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentStatus } from "@prisma/client";

// ==========================================
// 1. EMPLOYER SUBMIT BANK SLIP FOR PROMOTION
// ==========================================

interface SubmitBankSlipInput {
  jobId: string;
  slipFileId: string;
  bankReference: string;
  notes?: string;
}

export async function submitBankSlipAction(data: SubmitBankSlipInput) {
  const user = await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  const job = await prisma.job.findUnique({
    where: { id: data.jobId },
    include: { employer: true },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.employer.userId !== user.id && user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized to promote this job vacancy");
  }

  // Find or create featured 30-day package
  let pkg = await prisma.package.findUnique({
    where: { slug: "featured-30-days" },
  });

  if (!pkg) {
    pkg = await prisma.package.create({
      data: {
        name: "Featured Vacancy (30 Days)",
        slug: "featured-30-days",
        priceLkr: 15000,
        durationDays: 30,
        jobPostLimit: 1,
        featuredJobLimit: 1,
      },
    });
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      packageId: pkg.id,
      jobId: job.id,
      amountLkr: pkg.priceLkr,
      status: OrderStatus.PENDING,
      slipFileId: data.slipFileId,
      bankReference: data.bankReference.trim(),
      adminNote: data.notes?.trim() || null,
    },
  });

  revalidatePath(`/employer/jobs/${job.id}/promote`);
  revalidatePath(`/employer/jobs`);
  revalidatePath(`/admin/payments`);

  return { success: true, orderId: order.id };
}

// ==========================================
// 2. ADMIN APPROVE OR REJECT BANK SLIP
// ==========================================

export async function approveBankSlipAction(
  orderId: string,
  action: "APPROVE" | "REJECT",
  adminNote?: string,
) {
  const admin = await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      job: true,
      user: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (action === "APPROVE") {
    // 30 days featured period
    const featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.COMPLETED,
          approvedAt: new Date(),
          adminNote: adminNote?.trim() || order.adminNote,
        },
      }),
      ...(order.jobId
        ? [
            prisma.job.update({
              where: { id: order.jobId },
              data: {
                isFeatured: true,
                featuredUntil,
              },
            }),
          ]
        : []),
      prisma.payment.create({
        data: {
          orderId: order.id,
          provider: "BANK_TRANSFER",
          reference: order.bankReference || order.id,
          amountLkr: order.amountLkr,
          status: PaymentStatus.SUCCESS,
        },
      }),
      prisma.notification.create({
        data: {
          userId: order.userId,
          title: "🌟 Vacancy Promoted to Featured!",
          message: `Your payment slip was approved. The job "${order.job?.title || "your listing"}" is now Featured for the next 30 days.`,
          link: `/employer/jobs`,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: admin.id,
          action: "BANK_SLIP_APPROVED",
          entityType: "Order",
          entityId: order.id,
          after: {
            orderId: order.id,
            jobId: order.jobId,
            amountLkr: order.amountLkr,
          },
        },
      }),
    ]);
  } else {
    // REJECT
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.FAILED,
          adminNote: adminNote?.trim() || "Bank slip verification failed or invalid reference.",
        },
      }),
      prisma.notification.create({
        data: {
          userId: order.userId,
          title: "⚠️ Bank Slip Verification Issue",
          message: `Your promotion request for "${order.job?.title || "your job"}" was rejected. Note: ${adminNote || "Please re-upload a clear slip or contact support."}`,
          link: order.jobId ? `/employer/jobs/${order.jobId}/promote` : `/employer/jobs`,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: admin.id,
          action: "BANK_SLIP_REJECTED",
          entityType: "Order",
          entityId: order.id,
          after: {
            reason: adminNote || "Rejected",
          },
        },
      }),
    ]);
  }

  revalidatePath(`/admin/payments`);
  revalidatePath(`/jobs`);
  if (order.jobId) {
    revalidatePath(`/employer/jobs/${order.jobId}/promote`);
  }
  revalidatePath(`/employer/jobs`);

  return { success: true };
}
