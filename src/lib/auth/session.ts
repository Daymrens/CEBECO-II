import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

import { signSessionToken, verifySessionToken } from "./token"
import type { SessionPayload } from "./token"

export const SESSION_COOKIE = "cebeco_admin_session"

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
}

export async function createSessionCookie(
  payload: SessionPayload
): Promise<string> {
  const token = await signSessionToken(payload)
  return token
}

export async function getSessionFromRequest(
  req: NextRequest
): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function deleteSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

// Re-exported for convenience in route handlers that set the cookie manually.
export { sessionMaxAgeSeconds } from "./token"