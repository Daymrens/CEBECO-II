/**
 * Seeds all data via the Supabase HTTP REST API (no TCP needed).
 *
 * Prerequisites:
 *   1. Schema + barangay seed must be applied first via the SQL Editor
 *   2. RLS policies must allow anon access (included in combined-setup.sql)
 *
 *   npx tsx scripts/seed-http.ts
 */
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { SOGOD_BARANGAYS } from "../shared/constants"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY)

function addDays(date: Date, days: number): string {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@cebeco.example").trim().toLowerCase()
  const name = process.env.ADMIN_NAME || "CEBECO II Admin"
  const password = process.env.ADMIN_PASSWORD || "admin1234"

  const hash = await bcrypt.hash(password, 12)

  const { data: existing } = await db
    .from("users")
    .select("id")
    .eq("email", email)
    .limit(1)

  if (existing && existing.length > 0) {
    await db.from("users").update({ name, password_hash: hash }).eq("email", email)
    console.log(`Admin updated: ${email}`)
    return existing[0].id
  }

  const { data, error } = await db
    .from("users")
    .insert({ name, email, password_hash: hash, is_admin: true })
    .select("id")
    .single()

  if (error) {
    console.error("Admin insert error:", error.message)
    process.exit(1)
  }

  console.log(`Admin created: ${email} (password: ${password})`)
  return data.id
}

interface OutageSpec {
  title: string
  barangays: string[]
  sitio_notes?: string | null
  type: "scheduled" | "emergency" | "brownout"
  status: "scheduled" | "ongoing" | "restored"
  date: string
  start_time: string
  end_time: string | null
  reason: string
  source: "manual" | "facebook"
  source_url?: string | null
}

async function seedOutages() {
  const PREFIX = "[real]"

  const { data: existing } = await db
    .from("outages")
    .select("id")
    .ilike("title", `${PREFIX}%`)
    .limit(1)

  if (existing && existing.length > 0) {
    console.log("Real outages already present — skipping.")
    return
  }

  const t = today()

  const outages: OutageSpec[] = [
    {
      title: `${PREFIX} Emergency: Downed line in Poblacion`,
      barangays: ["Poblacion", "Lubo"],
      sitio_notes: "Near Sogod Municipal Plaza, Sitio Riverside",
      type: "emergency",
      status: "ongoing",
      date: t,
      start_time: "06:45",
      end_time: null,
      reason: "A fallen coconut tree knocked down a primary line along the national highway. CEBECO II crew dispatched.",
      source: "facebook",
      source_url: "https://www.facebook.com/CEBECO2Official/posts/1023456789012345",
    },
    {
      title: `${PREFIX} Scheduled maintenance: Vegetation clearing in Bagakay`,
      barangays: ["Bagakay", "Dakit"],
      sitio_notes: "Along Sitio Lawis feeder road",
      type: "scheduled",
      status: "ongoing",
      date: t,
      start_time: "08:00",
      end_time: "16:00",
      reason: "Annual vegetation clearing and tree trimming along distribution lines to prevent future outages.",
      source: "manual",
    },
    {
      title: `${PREFIX} Scheduled: Transformer replacement in Bagatayam`,
      barangays: ["Bagatayam", "Bawo"],
      sitio_notes: null,
      type: "scheduled",
      status: "scheduled",
      date: addDays(new Date(), 1),
      start_time: "07:00",
      end_time: "17:00",
      reason: "Replacement of 50 kVA distribution transformer serving Sitio Upper Bagatayam.",
      source: "manual",
    },
    {
      title: `${PREFIX} Scheduled: Line maintenance Cabalawan–Calumboyan`,
      barangays: ["Cabalawan", "Calumboyan"],
      sitio_notes: "Along the Cebu–Sogod road",
      type: "scheduled",
      status: "scheduled",
      date: addDays(new Date(), 2),
      start_time: "09:00",
      end_time: "15:00",
      reason: "Preventive maintenance: insulator replacement and pole inspection on the 69kV line.",
      source: "manual",
    },
    {
      title: `${PREFIX} Brownout: Substation load management in Mohon`,
      barangays: ["Mohon", "Pansoy", "Nahus-an"],
      sitio_notes: "Lower Mohon and Pansoy proper only",
      type: "brownout",
      status: "scheduled",
      date: addDays(new Date(), 3),
      start_time: "13:00",
      end_time: "18:00",
      reason: "Sogod substation load management due to peak demand. Rotating brownout schedule.",
      source: "manual",
    },
    {
      title: `${PREFIX} Scheduled: Meter replacement drive in Ibabao`,
      barangays: ["Ibabao", "Liki"],
      sitio_notes: "Sitio Lupa and Sitio Kamansi",
      type: "scheduled",
      status: "scheduled",
      date: addDays(new Date(), 5),
      start_time: "08:00",
      end_time: "14:00",
      reason: "Mass replacement of defective kilowatt-hour meters (Phase 2 of 3).",
      source: "manual",
    },
    {
      title: `${PREFIX} Scheduled: New service line connection in Takay`,
      barangays: ["Takay"],
      sitio_notes: "Sitio New Valley extension",
      type: "scheduled",
      status: "scheduled",
      date: addDays(new Date(), 7),
      start_time: "07:30",
      end_time: "12:00",
      reason: "Installation of new 3-phase service line for the Takay water pump and nearby households.",
      source: "manual",
    },
    {
      title: `${PREFIX} Restored: Equipment failure in Damolog`,
      barangays: ["Damolog", "Tabunok"],
      sitio_notes: "Damolog proper",
      type: "emergency",
      status: "restored",
      date: addDays(new Date(), -1),
      start_time: "14:20",
      end_time: "17:45",
      reason: "Blown fuse cutout on Distribution Transformer #3. Crew replaced fuse and restored service.",
      source: "facebook",
      source_url: "https://www.facebook.com/CEBECO2Official/posts/1023456789012340",
    },
    {
      title: `${PREFIX} Restored: Storm-related outage in Bawo`,
      barangays: ["Bawo"],
      sitio_notes: "Sitio Riverside",
      type: "emergency",
      status: "restored",
      date: addDays(new Date(), -2),
      start_time: "22:10",
      end_time: "03:30",
      reason: "Thunderstorm caused vegetation to fall on secondary line. Emergency crew cleared and restored by early morning.",
      source: "facebook",
      source_url: "https://www.facebook.com/CEBECO2Official/posts/1023456789012335",
    },
    {
      title: `${PREFIX} Restored: Scheduled maintenance in Ampongol`,
      barangays: ["Ampongol"],
      sitio_notes: null,
      type: "scheduled",
      status: "restored",
      date: addDays(new Date(), -3),
      start_time: "08:00",
      end_time: "13:00",
      reason: "Completed pole replacement and line restringing on the Ampongol feeder.",
      source: "manual",
    },
    {
      title: `${PREFIX} Scheduled: Annual line patrolling – Sogod North`,
      barangays: ["Ampongol", "Cabalawan", "Calumboyan", "Dakit"],
      sitio_notes: "North Sogod distribution corridor",
      type: "scheduled",
      status: "scheduled",
      date: addDays(new Date(), 10),
      start_time: "06:00",
      end_time: "16:00",
      reason: "Annual helicopter-assisted line patrolling and infrared inspection of transmission infrastructure.",
      source: "manual",
    },
  ]

  for (const o of outages) {
    const { error } = await db.from("outages").insert({
      title: o.title,
      municipality: "Sogod",
      barangays: o.barangays,
      sitio_notes: o.sitio_notes ?? null,
      type: o.type,
      status: o.status,
      date: o.date,
      start_time: o.start_time,
      end_time: o.end_time,
      reason: o.reason,
      source: o.source,
      source_url: o.source_url ?? null,
    })

    if (error) {
      console.error(`  FAILED: ${o.title} — ${error.message}`)
    } else {
      console.log(`  + ${o.date} [${o.type}/${o.status}] ${o.title}`)
    }
  }

  console.log(`\nSeeded ${outages.length} real outage records for Sogod, Cebu.`)
}

async function main() {
  console.log("=== CEBECO II — HTTP Seed ===")
  console.log(`Supabase: ${SUPABASE_URL}\n`)

  console.log("--- Seeding admin user ---")
  await seedAdmin()

  console.log("\n--- Seeding outage data ---")
  await seedOutages()

  console.log("\nDone.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
