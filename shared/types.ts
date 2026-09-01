export type OutageType = "scheduled" | "emergency" | "brownout"

export type OutageStatus = "scheduled" | "ongoing" | "restored" | "cancelled"

export type OutageSource = "manual" | "facebook"

export interface Outage {
  id: string
  title: string
  municipality: string
  barangays: string[]
  sitio_notes: string | null
  type: OutageType
  status: OutageStatus
  date: string
  start_time: string
  end_time: string | null
  reason: string | null
  source: OutageSource
  source_url: string | null
  map_geojson: unknown | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Barangay {
  municipality: string
  barangay: string
}

export interface User {
  id: string
  name: string
  email: string
  password_hash: string
  is_admin: boolean
  created_at: string
}

export type AuditAction = "create" | "update" | "cancel" | "delete"

export type AuditTargetType = "outage" | "user" | "subscriber"

export interface AuditLog {
  id: string
  actor_user_id: string | null
  action: AuditAction
  target_type: AuditTargetType
  target_id: string | null
  details: unknown | null
  created_at: string
}

export interface AdminStats {
  total_outages: number
  upcoming_count: number
  subscriber_count: number
  alerts_sent: number
}
