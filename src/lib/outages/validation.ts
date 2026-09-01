import type { OutageStatus, OutageType } from "@shared/types"
import { MUNICIPALITIES, OUTAGE_STATUSES, OUTAGE_TYPES, SOGOD_BARANGAYS } from "@shared/index"

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}$/

export interface OutageBody {
  title: string
  municipality: string
  barangays: string[]
  sitio_notes?: string | null
  type: OutageType
  status: OutageStatus
  date: string
  start_time: string
  end_time?: string | null
  reason?: string | null
}

function isString(v: unknown): v is string {
  return typeof v === "string"
}

function isValidDate(v: unknown): v is string {
  if (!isString(v) || !DATE_RE.test(v)) return false
  const [y, m, d] = v.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

function isValidTime(v: unknown): v is string {
  if (!isString(v) || !TIME_RE.test(v)) return false
  const [h, m] = v.split(":").map(Number)
  return h >= 0 && h <= 23 && m >= 0 && m <= 59
}

function validBarangay(municipality: string, barangay: string): boolean {
  // Sogod has a curated list (shared/constants). Other municipalities accept
  // any non-empty barangay name for now.
  if (municipality === "Sogod") return SOGOD_BARANGAYS.includes(barangay)
  return barangay.trim().length > 0
}

/**
 * Normalizes + validates a full outage payload. Throws with a message on
 * invalid input; returns a clean object ready for the DB layer.
 */
export function parseOutageBody(body: Record<string, unknown>): OutageBody {
  const title = isString(body.title) ? body.title.trim() : ""
  const municipality = isString(body.municipality) ? body.municipality.trim() : ""
  const type = body.type as OutageType
  const status = body.status as OutageStatus
  const date = isString(body.date) ? body.date : ""
  const start_time = isString(body.start_time) ? body.start_time : ""

  if (!title) throw new Error("Title is required")
  if (!MUNICIPALITIES.includes(municipality as (typeof MUNICIPALITIES)[number]))
    throw new Error("Invalid municipality")
  if (!OUTAGE_TYPES.includes(type)) throw new Error("Invalid outage type")
  if (!OUTAGE_STATUSES.includes(status)) throw new Error("Invalid outage status")
  if (!isValidDate(date)) throw new Error("Invalid date (expected YYYY-MM-DD)")
  if (!isValidTime(start_time)) throw new Error("Invalid start time (expected HH:MM)")

  const rawBarangays = Array.isArray(body.barangays) ? body.barangays : []
  const barangays = rawBarangays
    .filter(isString)
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
  if (barangays.length === 0) throw new Error("At least one barangay is required")
  for (const b of barangays) {
    if (!validBarangay(municipality, b)) {
      throw new Error(`"${b}" is not a valid barangay for ${municipality}`)
    }
  }

  const out: OutageBody = {
    title,
    municipality,
    barangays,
    type,
    status,
    date,
    start_time,
  }

  if (body.sitio_notes != null) out.sitio_notes = isString(body.sitio_notes) ? body.sitio_notes : ""
  if (body.end_time != null && body.end_time !== "") {
    if (!isValidTime(body.end_time)) throw new Error("Invalid end time (expected HH:MM)")
    out.end_time = body.end_time
  }
  if (body.reason != null) out.reason = isString(body.reason) ? body.reason : ""

  return out
}

export function toDbInput(body: OutageBody, actorId: string | null) {
  return {
    title: body.title,
    municipality: body.municipality,
    barangays: body.barangays,
    sitio_notes: body.sitio_notes ?? null,
    type: body.type,
    status: body.status,
    date: body.date,
    start_time: body.start_time,
    end_time: body.end_time ?? null,
    reason: body.reason ?? null,
    source: "manual" as const,
    created_by: actorId,
  }
}