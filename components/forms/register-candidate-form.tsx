"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerCandidateAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

export function RegisterCandidateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await registerCandidateAction({
      name,
      email,
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

      <div className="space-y-1.5">
        <Label htmlFor="candidate-name">Full Name</Label>
        <Input
          id="candidate-name"
          placeholder="e.g. Kasun Perera"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="candidate-email">Email Address</Label>
        <Input
          id="candidate-email"
          type="email"
          placeholder="kasun@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="candidate-phone">Mobile Number (Optional)</Label>
        <Input
          id="candidate-phone"
          placeholder="0771234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="candidate-password">Password</Label>
        <Input
          id="candidate-password"
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
            Creating Candidate Account...
          </>
        ) : (
          "Register as Job Seeker"
        )}
      </Button>
    </form>
  );
}
