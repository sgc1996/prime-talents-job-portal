import { VerifyCodeForm } from "@/components/forms/verify-code-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Your Email",
  description: "Enter your verification code to activate your account",
};

interface VerifyEmailPageProps {
  searchParams: {
    userId?: string;
    email?: string;
  };
}

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const userId = searchParams.userId || "";
  const email = searchParams.email || "";

  return (
    <Card className="shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
        <CardDescription>
          Please verify your email address to activate your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userId ? (
          <VerifyCodeForm userId={userId} email={email} />
        ) : (
          <div className="text-center text-sm text-destructive">
            Missing user identification. Please register or sign in again.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
