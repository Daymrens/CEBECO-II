import { NextRequest, NextResponse } from "next/server"

import { getDb } from "@/lib/db"

/**
 * /api/unsubscribe — opt a subscriber out by verify token. We reuse the same
 * token the subscriber verified with (in the sandbox it is returned at
 * subscribe time; in production it is delivered in the verification email).
 * Accepts POST (JSON { token }) or GET (?token=).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const token = body?.token
  return unsubscribe(token)
}

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token")
  return unsubscribe(token)
}

async function unsubscribe(token: unknown) {
  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json({ error: "An unsubscribe token is required" }, { status: 400 })
  }

  const subscriber = await getDb().deactivateSubscriber(token)
  if (!subscriber) {
    return NextResponse.json({ error: "Invalid or unknown unsubscribe token" }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    message: `You have been unsubscribed from ${subscriber.barangay} alerts (${subscriber.email}).`,
    subscriber: { id: subscriber.id, email: subscriber.email, barangay: subscriber.barangay, active: false },
  })
}
