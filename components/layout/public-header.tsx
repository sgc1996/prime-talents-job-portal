import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { Briefcase, User, LogIn, LayoutDashboard } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export async function PublicHeader() {
  const user = await getCurrentUser();

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "CANDIDATE") return "/candidate";
    if (user.role === "EMPLOYER") return "/employer";
    return "/admin";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black tracking-tight text-primary">
              {siteConfig.name}
            </span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
              LK
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/jobs"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Find Jobs
            </Link>
            <Link
              href="/jobs?type=REMOTE"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Remote Jobs
            </Link>
          </nav>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />

          {user ? (
            <div className="flex items-center space-x-3">
              <Link href={getDashboardLink()}>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="text-xs text-muted-foreground font-normal">({user.role})</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="flex items-center gap-1.5 font-semibold">
                  <User className="h-4 w-4" />
                  <span>Register</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Post a Job button (shown only to EMPLOYER or guest visitors, NOT candidates) */}
          {user?.role !== "CANDIDATE" && (
            <Link href={user?.role === "EMPLOYER" ? "/employer/jobs/new" : "/register"}>
              <Button size="sm" variant="default" className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                <Briefcase className="h-4 w-4" />
                <span>Post a Job</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

