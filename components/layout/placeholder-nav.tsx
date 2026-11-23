"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/server/actions/auth.actions";
import { siteConfig } from "@/lib/config/site";
import Link from "next/link";
import { LogOut } from "lucide-react";

interface PlaceholderNavProps {
  name: string;
  role: string;
}

export function PlaceholderNav({ name, role }: PlaceholderNavProps) {
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5">
            <Image
              src="/images/logo.png"
              alt={siteConfig.name}
              width={30}
              height={30}
              className="h-7 w-7 shrink-0 object-contain rounded"
            />
            <span className="text-xl font-bold text-primary">
              {siteConfig.name}
            </span>
          </Link>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {role}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-foreground">
            Hello, <strong className="text-primary">{name}</strong> ({role})
          </span>
          <form action={logoutAction}>
            <Button variant="outline" size="sm" type="submit" className="flex items-center gap-1.5">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}

