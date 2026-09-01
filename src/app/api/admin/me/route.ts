import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import type { User } from "@shared/types"

function publicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    is_admin: user.is_admin,
    created_at: user.created_at,
  }
}

export async function GET(req: NextRequest) {
  const { user, response } = await requireAdmin(req)
  if (response) return response
  return NextResponse.json({ user: publicUser(user!) })
}