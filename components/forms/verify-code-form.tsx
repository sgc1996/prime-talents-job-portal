"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  verifyCodeAction,
  resendVerificationCodeAction,
} from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2, RotateCw } from "lucide-react";

interface VerifyCodeFormProps {
  userId: string;
  email: string;
}

export function VerifyCodeForm({ userId, email }: VerifyCodeFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsLoading(true);

    const result = await verifyCodeAction({
      userId,
      code: code.trim(),
    });

    if (!result.success) {
      setError(result.error || "Verification failed");
      setIsLoading(false);
      return;
    }

    setInfo("Email verified successfully! Redirecting to login...");
    setTimeout(() => {
      router.push("/login?verified=true");
    }, 1200);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setInfo(null);
    setIsLoading(true);

    const result = await resendVerificationCodeAction(userId);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Failed to resend code");
      return;
    }

    setCooldown(60);
    setInfo("A new 6-digit verification code has been dispatched to your email.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {info && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{info}</span>
        </div>
      )}

      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        We sent a 6-digit code and a magic link to <strong className="text-foreground">{email}</strong>.
      </div>

      <div className="space-y-1.5 text-center">
        <Label htmlFor="verification-code">6-Digit Verification Code</Label>
        <Input
          id="verification-code"
          type="text"
          maxLength={6}
          placeholder="123456"
          required
          autoFocus
          className="mx-auto max-w-[200px] text-center text-2xl font-bold tracking-widest"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Code is valid for 15 minutes. Maximum 5 attempts allowed.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying Code...
          </>
        ) : (
          "Confirm & Activate Account"
        )}
      </Button>

      <div className="pt-2 text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={cooldown > 0 || isLoading}
          onClick={handleResend}
          className="text-xs text-muted-foreground"
        >
          <RotateCw className="mr-1.5 h-3.5 w-3.5" />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Verification Code"}
        </Button>
      </div>
    </form>
  );
}
