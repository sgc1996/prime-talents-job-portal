"use client";

import { useState } from "react";
import { RegisterCandidateForm } from "@/components/forms/register-candidate-form";
import { RegisterEmployerForm } from "@/components/forms/register-employer-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Briefcase, User } from "lucide-react";

export default function RegisterPage() {
  const [roleTab, setRoleTab] = useState<"CANDIDATE" | "EMPLOYER">("CANDIDATE");

  return (
    <Card className="shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Choose your account type to register on WorkLanka
        </CardDescription>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setRoleTab("CANDIDATE")}
            className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
              roleTab === "CANDIDATE"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Job Seeker</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleTab("EMPLOYER")}
            className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
              roleTab === "EMPLOYER"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Employer</span>
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {roleTab === "CANDIDATE" ? (
          <RegisterCandidateForm />
        ) : (
          <RegisterEmployerForm />
        )}

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

