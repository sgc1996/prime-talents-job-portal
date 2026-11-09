import { requireRoleUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { CandidateProfileForm } from "@/components/candidate/candidate-profile-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Profile & Resume",
  description: "Update your career profile and manage your resume.",
};

export const dynamic = "force-dynamic";

export default async function CandidateProfilePage() {
  const user = await requireRoleUser(["CANDIDATE", "SUPER_ADMIN"]);

  const [profile, districts, latestCv] = await Promise.all([
    prisma.candidateProfile.findUnique({
      where: { userId: user.id },
    }),
    prisma.district.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.storedFile.findFirst({
      where: {
        ownerId: user.id,
        kind: "CV",
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Profile &amp; Career Resume
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your credentials, attach your resume, and set your availability for Sri Lankan employers.
        </p>
      </div>

      <CandidateProfileForm
        initialData={profile}
        districts={districts}
        latestCv={latestCv}
      />
    </div>
  );
}
