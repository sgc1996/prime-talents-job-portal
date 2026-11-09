import { requireRoleUser } from "@/lib/auth/session";
import { PlaceholderNav } from "@/components/layout/placeholder-nav";
import Link from "next/link";
import { LayoutDashboard, UserCircle, Briefcase, Bookmark } from "lucide-react";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRoleUser(["CANDIDATE", "SUPER_ADMIN"]);

  const navItems = [
    { label: "Dashboard", href: "/candidate", icon: LayoutDashboard },
    { label: "Profile & Resume", href: "/candidate/profile", icon: UserCircle },
    { label: "My Applications", href: "/candidate/applications", icon: Briefcase },
    { label: "Saved Jobs", href: "/candidate/saved", icon: Bookmark },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <PlaceholderNav name={user.name} role={user.role} />

      {/* Candidate Sub-navigation Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 flex space-x-1 overflow-x-auto py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
    </div>
  );
}
