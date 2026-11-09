import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const fileId = params.id;
  const user = await getCurrentUser();

  const file = await prisma.storedFile.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Check authorization for CV / personal documents
  if (file.kind === "CV" || file.kind === "COVER_LETTER") {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isOwner = file.ownerId === user.id;
    const isAdmin = user.role === "SUPER_ADMIN" || user.role === "MODERATOR";

    // Or check if this employer has received an application with this CV
    let isEmployerReviewer = false;
    if (user.role === "EMPLOYER") {
      const employer = await prisma.employerProfile.findUnique({
        where: { userId: user.id },
      });
      if (employer) {
        const app = await prisma.application.findFirst({
          where: {
            cvFileId: fileId,
            job: {
              employerId: employer.id,
            },
          },
        });
        if (app) isEmployerReviewer = true;
      }
    }

    if (!isOwner && !isAdmin && !isEmployerReviewer) {
      return NextResponse.json({ error: "Forbidden: Cannot access this document" }, { status: 403 });
    }
  }

  // Stream local file
  const localPath = path.join(process.cwd(), "public", "uploads", file.key);
  if (!fs.existsSync(localPath)) {
    return NextResponse.json({ error: "Physical file missing on server" }, { status: 404 });
  }

  const fileBuffer = await fs.promises.readFile(localPath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": file.sizeBytes.toString(),
      "Content-Disposition": `inline; filename="${file.key.split("/").pop()}"`,
    },
  });
}
