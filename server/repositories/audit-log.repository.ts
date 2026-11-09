import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export interface CreateAuditLogParams {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

export class AuditLogRepository {
  static async create(params: CreateAuditLogParams) {
    try {
      const entry = await prisma.auditLog.create({
        data: {
          actorId: params.actorId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId || null,
          before: (params.before as Prisma.InputJsonValue) ?? Prisma.JsonNull,
          after: (params.after as Prisma.InputJsonValue) ?? Prisma.JsonNull,
          ip: params.ip || null,
          userAgent: params.userAgent || null,
        },
      });

      logger.info(`Audit log recorded: ${params.action}`, {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
      });

      return entry;
    } catch (error) {
      logger.error("Failed to write audit log entry", { action: params.action }, error);
      // Audit log failures should not crash user-facing actions, but must be logged
      return null;
    }
  }
}

