import fs from "fs";
import path from "path";
import crypto from "crypto";
import { StorageAdapter, StoredFileResult } from "./storage-adapter.interface";
import { logger } from "@/lib/logger";

export class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folder = "files",
  ): Promise<StoredFileResult> {
    const targetDir = path.join(this.baseDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = path.extname(fileName) || "";
    const uniqueKey = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(targetDir, uniqueKey);

    await fs.promises.writeFile(filePath, fileBuffer);

    const relativeKey = `${folder}/${uniqueKey}`;
    const publicUrl = `/uploads/${relativeKey}`;

    logger.info("File uploaded locally", {
      fileName,
      mimeType,
      sizeBytes: fileBuffer.length,
      key: relativeKey,
    });

    return {
      id: crypto.randomUUID(),
      url: publicUrl,
      key: relativeKey,
      mimeType,
      sizeBytes: fileBuffer.length,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.baseDir, key);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to delete local file", { key }, error);
      return false;
    }
  }

  async getDownloadUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }
}

