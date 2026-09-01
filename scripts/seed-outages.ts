/**
 * Seeds sample Sogod outages so the public schedule renders meaningfully.
 *
 *   npm run seed:outages
 *
 * This is a DEV/DEMO seed. It inserts realistic-looking Sogod outage rows into
 * the active store (JSON-file by default) spread across "today" and the coming
 * week, with varied types, statuses, and one Facebook-sourced outage so the
 * public Day / Week / All tabs and the detail page are populated.
 *
 * Idempotent: if outages titled with the "[sample]" prefix already exist, the
 * seed is skipped and existing data is left untouched.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

import type { OutageType, OutageStatus } from "../shared/types"
import { getDb, resetDb } from "../src/lib/db"
import type { OutageInput } from "../src/lib/db/types"

const SAMPLE_PREFIX = "[sample]"

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

interface SampleSpec {
  title: string
  barangays: string[]
  sitio_notes?: string | null
  type: OutageType
  status: OutageStatus
  date: string
  start_time: string
  end_time: string | null
  reason: string
  source?: "manual" | "facebook"
  source_url?: string | null
}

async function main() {
  resetDb()
  const db = getDb()

  const existing = await db.listOutages({})
  if (existing.some((o) => o.title.startsWith(SAMPLE_PREFIX))) {
    console.log("Sample outages already present — skipping.")
    console.log(`store: ${db.name}`)
    return
  }

  // Resolve the default admin id (if any) to attribute created rows.
  const dataFile = process.env.DATA_FILE
    ? resolve(process.env.DATA_FILE)
    : resolve(process.cwd(), "data", "db.json")
  let adminId: string | null = null
  try {
    const parsed = JSON.parse(readFileSync(dataFile, "utf8")) as {
      users?: { id: string; is_admin: boolean }[]
    }
    adminId = parsed.users?.find((u) => u.is_admin)?.id ?? null
  } catch {
    adminId = null
  }

  const today = todayUTC()
  const samples: SampleSpec[] = [
    {
      title: `${SAMPLE_PREFIX} Emergency power outage in Poblacion`,
      barangays: ["Poblacion", "Lubo"],
      sitio_notes: "Plaza area to Sitio Riverside",
      type: "emergency",
      status: "ongoing",
      date: today,
      start_time: "09:30",
      end_time: null,
      reason: "Downed line near the municipal plaza; crew on site.",
      source: "facebook",
      source_url: "https://www.facebook.com/cebeco2",
    },
    {
      title: `${SAMPLE_PREFIX} Scheduled maintenance in Bagakay`,
      barangays: ["Bagakay", "Dakit"],
      sitio_notes: null,
      type: "scheduled",
      status: "scheduled",
      date: today,
      start_time: "08:00",
      end_time: "17:00",
      reason: "Line maintenance and pole replacement.",
    },
    {
      title: `${SAMPLE_PREFIX} Substation brownout in Mohon`,
      barangays: ["Mohon", "Pansoy"],
      sitio_notes: "Lower Mohon, Pansoy proper",
      type: "brownout",
      status: "scheduled",
      date: addDays(today, 1),
      start_time: "13:00",
      end_time: "18:00",
      reason: "Substation load management.",
    },
    {
      title: `${SAMPLE_PREFIX} Transformer replacement in Bagatayam`,
      barangays: ["Bagatayam", "Bawo"],
      sitio_notes: null,
      type: "scheduled",
      status: "scheduled",
      date: addDays(today, 3),
      start_time: "08:30",
      end_time: "16:00",
      reason: "Upgrade of distribution transformer.",
    },
    {
      title: `${SAMPLE_PREFIX} Planned maintenance Cabalawan–Liki`,
      barangays: ["Cabalawan", "Calumboyan", "Liki"],
      sitio_notes: "Along the national highway",
      type: "scheduled",
      status: "scheduled",
      date: addDays(today, 5),
      start_time: "09:00",
      end_time: "15:00",
      reason: "Vegetation clearing and line patrolling.",
    },
    {
      title: `${SAMPLE_PREFIX} Completed maintenance in Tabunok`,
      barangays: ["Tabunok"],
      sitio_notes: null,
      type: "scheduled",
      status: "restored",
      date: addDays(today, -1),
      start_time: "07:00",
      end_time: "12:00",
      reason: "Routine preventive maintenance (restored).",
    },
  ]

  const created: { id: string; source_url: string | null }[] = []
  for (const s of samples) {
    const input: OutageInput = {
      title: s.title,
      municipality: "Sogod",
      barangays: s.barangays,
      sitio_notes: s.sitio_notes ?? null,
      type: s.type,
      status: s.status,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      reason: s.reason,
      source: s.source ?? "manual",
      created_by: adminId,
    }
    const outage = await db.createOutage(input)
    created.push({ id: outage.id, source_url: s.source_url ?? null })
    console.log(`  + ${outage.date} [${outage.type}/${outage.status}] ${outage.title}`)
  }

  // The adapter's createOutage always writes source_url = null. Attach any FB
  // source_url directly to the JSON-file store so the detail page's "source"
  // link works, mirroring what a real facebook ingestion would populate.
  const facebookIds = new Set(
    created.filter((c) => c.source_url).map((c) => c.id)
  )
  if (facebookIds.size > 0) {
    try {
      const dbObj = JSON.parse(readFileSync(dataFile, "utf8")) as {
        outages: { id: string }[]
      }
      dbObj.outages = dbObj.outages.map((o) => {
        const entry = created.find((c) => c.id === o.id)
        if (entry?.source_url) return { ...o, source_url: entry.source_url }
        return o
      })
      writeFileSync(dataFile, JSON.stringify(dbObj, null, 2), "utf8")
    } catch (err) {
      console.warn(
        "Could not attach facebook source_url to the JSON store:",
        err instanceof Error ? err.message : err
      )
    }
  }

  console.log(`Seeded ${samples.length} sample outages in Sogod.`)
  console.log(`store: ${db.name}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
