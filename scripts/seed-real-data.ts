/**
 * Seeds realistic CEBECO II outage data for Sogod, Cebu.
 *
 *   npx tsx scripts/seed-real-data.ts
 *
 * Uses the app's PostgresStore adapter (requires DATABASE_URL).
 * Idempotent: skips if the "[real]" prefix outages already exist.
 */
import { getDb, resetDb } from "../src/lib/db"

const PREFIX = "[real]"

function addDays(date: Date, days: number): string {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
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

async function main() {
  resetDb()
  const db = getDb()

  if (db.name !== "postgres") {
    console.error(`Expected postgres store, got ${db.name}. Set DATABASE_URL.`);
    process.exit(1);
  }

  const existing = await db.listOutages({})
  if (existing.some((o) => o.title.startsWith(PREFIX))) {
    console.log("Real sample outages already present — skipping.");
    return;
  }

  const t = today()

  const outages: OutageSpec[] = [
    // === ONGOING EMERGENCY ===
    {
      title: `${PREFIX} Emergency: Downed line in Poblacion`,
      barangays: ["Poblacion", "Lubo"],
      sitio_notes: "Near Sogod Municipal Plaza, Sitio Riverside",
      type: "emergency",
      status: "ongoing",
      date: t,
      start_time: "06:45",
      end_time: null,
      reason:
        "A fallen coconut tree knocked down a primary line along the national highway. CEBECO II crew dispatched.",
      source: "facebook",
      source_url: "https://www.facebook.com/CEBECO2Official/posts/1023456789012345",
    },

    // === SCHEDULED TODAY ===
    {
      title: `${PREFIX} Scheduled maintenance: Vegetation clearing in Bagakay`,
      barangays: ["Bagakay", "Dakit"],
      sitio_notes: "Along Sitio Lawis feeder road",
      type: "scheduled",
      status: "ongoing",
      date: t,
      start_time: "08:00",
      end_time: "16:00",
      reason:
        "Annual vegetation clearing and tree trimming along distribution lines to prevent future outages.",
      source: "manual",
    },

    // === SCHEDULED TOMORROW ===
    {
      title: `${PREFIX} Scheduled: Transformer replacement in Bagatayam`,
      barangays: ["Bagatayam", "Bawo"],
      sitio_notes: null,
      type: "scheduled",
      status: "scheduled",
      date: addDays(new Date(), 1),
      start_time: "07:00",
      end_time: "17:00",
      reason:
        "Replacement of 50 kVA distribution transformer serving Sitio Upper Bagatayam.",
      source: "manual",
    },

    // === SCHEDULED IN 2 DAYS ===
    {
      title: `${PREFIX} Scheduled: Line maintenance Cabalawan–Calumboyan`,
      barangays: ["Cabalawan", "Calumboyan"],
      sitio_notes: "Along the Cebu–Sogod road",
      type: "scheduled",
      status: "scheduled",
      date: addDays(new Date(), 2),
      start_time: "09:00",
      end_time: "15:00",
      reason:
        "Preventive maintenance: insulator replacement and pole inspection on the 69kV line.",
      source: "manual",
    },

    // === SCHEDULED IN 3 DAYS ===
    {
      title: `${PREFIX} Brownout: Substation load management in Mohon`,
      barangays: ["Mohon", "Pansoy", "Nahus-an"],
      sitio_notes: "Lower Mohon and Pansoy proper only",
      type: "brownout",
      status: "scheduled",
      date: addDays(new Date(), 3),
      start_time: "13:00",
      end_time: "18:00",
      reason:
        "Sogod substation load management due to peak demand. Rotating brownout schedule.",
      source: "manual",
    },

    // === SCHEDULED IN 5 DAYS ===
    {
      title: `${PREFIX} Scheduled: Meter replacement drive in Ibabao`,
      barangays: ["Ibabao", "Liki"],
      sitio_notes: "Sitio Lupa and Sitio Kamansi",
      type: "scheduled",
      status: "scheduled",
      date: addDays(new Date(), 5),
      start_time: "08:00",
      end_time: "14:00",
      reason:
        "Mass replacement of defective kilowatt-hour meters (Phase 2 of 3).",
      source: "manual",
    },

    // === SCHEDULED IN 7 DAYS ===
    {
      title: `${PREFIX} Scheduled: New service line connection in Takay`,
      barangays: ["Takay"],
      sitio_notes: "Sitio New Valley extension",
      type: "scheduled",
      status: "scheduled",
      date: addDays(new Date(), 7),
      start_time: "07:30",
      end_time: "12:00",
      reason:
        "Installation of new 3-phase service line for the Takay water pump and nearby households.",
      source: "manual",
    },

    // === RESTORED YESTERDAY ===
    {
      title: `${PREFIX} Restored: Equipment failure in Damolog`,
      barangays: ["Damolog", "Tabunok"],
      sitio_notes: "Damolog proper",
      type: "emergency",
      status: "restored",
      date: addDays(new Date(), -1),
      start_time: "14:20",
      end_time: "17:45",
      reason:
        "Blown fuse cutout on Distribution Transformer #3. Crew replaced fuse and restored service.",
      source: "facebook",
      source_url: "https://www.facebook.com/CEBECO2Official/posts/1023456789012340",
    },

    // === RESTORED 2 DAYS AGO ===
    {
      title: `${PREFIX} Restored: Storm-related outage in Bawo`,
      barangays: ["Bawo"],
      sitio_notes: "Sitio Riverside",
      type: "emergency",
      status: "restored",
      date: addDays(new Date(), -2),
      start_time: "22:10",
      end_time: "03:30",
      reason:
        "Thunderstorm caused vegetation to fall on secondary line. Emergency crew cleared and restored by early morning.",
      source: "facebook",
      source_url: "https://www.facebook.com/CEBECO2Official/posts/1023456789012335",
    },

    // === RESTORED 3 DAYS AGO ===
    {
      title: `${PREFIX} Restored: Scheduled maintenance in Ampongol`,
      barangays: ["Ampongol"],
      sitio_notes: null,
      type: "scheduled",
      status: "restored",
      date: addDays(new Date(), -3),
      start_time: "08:00",
      end_time: "13:00",
      reason:
        "Completed pole replacement and line restringing on the Ampongol feeder.",
      source: "manual",
    },

    // === SCHEDULED IN 10 DAYS ===
    {
      title: `${PREFIX} Scheduled: Annual line patrolling – Sogod North`,
      barangays: ["Ampongol", "Cabalawan", "Calumboyan", "Dakit"],
      sitio_notes: "North Sogod distribution corridor",
      type: "scheduled",
      status: "scheduled",
      date: addDays(new Date(), 10),
      start_time: "06:00",
      end_time: "16:00",
      reason:
        "Annual helicopter-assisted line patrolling and infrared inspection of transmission infrastructure.",
      source: "manual",
    },
  ]

  for (const o of outages) {
    const created = await db.createOutage({
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
      created_by: null,
    })

    console.log(`  + ${created.date} [${created.type}/${created.status}] ${created.title}`)
  }

  console.log(`\nSeeded ${outages.length} real outage records for Sogod, Cebu.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
