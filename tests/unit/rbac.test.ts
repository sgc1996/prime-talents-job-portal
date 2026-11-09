import { describe, it, expect } from "vitest";
import { can, UserContext } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/rbac/permissions";

describe("RBAC Permissions & Evaluation Matrix", () => {
  const superAdmin: UserContext = {
    id: "admin-1",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  };

  const moderator: UserContext = {
    id: "mod-1",
    role: "MODERATOR",
    status: "ACTIVE",
  };

  const employer: UserContext = {
    id: "emp-1",
    role: "EMPLOYER",
    status: "ACTIVE",
  };

  const candidate: UserContext = {
    id: "cand-1",
    role: "CANDIDATE",
    status: "ACTIVE",
  };

  const suspendedAdmin: UserContext = {
    id: "admin-2",
    role: "SUPER_ADMIN",
    status: "SUSPENDED",
  };

  const pendingCandidate: UserContext = {
    id: "cand-2",
    role: "CANDIDATE",
    status: "PENDING_VERIFICATION",
  };

  describe("SUPER_ADMIN privileges", () => {
    it("can perform all administrative and management actions", () => {
      expect(can(superAdmin, PERMISSIONS.USER_CREATE)).toBe(true);
      expect(can(superAdmin, PERMISSIONS.USER_DELETE)).toBe(true);
      expect(can(superAdmin, PERMISSIONS.USER_CHANGE_ROLE)).toBe(true);
      expect(can(superAdmin, PERMISSIONS.USER_SUSPEND)).toBe(true);
      expect(can(superAdmin, PERMISSIONS.SETTINGS_MANAGE)).toBe(true);
      expect(can(superAdmin, PERMISSIONS.MODERATION_JOBS)).toBe(true);
      expect(can(superAdmin, PERMISSIONS.MODERATION_REVIEWS)).toBe(true);
      expect(can(superAdmin, PERMISSIONS.JOB_CREATE)).toBe(true);
    });
  });

  describe("MODERATOR restrictions (Moderators cannot manage users or settings)", () => {
    it("can moderate content", () => {
      expect(can(moderator, PERMISSIONS.MODERATION_JOBS)).toBe(true);
      expect(can(moderator, PERMISSIONS.MODERATION_REVIEWS)).toBe(true);
      expect(can(moderator, PERMISSIONS.MODERATION_REPORTS)).toBe(true);
      expect(can(moderator, PERMISSIONS.USER_READ)).toBe(true);
    });

    it("is strictly FORBIDDEN from user creation, role changes, suspensions, and system settings", () => {
      expect(can(moderator, PERMISSIONS.USER_CREATE)).toBe(false);
      expect(can(moderator, PERMISSIONS.USER_DELETE)).toBe(false);
      expect(can(moderator, PERMISSIONS.USER_CHANGE_ROLE)).toBe(false);
      expect(can(moderator, PERMISSIONS.USER_SUSPEND)).toBe(false);
      expect(can(moderator, PERMISSIONS.SETTINGS_MANAGE)).toBe(false);
    });
  });

  describe("EMPLOYER privileges & restrictions", () => {
    it("can create and manage employer resources", () => {
      expect(can(employer, PERMISSIONS.JOB_CREATE)).toBe(true);
      expect(can(employer, PERMISSIONS.EMPLOYER_PROFILE_MANAGE)).toBe(true);
      expect(can(employer, PERMISSIONS.APPLICATION_REVIEW)).toBe(true);
    });

    it("cannot moderate, manage system users, or submit candidate applications", () => {
      expect(can(employer, PERMISSIONS.MODERATION_JOBS)).toBe(false);
      expect(can(employer, PERMISSIONS.USER_CREATE)).toBe(false);
      expect(can(employer, PERMISSIONS.APPLICATION_SUBMIT)).toBe(false);
    });

    it("enforces resource ownership for editing jobs", () => {
      // Editing own job
      expect(can(employer, PERMISSIONS.JOB_UPDATE_OWN, "emp-1")).toBe(true);
      // Editing someone else's job
      expect(can(employer, PERMISSIONS.JOB_UPDATE_OWN, "emp-999")).toBe(false);
    });
  });

  describe("CANDIDATE privileges & restrictions", () => {
    it("can manage candidate profile and submit applications", () => {
      expect(can(candidate, PERMISSIONS.CANDIDATE_PROFILE_MANAGE)).toBe(true);
      expect(can(candidate, PERMISSIONS.APPLICATION_SUBMIT)).toBe(true);
      expect(can(candidate, PERMISSIONS.JOB_SAVE)).toBe(true);
      expect(can(candidate, PERMISSIONS.JOB_ALERT_MANAGE)).toBe(true);
    });

    it("cannot create jobs or access moderation", () => {
      expect(can(candidate, PERMISSIONS.JOB_CREATE)).toBe(false);
      expect(can(candidate, PERMISSIONS.MODERATION_JOBS)).toBe(false);
      expect(can(candidate, PERMISSIONS.USER_READ)).toBe(false);
    });
  });

  describe("Non-active user status guards", () => {
    it("denies all permissions for suspended users even if SUPER_ADMIN", () => {
      expect(can(suspendedAdmin, PERMISSIONS.USER_CREATE)).toBe(false);
      expect(can(suspendedAdmin, PERMISSIONS.SETTINGS_MANAGE)).toBe(false);
    });

    it("denies all permissions for users pending verification", () => {
      expect(can(pendingCandidate, PERMISSIONS.APPLICATION_SUBMIT)).toBe(false);
    });

    it("denies all permissions for null or undefined user", () => {
      expect(can(null, PERMISSIONS.USER_READ)).toBe(false);
      expect(can(undefined, PERMISSIONS.JOB_CREATE)).toBe(false);
    });
  });
});

