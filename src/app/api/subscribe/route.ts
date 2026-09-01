import { randomUUID } from "node:crypto"

import { NextRequest, NextResponse } from "next/server"

import { getDb } from "@/lib/db"
import { SOGOD_BARANGAYS } from "@shared/index"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(v: unknown): v is string {
  return typeof v === "string" && EMAIL_RE.test(v.trim())
}

/**
 * POST /api/subscribe — create a pending (unverified) email-alert subscriber.
 *
 * Body: { email, barangay, sitio? }. The barangay must be a valid Sogod
 * barangay. Duplicate (email, barangay) rows are rejected with 400. In the
 * sandbox there is no outbound mail, so the verification token is returned
 * (and logged) so the flow can be exercised end-to-end.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { email, barangay, sitio } = body as Record<string, unknown>

  if (!validateEmail(email)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 })
  }

  if (typeof barangay !== "string" || !SOGOD_BARANGAYS.includes(barangay)) {
    return NextResponse.json(
      { error: `"${String(barangay)}" is not a valid Sogod barangay` },
      { status: 400 }
    )
  }

  const db = getDb()

  const existing = await db.getSubscriberByEmailBarangay(email.trim(), barangay)
  if (existing) {
    return NextResponse.json(
      { error: `You are already subscribed to ${barangay} alerts` },
      { status: 400 }
    )
  }

  const verifyToken = randomUUID()
  const subscriber = await db.createSubscriber({
    email: email.trim(),
    barangay,
    sitio: typeof sitio === "string" && sitio.trim() ? sitio.trim() : null,
    verify_token: verifyToken,
  })

  // Sandbox: no mail is actually sent, so surface the verification step here.
  const verifyUrl = `/api/subscribe/verify?token=${verifyToken}`

  return NextResponse.json(
    {
      ok: true,
      message: `Almost done! Check how to confirm your ${barangay} subscription.`,
      subscriber: { id: subscriber.id, email: subscriber.email, barangay: subscriber.barangay },
      status: "pending",
      // Testable in the sandbox; in production this link goes out by email.
      verifyUrl,
      verifyToken,
    },
    { status: 201 }
  )
}
