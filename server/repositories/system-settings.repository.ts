import { prisma } from "@/lib/db/prisma";

// In-memory cache with short TTL (60 seconds) so public page loads remain blazing fast
const cache: Record<string, { value: string; expiry: number }> = {};
const CACHE_TTL_MS = 60 * 1000;

export class SystemSettingsRepository {
  static async getSetting(key: string, defaultValue: string = ""): Promise<string> {
    const cached = cache[key];
    if (cached && Date.now() < cached.expiry) {
      return cached.value;
    }

    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key },
      });

      const value = setting ? setting.value : defaultValue;
      cache[key] = { value, expiry: Date.now() + CACHE_TTL_MS };
      return value;
    } catch (error) {
      console.error(`Error reading setting [${key}]:`, error);
      return defaultValue;
    }
  }

  static async isPublicEmployerRegistrationEnabled(): Promise<boolean> {
    const val = await this.getSetting("public_employer_registration", "false");
    return val === "true";
  }

  static async setSetting(key: string, value: string, description?: string): Promise<void> {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });

    // Invalidate cache immediately
    delete cache[key];
  }

  static async getAllSettings() {
    return prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });
  }

  static clearCache() {
    Object.keys(cache).forEach((k) => delete cache[k]);
  }
}
