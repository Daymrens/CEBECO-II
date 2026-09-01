import { getDb } from "@/lib/db"
import type { AuditLogInput } from "@/lib/db/types"

export function createAuditLog(input: AuditLogInput) {
  return getDb().createAuditLog(input)
}