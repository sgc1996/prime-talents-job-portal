import { requireRoleUser } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforces server-side check that current user is either SUPER_ADMIN or MODERATOR
  await requireRoleUser(["SUPER_ADMIN", "MODERATOR"]);

  return <>{children}</>;
}

