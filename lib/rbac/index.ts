import { Role, PERMISSIONS, Permission } from "./permissions";

export interface UserContext {
  id: string;
  role: Role;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  emailVerifiedAt?: Date | null;
}

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_CHANGE_ROLE,
    PERMISSIONS.USER_SUSPEND,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.AUDIT_LOG_READ,
    PERMISSIONS.MODERATION_JOBS,
    PERMISSIONS.MODERATION_REVIEWS,
    PERMISSIONS.MODERATION_REPORTS,
    PERMISSIONS.CANDIDATE_PROFILE_MANAGE,
    PERMISSIONS.EMPLOYER_PROFILE_MANAGE,
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_UPDATE_OWN,
    PERMISSIONS.JOB_DELETE_OWN,
    PERMISSIONS.APPLICATION_REVIEW,
    PERMISSIONS.EMPLOYER_MEMBER_MANAGE,
    PERMISSIONS.APPLICATION_SUBMIT,
    PERMISSIONS.JOB_SAVE,
    PERMISSIONS.JOB_ALERT_MANAGE,
  ],
  MODERATOR: [
    // Moderators can review and moderate jobs, reviews, reports, and read users,
    // but CANNOT create/delete users, change roles, suspend users, or manage system settings.
    PERMISSIONS.USER_READ,
    PERMISSIONS.MODERATION_JOBS,
    PERMISSIONS.MODERATION_REVIEWS,
    PERMISSIONS.MODERATION_REPORTS,
    PERMISSIONS.AUDIT_LOG_READ,
  ],
  EMPLOYER: [
    PERMISSIONS.EMPLOYER_PROFILE_MANAGE,
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_UPDATE_OWN,
    PERMISSIONS.JOB_DELETE_OWN,
    PERMISSIONS.APPLICATION_REVIEW,
    PERMISSIONS.EMPLOYER_MEMBER_MANAGE,
  ],
  CANDIDATE: [
    PERMISSIONS.CANDIDATE_PROFILE_MANAGE,
    PERMISSIONS.APPLICATION_SUBMIT,
    PERMISSIONS.JOB_SAVE,
    PERMISSIONS.JOB_ALERT_MANAGE,
  ],
};

export function can(
  user: UserContext | null | undefined,
  permission: Permission,
  resourceOwnerId?: string,
): boolean {
  if (!user) return false;
  if (user.status !== "ACTIVE") return false;

  const permissions = ROLE_PERMISSIONS[user.role];
  if (!permissions || !permissions.includes(permission)) {
    return false;
  }

  // If a resource owner check applies (e.g. updating own job or profile)
  if (resourceOwnerId && user.role !== "SUPER_ADMIN") {
    return user.id === resourceOwnerId;
  }

  return true;
}

export * from "./permissions";

