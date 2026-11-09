"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerEmployerAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

export function RegisterEmployerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompanyNameChange = (val: string) => {
    setCompanyName(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setCompanySlug(slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await registerEmployerAction({
      name,
      email,
      companyName,
      companySlug,
      password,
      phone,
    });

    if (!result.success) {
      setError(result.error || "Registration failed");
      setIsLoading(false);
      return;
    }

    router.push(
      `/verify-email?userId=${result.userId}&email=${encodeURIComponent(result.email || email)}`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            placeholder="e.g. Lanka Tech Innovations"
            required
            value={companyName}
            onChange={(e) => handleCompanyNameChange(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company-slug">Company Slug</Label>
          <Input
            id="company-slug"
            placeholder="lanka-tech-innovations"
            required
            value={companySlug}
            onChange={(e) => setCompanySlug(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="rep-name">Representative Name</Label>
          <Input
            id="rep-name"
            placeholder="e.g. Ruwan Silva"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="employer-phone">Contact Phone</Label>
          <Input
            id="employer-phone"
            placeholder="0112345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="employer-email">Work Email Address</Label>
        <Input
          id="employer-email"
          type="email"
          placeholder="hr@company.lk"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="employer-password">Password</Label>
        <Input
          id="employer-password"
          type="password"
          placeholder="Min 10 characters with mixed cases & symbols"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 10 characters and include uppercase, lowercase, numbers, and special characters.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Employer Account...
          </>
        ) : (
          "Register as Employer"
        )}
      </Button>
    </form>
  );
}

