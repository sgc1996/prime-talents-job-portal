import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { EmployerProfileForm } from "@/components/employer/employer-profile-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Profile & Branding",
  description: "Manage your employer organization profile and branding.",
};

export const dynamic = "force-dynamic";

export default async function EmployerProfilePage() {
  const user = await requireRoleUser(["EMPLOYER", "SUPER_ADMIN"]);

  const [employer, sectors, districts] = await Promise.all([
    prisma.employerProfile.findUnique({
      where: { userId: user.id },
    }),
    prisma.sector.findMany({
      select: { id: true, name: true },
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.district.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Company Profile &amp; Branding
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your company description, location, and details displayed across your job postings.
        </p>
      </div>

      <EmployerProfileForm
        initialData={employer}
        sectors={sectors}
        districts={districts}
      />
    </div>
  );
}
