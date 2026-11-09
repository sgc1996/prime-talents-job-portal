import { Role, Permission } from "./permissions";
import { can, UserContext } from "./index";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden: Insufficient permissions") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function assertRole(user: UserContext | null | undefined, allowedRoles: Role[]): UserContext {
  if (!user) {
    throw new UnauthorizedError("You must be logged in to perform this action");
  }

  if (user.status === "SUSPENDED") {
    throw new ForbiddenError("Your account has been suspended");
  }

  if (user.status === "PENDING_VERIFICATION") {
    throw new ForbiddenError("Please verify your email address to continue");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Access denied for role: ${user.role}`);
  }

  return user;
}

export function assertPermission(
  user: UserContext | null | undefined,
  permission: Permission,
  resourceOwnerId?: string,
): UserContext {
  if (!user) {
    throw new UnauthorizedError("Authentication required");
  }

  if (!can(user, permission, resourceOwnerId)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }

  return user;
}

