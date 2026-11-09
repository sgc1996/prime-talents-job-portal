import Link from "next/link";
import { siteConfig } from "@/lib/config/site";

export function AuthHeader() {
  return (
    <header className="w-full border-b bg-background/95 py-4 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tight text-primary">
            {siteConfig.name}
          </span>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
            Sri Lanka
          </span>
        </Link>
        <div className="text-sm text-muted-foreground">
          {siteConfig.tagline}
        </div>
      </div>
    </header>
  );
}

