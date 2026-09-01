import { NextRequest, NextResponse } from "next/server"

import { createAuditLog } from "@/lib/auth/audit"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getDb } from "@/lib/db"
import { sendOutageAlerts } from "@/lib/email/alerts"
import { parseOutageBody } from "@/lib/outages/validation"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const outage = await getDb().getOutageById(id)
  if (!outage) {
    return NextResponse.json({ error: "Outage not found" }, { status: 404 })
  }
  return NextResponse.json({ outage })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { user, response } = await requireAdmin(req)
  if (response) return response

  const { id } = await params
  const current = await getDb().getOutageById(id)
  if (!current) {
    return NextResponse.json({ error: "Outage not found" }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const raw = body as Record<string, unknown>

  // Merge the patch onto the current row, then run the full validator so any
  // combination of fields (including a status-only cancel) is accepted and
  // checked. PATCH semantics are preserved because the merged row reflects
  // current + sent-changes.
  let parsed
  try {
    parsed = parseOutageBody({
      ...current,
      ...raw,
      status: raw.status ?? current.status,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Validation failed" },
      { status: 400 }
    )
  }

  const before = current
  const outage = await getDb().updateOutage(id, {
    title: parsed.title,
    municipality: parsed.municipality,
    barangays: parsed.barangays,
    sitio_notes: parsed.sitio_notes ?? null,
    type: parsed.type,
    status: parsed.status,
    date: parsed.date,
    start_time: parsed.start_time,
    end_time: parsed.end_time ?? null,
    reason: parsed.reason ?? null,
  })
  if (!outage) {
    return NextResponse.json({ error: "Outage not found" }, { status: 404 })
  }

  const action = outage.status === "cancelled" ? "cancel" : "update"
  await createAuditLog({
    actor_user_id: user!.id,
    action,
    target_type: "outage",
    target_id: outage.id,
    details: { before, changes: raw },
  })

  // Phase 4: notify when an outage moves to cancelled or restored. Wrapped so
  // a mail failure never fails the mutation.
  let alerts = null
  if (outage.status === "cancelled" || outage.status === "restored") {
    try {
      alerts = await sendOutageAlerts(outage)
    } catch {
      alerts = null
    }
  }

  return NextResponse.json({ outage, alerts })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { user, response } = await requireAdmin(req)
  if (response) return response

  const { id } = await params
  const current = await getDb().getOutageById(id)
  if (!current) {
    return NextResponse.json({ error: "Outage not found" }, { status: 404 })
  }

  const ok = await getDb().deleteOutage(id)
  if (!ok) {
    return NextResponse.json({ error: "Outage not found" }, { status: 404 })
  }

  await createAuditLog({
    actor_user_id: user!.id,
    action: "delete",
    target_type: "outage",
    target_id: id,
    details: { title: current.title, municipality: current.municipality },
  })

  return NextResponse.json({ ok: true })
}