import { NextRequest, NextResponse } from "next/server"

import { getDb } from "@/lib/db"

/**
 * /api/subscribe/verify — mark a subscriber verified using the token returned
 * at subscribe time. Supports POST (JSON { token }) and GET (?token=).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const token = body?.token
  return verify(token)
}

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token")
  return verify(token)
}

async function verify(token: unknown) {
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
