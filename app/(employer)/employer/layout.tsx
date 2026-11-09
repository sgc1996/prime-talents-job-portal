import { requireRoleUser } from "@/lib/auth/session";
import { PlaceholderNav } from "@/components/layout/placeholder-nav";
import Link from "next/link";
import { LayoutDashboard, Building2, Briefcase, PlusCircle } from "lucide-react";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  const navItems = [
    { label: "Dashboard", href: "/employer", icon: LayoutDashboard },
    { label: "Manage Vacancies", href: "/employer/jobs", icon: Briefcase },
    { label: "Post a Job", href: "/employer/jobs/new", icon: PlusCircle },
    { label: "Company Profile", href: "/employer/profile", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <PlaceholderNav name={user.name} role={user.role} />

      {/* Recruiter Sub-navigation Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 flex items-center justify-between overflow-x-auto py-2">
          <div className="flex space-x-1 shrink-0">
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

          <Link href="/employer/jobs/new" className="hidden sm:block">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Post New Role</span>
            </button>
          </Link>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
    </div>
  );
}
