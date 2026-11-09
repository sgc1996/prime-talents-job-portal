import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your WorkLanka account",
};

export default function LoginPage() {
  return (
    <Card className="shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your WorkLanka account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="p-4 text-center text-sm text-muted-foreground">Loading sign in form...</div>}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
