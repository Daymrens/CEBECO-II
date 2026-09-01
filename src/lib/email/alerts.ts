import { getDb } from "@/lib/db"
import {
  emailFrom,
  isEmailEnabled,
  sendEmail,
} from "./index"
import type { Outage } from "@shared/types"

export interface AlertOutcome {
  attempted: boolean
  enabled: boolean
  matched: number
  sent: number
  failed: number
  logs: number
}

function formatDateTime(date: string, start: string): string {
  return `${date} @ ${start}`
}

function buildBody(outage: Outage) {
  const barangays = outage.barangays.join(", ")
  const when = formatDateTime(outage.date, outage.start_time)
  const statusLabel = outage.status.charAt(0).toUpperCase() + outage.status.slice(1)

  const text = [
    `${statusLabel} power outage: ${outage.title}`,
    "",
    `Barangay(s): ${barangays}`,
    `When: ${when}`,
    outage.end_time ? `End: ${outage.end_time}` : null,
    outage.reason ? `Reason: ${outage.reason}` : null,
    "",
    "This is a CEBECO II Outage Portal alert. To unsubscribe, visit the portal.",
  ]
    .filter(Boolean)
    .join("\n")

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#18181b;max-width:560px">
      <h2 style="margin:0 0 8px">${statusLabel} power outage</h2>
      <p style="margin:0 0 4px"><strong>${outage.title}</strong></p>
      <p style="margin:0 0 4px">Barangay(s): ${barangays}</p>
      <p style="margin:0 0 4px">When: ${when}</p>
      ${outage.end_time ? `<p style="margin:0 0 4px">End: ${outage.end_time}</p>` : ""}
      ${outage.reason ? `<p style="margin:0 0 4px">Reason: ${outage.reason}</p>` : ""}
      <p style="margin:24px 0 0;color:#71717a;font-size:12px">
        CEBECO II Outage Portal alert.
      </p>
    </div>
  `

  return { subject: `[${statusLabel}] ${outage.title} — ${barangays}`, text, html }
}

/**
 * Emails the verified+active subscribers whose barangay is covered by the
 * outage and records one alert_logs row per recipient. With RESEND_API_KEY
 * unset it records status 'failed' (with a reason) and NEVER throws, so the
 * calling outage mutation always completes.
 */
export async function sendOutageAlerts(outage: Outage): Promise<AlertOutcome> {
  const db = getDb()
  const enabled = isEmailEnabled()
  const matched = await db.findSubscribersByBarangay(outage.barangays)

  let sent = 0
  let failed = 0
  let logs = 0

  for (const sub of matched) {
    try {
      if (!enabled) {
        throw new Error("Email disabled: RESEND_API_KEY is not set")
      }
      const body = buildBody(outage)
      await sendEmail(emailFrom(), sub.email, body.subject, body.text, body.html)
      await db.recordAlert({
        outage_id: outage.id,
        subscriber_id: sub.id,
        status: "sent",
        recipient: sub.email,
      })
      sent += 1
    } catch (err) {
      await db.recordAlert({
        outage_id: outage.id,
        subscriber_id: sub.id,
        status: "failed",
        recipient: sub.email,
        nota: err instanceof Error ? err.message : "Unknown email error",
      })
      failed += 1
    }
    logs += 1
  }

  return { attempted: matched.length > 0, enabled, matched: matched.length, sent, failed, logs }
}
