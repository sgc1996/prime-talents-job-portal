import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-background/95 py-4 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">{siteConfig.name}</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Phase 1
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                href={
                  user.role === "CANDIDATE"
                    ? "/candidate"
                    : user.role === "EMPLOYER"
                      ? "/employer"
                      : "/admin"
                }
              >
                <Button>Go to Dashboard ({user.role})</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-2xl space-y-6">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            Sri Lanka&apos;s Career Platform
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Welcome to <span className="text-primary">{siteConfig.name}</span>
          </h1>
          <p className="text-lg text-muted-foreground">{siteConfig.description}</p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="px-8 font-semibold">
                Register as Job Seeker or Employer
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 font-semibold">
                Sign In to Your Account
              </Button>
            </Link>
          </div>

          <div className="mt-12 rounded-lg border bg-card p-6 text-left shadow-sm">
            <h3 className="font-semibold text-foreground">Phase 1 Foundation Status:</h3>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
              <li>PostgreSQL 16 + Complete Prisma Relational Schema</li>
              <li>Authentication (Credentials, Argon2/Bcrypt, 6-digit email OTP + Magic Link)</li>
              <li>Brute-force protection &amp; incremental account lockout</li>
              <li>RBAC route guards: <code>/candidate</code>, <code>/employer</code>, <code>/admin</code></li>
              <li>Idempotent seed data for all 9 provinces, 25 districts, and 35 clean sectors</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </footer>
    </div>
  );
}
