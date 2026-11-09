import { AuthHeader } from "@/components/layout/auth-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <AuthHeader />
      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

