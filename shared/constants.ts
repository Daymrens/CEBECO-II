import type { OutageType, OutageStatus } from "./types"

export const MUNICIPALITIES: readonly string[] = [
  "Bogo City",
  "Danao City",
  "Borbon",
  "Carmen",
  "Catmon",
  "Compostela",
  "Daanbantayan",
  "Medellin",
  "San Remigio",
  "Sogod",
  "Tabogon",
  "Tabuelan",
  "Tuburan",
] as const

export const SOGOD_BARANGAYS: readonly string[] = [
  "Ampongol",
  "Bagakay",
  "Bagatayam",
  "Bawo",
  "Cabalawan",
  "Cabangahan",
  "Calumboyan",
  "Dakit",
  "Damolog",
  "Ibabao",
  "Liki",
  "Lubo",
  "Mohon",
  "Nahus-an",
  "Pansoy",
  "Poblacion",
  "Tabunok",
  "Takay",
] as const

export const OUTAGE_TYPES: readonly OutageType[] = [
  "scheduled",
  "emergency",
  "brownout",
] as const

export const OUTAGE_STATUSES: readonly OutageStatus[] = [
  "scheduled",
  "ongoing",
  "restored",
  "cancelled",
] as const
