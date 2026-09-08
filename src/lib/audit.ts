import { prisma } from "./prisma";
import type { AuditAction, EntityType } from "./constants";

interface AuditInput {
  userId?: string | null;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  changes?: Record<string, unknown> | null;
}

/** Persist an audit-log entry. Never throws into the calling request path. */
export async function writeAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        changes: input.changes ? JSON.stringify(input.changes) : null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log", err);
  }
}
