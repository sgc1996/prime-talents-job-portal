import { prisma } from "@/lib/db/prisma";
import { getStorageAdapter } from "@/server/adapters/storage";
import { FileKind } from "@prisma/client";

export class StorageService {
  static async saveFile(
    userId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    kind: FileKind,
  ) {
    // Validate file sizes and types
    if (kind === "CV" || kind === "COVER_LETTER") {
      if (mimeType !== "application/pdf") {
        throw new Error("Resumes and cover letters must be in PDF format.");
      }
      if (fileBuffer.length > 5 * 1024 * 1024) {
        throw new Error("Resume file size must not exceed 5MB.");
      }
    } else if (kind === "LOGO" || kind === "COVER") {
      const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];
      if (!allowedImageTypes.includes(mimeType)) {
        throw new Error("Image must be PNG, JPEG, or WebP.");
      }
      if (fileBuffer.length > 2 * 1024 * 1024) {
        throw new Error("Image file size must not exceed 2MB.");
      }
    }

    const adapter = getStorageAdapter();
    const folder = kind.toLowerCase();
    const result = await adapter.uploadFile(fileBuffer, fileName, mimeType, folder);

    const storedFile = await prisma.storedFile.create({
      data: {
        ownerId: userId,
        kind,
        url: result.url,
        key: result.key,
        mimeType: result.mimeType,
        sizeBytes: result.sizeBytes,
      },
    });

    return storedFile;
  }

  static async getFile(fileId: string) {
    return prisma.storedFile.findUnique({
      where: { id: fileId },
    });
  }

  static async deleteFile(fileId: string, userId: string) {
    const file = await prisma.storedFile.findUnique({
      where: { id: fileId },
    });

    if (!file || file.ownerId !== userId) {
      throw new Error("Unauthorized to delete this file");
    }

    const adapter = getStorageAdapter();
    await adapter.deleteFile(file.key);

    return prisma.storedFile.delete({
      where: { id: fileId },
    });
  }
}
