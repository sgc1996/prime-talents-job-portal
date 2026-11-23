import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { Briefcase, User, LogIn, LayoutDashboard } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SystemSettingsRepository } from "@/server/repositories/system-settings.repository";

export async function PublicHeader() {
  const user = await getCurrentUser();
  const allowEmployerReg = await SystemSettingsRepository.isPublicEmployerRegistrationEnabled();

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "CANDIDATE") return "/candidate";
    if (user.role === "EMPLOYER") return "/employer";
    return "/admin";
  };

  const showPostJob =
    user?.role === "EMPLOYER" ||
    user?.role === "SUPER_ADMIN" ||
    user?.role === "MODERATOR" ||
    (!user && allowEmployerReg);

  const getPostJobLink = () => {
    if (user?.role === "EMPLOYER") return "/employer/jobs/new";
    if (user?.role === "SUPER_ADMIN" || user?.role === "MODERATOR") return "/admin/jobs/new";
    return "/register";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <Image
              src="/images/logo.png"
              alt={siteConfig.name}
              width={34}
              height={34}
              className="h-8 w-8 shrink-0 object-contain rounded transition-transform group-hover:scale-105"
              priority
            />
            <div className="flex items-center space-x-1.5">
              <span className="text-2xl font-black tracking-tight text-primary">
                {siteConfig.name}
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                LK
              </span>
            </div>
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

          {/* Post a Job button */}
          {showPostJob && (
            <Link href={getPostJobLink()}>
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

