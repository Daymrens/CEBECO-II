import { jwtVerify, SignJWT } from "jose"

const ALGORITHM = "HS256"
const MAX_SESSION_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    // Dev fallback: derive a stable key from the fallback (never used in prod).
    return new TextEncoder().encode("cebeco-dev-secret-do-not-use-in-prod")
  }
  return new TextEncoder().encode(secret)
}

export interface SessionPayload {
  sub: string
  email: string
  isAdmin: boolean
  iat?: number
  exp?: number
}

export function sessionMaxAgeSeconds(): number {
  return MAX_SESSION_AGE_SECONDS
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, isAdmin: payload.isAdmin })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_SESSION_AGE_SECONDS}s`)
    .sign(getSecret())
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [ALGORITHM],
    })
    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
      return null
    }
    return {
      sub: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      isAdmin: payload.isAdmin === true,
    }
  } catch {
    return null
  }
}