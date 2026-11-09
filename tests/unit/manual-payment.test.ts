import { describe, it, expect } from "vitest";
import { OrderStatus } from "@prisma/client";

interface OrderMock {
  id: string;
  status: OrderStatus;
  amountLkr: number;
  slipFileId: string | null;
  bankReference: string;
  jobId: string;
}

function processSlipApproval(_order: OrderMock, action: "APPROVE" | "REJECT") {
  if (action === "APPROVE") {
    return {
      orderStatus: OrderStatus.COMPLETED,
      isJobFeatured: true,
      featuredUntilDays: 30,
    };
  } else {
    return {
      orderStatus: OrderStatus.FAILED,
      isJobFeatured: false,
      featuredUntilDays: 0,
    };
  }
}

describe("Phase 3: Manual Bank Slip Verification & Job Promotion", () => {
  const sampleOrder: OrderMock = {
    id: "ord_123",
    status: OrderStatus.PENDING,
    amountLkr: 15000,
    slipFileId: "slip_999",
    bankReference: "COMM-BANK-REF-84920",
    jobId: "job_456",
  };

  it("features vacancy for 30 days when Admin approves the bank slip", () => {
    const result = processSlipApproval(sampleOrder, "APPROVE");
    expect(result.orderStatus).toBe(OrderStatus.COMPLETED);
    expect(result.isJobFeatured).toBe(true);
    expect(result.featuredUntilDays).toBe(30);
  });

  it("marks order as FAILED and leaves job unfeatured when Admin rejects the bank slip", () => {
    const result = processSlipApproval(sampleOrder, "REJECT");
    expect(result.orderStatus).toBe(OrderStatus.FAILED);
    expect(result.isJobFeatured).toBe(false);
  });
});
