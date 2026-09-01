import { NextRequest, NextResponse } from "next/server"

import { createAuditLog } from "@/lib/auth/audit"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getDb } from "@/lib/db"
import { sendOutageAlerts } from "@/lib/email/alerts"
import { parseOutageBody, toDbInput } from "@/lib/outages/validation"
import type { Outage } from "@shared/types"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const municipality = searchParams.get("municipality") ?? undefined
  const barangay = searchParams.get("barangay") ?? undefined
  const range = searchParams.get("range")
  const rangeFilter =
    range === "day" || range === "week" || range === "all" ? range : undefined

  const outages = await getDb().listOutages({
    municipality,
    barangay,
    range: rangeFilter ?? "all",
  })
  return NextResponse.json({ outages })
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAdmin(req)
  if (response) return response

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  let parsed
  try {
    parsed = parseOutageBody(body as Record<string, unknown>)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Validation failed" },
      { status: 400 }
    )
  }

  const outage: Outage = await getDb().createOutage(toDbInput(parsed, user!.id))
  await createAuditLog({
    actor_user_id: user!.id,
    action: "create",
    target_type: "outage",
    target_id: outage.id,
    details: {
      title: outage.title,
      municipality: outage.municipality,
      barangays: outage.barangays,
    },
  })

  // Phase 4: notify matching subscribers. Wrapped so a mail failure never
  // fails the outage creation itself.
  let alerts
  try {
    alerts = await sendOutageAlerts(outage)
  } catch {
    alerts = null
  }

  return NextResponse.json({ outage, alerts }, { status: 201 })
}