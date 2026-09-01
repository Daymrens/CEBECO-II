import { NextRequest, NextResponse } from "next/server"

import { verifyPassword } from "@/lib/auth/password"
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session"
import { signSessionToken } from "@/lib/auth/token"
import { getDb } from "@/lib/db"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email =
    body && typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = body && typeof body.password === "string" ? body.password : ""

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    )
  }

  const user = await getDb().getUserByEmail(email)
  const validPassword = user
    ? await verifyPassword(password, user.password_hash)
    : false

  if (!user || !validPassword || !user.is_admin) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    )
  }

  const token = await signSessionToken({
    sub: user.id,
    email: user.email,
    isAdmin: user.is_admin,
  })

  const res = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin,
      created_at: user.created_at,
    },
  })
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions)
  return res
}