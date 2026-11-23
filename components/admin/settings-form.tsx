"use client";

import { useState, useTransition } from "react";
import { toggleEmployerRegistrationAction } from "@/server/actions/settings.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Building2, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";

interface SettingsFormProps {
  initialEmployerRegistration: boolean;
}

export function SettingsForm({ initialEmployerRegistration }: SettingsFormProps) {
  const [isEnabled, setIsEnabled] = useState(initialEmployerRegistration);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextState = !isEnabled;
    startTransition(async () => {
      try {
        const result = await toggleEmployerRegistrationAction(nextState);
        if (result.success) {
          setIsEnabled(result.enabled);
          toast.success(result.message);
        }
      } catch (err) {
        toast.error("Failed to update setting. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Building2 className="w-5 h-5" />
            <span>Marketplace & Employer Governance</span>
          </div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Public Employer Self-Registration
          </CardTitle>
          <CardDescription>
            Control whether third-party companies can create accounts and post vacancies directly on Prime Hire, or if vacancies are posted exclusively in-house through your recruitment team.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  Allow Public Employer Registrations
                </span>
                {isEnabled ? (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Open Marketplace Mode
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    In-House Agency Mode (Active)
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                {isEnabled
                  ? "Third-party employers can self-register at /register, access the Employer ATS portal, and submit job vacancies for moderation."
                  : "Employer registration is hidden from /register and blocked. All vacancies are published exclusively under Prime Hire from the Admin Panel (/admin/jobs/new)."}
              </p>
            </div>

            <Button
              type="button"
              variant={isEnabled ? "destructive" : "default"}
              size="sm"
              disabled={isPending}
              onClick={handleToggle}
              className="shrink-0 font-medium min-w-[130px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : isEnabled ? (
                "Disable Employer Signups"
              ) : (
                "Enable Employer Signups"
              )}
            </Button>
          </div>

          <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-4 text-xs space-y-2 text-amber-900 dark:text-amber-200">
            <p className="font-semibold">💡 What happens when this is disabled?</p>
            <ul className="list-disc pl-4 space-y-1 text-amber-800 dark:text-amber-300">
              <li>The <strong>Employer</strong> tab is automatically hidden from the public registration page.</li>
              <li>Visitors only see the <strong>Job Seeker</strong> registration form.</li>
              <li>The <strong>Post a Job</strong> button in the navigation header is hidden for public guests.</li>
              <li>Any existing employer data and the full Employer Portal code remain safe in the system and can be re-enabled at any time.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
