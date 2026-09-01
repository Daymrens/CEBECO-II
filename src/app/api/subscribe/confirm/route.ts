import { NextRequest, NextResponse } from "next/server"

import { getDb } from "@/lib/db"

/**
 * GET /api/subscribe/confirm?token=... — deprecated simple variant of
 * /api/subscribe/verify. Marks a subscriber verified using the token returned
 * at subscribe time. Kept so verification links that predate the
 * POST /api/subscribe/verify endpoint keep working.
 */
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token")
  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json({ error: "A verify token is required" }, { status: 400 })
  }

  const subscriber = await getDb().verifySubscriber(token)
  if (!subscriber) {
    return NextResponse.json({ error: "Invalid or already-used verify token" }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    message: `Subscription verified for ${subscriber.email} (${subscriber.barangay}). You will receive outage alerts.`,
    subscriber: {
      id: subscriber.id,
      email: subscriber.email,
      barangay: subscriber.barangay,
      verified: true,
    },
  })
}