import { VerificationService } from "@/server/services/verification.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

interface VerifyTokenPageProps {
  searchParams: {
    token?: string;
  };
}

export default async function VerifyTokenPage({ searchParams }: VerifyTokenPageProps) {
  const token = searchParams.token;
  let isSuccess = false;
  let errorMessage = "Invalid verification token";

  if (token) {
    const result = await VerificationService.verifyMagicToken(token);
    isSuccess = result.success;
    if (!isSuccess && result.message) {
      errorMessage = result.message;
    }
  }

  return (
    <Card className="shadow-md text-center">
      <CardHeader>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          {isSuccess ? (
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          ) : (
            <div className="rounded-full bg-destructive/10 p-3 text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-bold">
          {isSuccess ? "Email Verified Successfully" : "Verification Failed"}
        </CardTitle>
        <CardDescription>
          {isSuccess
            ? "Your email address has been confirmed and your account is active."
            : errorMessage}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/login">
          <Button className="w-full">
            {isSuccess ? "Proceed to Sign In" : "Return to Login"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

