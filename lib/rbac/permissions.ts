export type Role = "SUPER_ADMIN" | "MODERATOR" | "EMPLOYER" | "CANDIDATE";

export const PERMISSIONS = {
  // User Management
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_CHANGE_ROLE: "user:change_role",
  USER_SUSPEND: "user:suspend",

  // Settings & System
  SETTINGS_MANAGE: "settings:manage",
  AUDIT_LOG_READ: "audit_log:read",

  // Content Moderation
  MODERATION_JOBS: "moderation:jobs",
  MODERATION_REVIEWS: "moderation:reviews",
  MODERATION_REPORTS: "moderation:reports",

  // Candidate Actions
  CANDIDATE_PROFILE_MANAGE: "candidate:profile_manage",
  APPLICATION_SUBMIT: "application:submit",
  JOB_SAVE: "job:save",
  JOB_ALERT_MANAGE: "job_alert:manage",

  // Employer Actions
  EMPLOYER_PROFILE_MANAGE: "employer:profile_manage",
  JOB_CREATE: "job:create",
  JOB_UPDATE_OWN: "job:update_own",
  JOB_DELETE_OWN: "job:delete_own",
  APPLICATION_REVIEW: "application:review",
  EMPLOYER_MEMBER_MANAGE: "employer:member_manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

