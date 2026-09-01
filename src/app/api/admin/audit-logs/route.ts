import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getDb } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin(req)
  if (response) return response
  const logs = await getDb().listAuditLogs(100)
  return NextResponse.json({ logs })
}