import { Resend } from "resend"

export interface SendResult {
  ok: boolean
  id?: string
  reason?: string
}

const DEFAULT_FROM =
  "CEBECO II Outage Portal <outages@cebeco-alerts.local>"

/**
 * True only when a real Resend API key is present. In the sandbox (or when
 * the key is missing) email is treated as disabled so the app degrades
 * gracefully instead of failing outage mutations.
 */
export function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

export function emailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_FROM
}

/**
 * Sends an email via Resend. Throws if email is disabled (no RESEND_API_KEY)
 * or if the upstream call fails, so callers can wrap it and record the
 * failure. Never throws for user-facing reasons.
 */
export async function sendEmail(
  from: string,
  to: string | string[],
  subject: string,
  text?: string,
  html?: string
): Promise<SendResult> {
  if (!isEmailEnabled()) {
    throw new Error("Email disabled: RESEND_API_KEY is not set")
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const payload: { from: string; to: string | string[]; subject: string; text?: string; html?: string } = {
    from,
    to,
    subject,
  }
  if (text) payload.text = text
  if (html) payload.html = html

  const { data, error } = await resend.emails.send(payload as never)

  if (error) {
    throw new Error(error.message)
  }

  return { ok: true, id: data?.id }
}
