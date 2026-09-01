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
  reason: string
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
