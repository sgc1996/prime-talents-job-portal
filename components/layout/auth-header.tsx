import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config/site";

export function AuthHeader() {
  return (
    <header className="w-full border-b bg-background/95 py-4 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <Image
            src="/images/logo.png"
            alt={siteConfig.name}
            width={34}
            height={34}
            className="h-8 w-8 shrink-0 object-contain rounded"
            priority
          />
          <div className="flex items-center space-x-1.5">
            <span className="text-2xl font-bold tracking-tight text-primary">
              {siteConfig.name}
            </span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
              Sri Lanka
            </span>
          </div>
        </Link>
        <div className="text-sm text-muted-foreground hidden sm:block">
          {siteConfig.tagline}
        </div>
      </div>
    </header>
  );
}

