import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getDb } from "@/lib/db"
import type { User } from "@shared/types"

import { getSessionFromRequest } from "./session"
import type { SessionPayload } from "./token"

export interface GuardedContext {
  session: SessionPayload
  user: User
}

export async function requireAdmin(
  req: NextRequest
): Promise<{ user: User | null; response?: NextResponse }> {
  const session = await getSessionFromRequest(req)
  if (!session || !session.sub) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const user = await getDb().getUserById(session.sub)
  if (!user || !user.is_admin) {
    return {
      user: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { user }
}

// Convenience for pages that use cookies() instead of a NextRequest.
export async function getCurrentAdmin(): Promise<User | null> {
  const { getSessionFromCookies } = await import("./session")
  const session = await getSessionFromCookies()
  if (!session?.sub) return null
  const user = await getDb().getUserById(session.sub)
  return user && user.is_admin ? user : null
}