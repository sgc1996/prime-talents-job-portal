import { auth } from "./auth";
import { assertRole, assertPermission } from "@/lib/rbac/require-role";
import { Role, Permission } from "@/lib/rbac/permissions";
import { UserContext } from "@/lib/rbac";

export interface AuthUser extends UserContext {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.role || !session?.user?.status) {
    return null;
  }
  return {
    id: session.user.id,
    email: session.user.email || "",
    name: session.user.name || "User",
    role: session.user.role as Role,
    status: session.user.status as "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION",
  };
}

export async function requireAuthUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in to continue");
  }
  return user;
}

export async function requireRoleUser(allowedRoles: Role[]): Promise<AuthUser> {
  const user = await requireAuthUser();
  assertRole(user, allowedRoles);
  return user;
}

export async function requirePermissionUser(
  permission: Permission,
  resourceOwnerId?: string,
): Promise<AuthUser> {
  const user = await requireAuthUser();
  assertPermission(user, permission, resourceOwnerId);
  return user;
}
