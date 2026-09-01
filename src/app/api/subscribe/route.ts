import { NextRequest, NextResponse } from "next/server"

/**
 * Subscribe — STUB (Phase 3).
 *
 * Email alert sending is planned for Phase 4. This route exists so the public
 * subscribe form is wired end-to-end today, but it does NOT create a
 * subscriber or send email. It always replies with a friendly "coming soon".
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  return NextResponse.json(
    {
      ok: false,
      message:
        "Email alerts are coming soon. Your subscription preference has not been saved yet — check back after the alerts feature ships.",
      received: body,
    },
    { status: 501 }
  )
}
