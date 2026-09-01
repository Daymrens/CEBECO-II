import { randomUUID } from "node:crypto"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

import type {
  AdminStats,
  AuditLog,
  Outage,
  User,
} from "@shared/types"

import type {
  AuditLogInput,
  DBAdapter,
  OutageFilters,
  OutageInput,
  OutageUpdate,
  UserInput,
} from "./types"

/**
 * JSON-file data store.
 *
 * This is the LOCAL DEFAULT so the app runs end-to-end in a sandbox with no
 * live Postgres. All rows are persisted to a single JSON file (default
 * `data/db.json`, override with `DATA_FILE`). The adapter mirrors the
 * Postgres schema in `supabase/schema.sql`; switching to Postgres only
 * requires setting `DATABASE_URL` (see src/lib/db/postgres-store.ts).
 */

interface DbFile {
  users: User[]
  outages: Outage[]
  subscribers: { id: string; email: string; barangay: string; created_at: string }[]
  alert_logs: {
    id: string
    outage_id: string
    subscriber_id: string
    sent_at: string
    status: "sent" | "failed"
  }[]
  audit_logs: AuditLog[]
}

function nowIso(): string {
  return new Date().toISOString()
}

function emptyDbFile(): DbFile {
  return { users: [], outages: [], subscribers: [], alert_logs: [], audit_logs: [] }
}

function dayMs(): number {
  return 24 * 60 * 60 * 1000
}

export class JsonFileStore implements DBAdapter {
  readonly name = "json-file"
  private filePath: string
  private writeQueue: Promise<unknown> = Promise.resolve()

  constructor() {
    // Default is statically scoped under the project root; a DATA_FILE env
    // override is supported for local dev only.
    this.filePath = process.env.DATA_FILE
      ? resolve(process.env.DATA_FILE)
      : resolve(process.cwd(), "data", "db.json")
    this.ensureFile()
  }

  private ensureFile(): void {
    try {
      readFileSync(this.filePath, "utf8")
    } catch {
      const dir = dirname(this.filePath)
      mkdirSync(dir, { recursive: true })
      writeFileSync(this.filePath, JSON.stringify(emptyDbFile(), null, 2), "utf8")
    }
  }

  private read(): DbFile {
    return JSON.parse(readFileSync(this.filePath, "utf8")) as DbFile
  }

  private write(next: (db: DbFile) => DbFile): Promise<void> {
    // Serialize writes so concurrent requests never lose rows.
    const task = this.writeQueue.then(() => {
      const db = this.read()
      writeFileSync(
        this.filePath,
        JSON.stringify(next(db), null, 2),
        "utf8"
      )
    })
    this.writeQueue = task.catch(() => undefined)
    return task
  }

  /* ---------------- users ---------------- */

  async getUserByEmail(email: string): Promise<User | null> {
    const db = this.read()
    return (
      db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
    )
  }

  async getUserById(id: string): Promise<User | null> {
    const db = this.read()
    return db.users.find((u) => u.id === id) ?? null
  }

  async createUser(input: UserInput): Promise<User> {
    let user: User = { id: randomUUID(), created_at: nowIso(), ...input }
    await this.write((db) => {
      const existing = db.users.find(
        (u) => u.email.toLowerCase() === input.email.toLowerCase()
      )
      if (existing) {
        existing.name = input.name
        existing.password_hash = input.password_hash
        existing.is_admin = input.is_admin
        user = existing
      } else {
        db.users.push(user)
      }
      return db
    })
    return user
  }

  /* ---------------- outages ---------------- */

  async listOutages(filters?: OutageFilters): Promise<Outage[]> {
    const db = this.read()
    let rows = db.outages.slice()

    const { municipality, barangay, range } = filters ?? {}
    if (municipality) {
      rows = rows.filter((o) => o.municipality === municipality)
    }
    if (barangay) {
      rows = rows.filter((o) => o.barangays.includes(barangay))
    }
    if (range === "day") {
      const today = new Date().toISOString().slice(0, 10)
      rows = rows.filter((o) => o.date === today)
    } else if (range === "week") {
      const weekAgo = new Date(Date.now() - 7 * dayMs()).toISOString().slice(0, 10)
      rows = rows.filter((o) => o.date >= weekAgo)
    }

    return rows.sort((a, b) => b.date.localeCompare(a.date))
  }

  async getOutageById(id: string): Promise<Outage | null> {
    const db = this.read()
    return db.outages.find((o) => o.id === id) ?? null
  }

  async createOutage(input: OutageInput): Promise<Outage> {
    const outage: Outage = {
      id: randomUUID(),
      ...input,
      source: input.source ?? "manual",
      source_url: null,
      map_geojson: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    await this.write((db) => {
      db.outages.push(outage)
      return db
    })
    return outage
  }

  async updateOutage(
    id: string,
    patch: OutageUpdate
  ): Promise<Outage | null> {
    let updated: Outage | null = null
    await this.write((db) => {
      const outage = db.outages.find((o) => o.id === id)
      if (!outage) return db
      Object.assign(outage, patch, { updated_at: nowIso() })
      updated = outage
      return db
    })
    return updated
  }

  async deleteOutage(id: string): Promise<boolean> {
    let removed = false
    await this.write((db) => {
      const before = db.outages.length
      db.outages = db.outages.filter((o) => o.id !== id)
      removed = db.outages.length !== before
      return db
    })
    return removed
  }

  /* ---------------- stats ---------------- */

  async getOutageStats(): Promise<AdminStats> {
    const db = this.read()
    const today = new Date().toISOString().slice(0, 10)
    const upcoming = db.outages.filter(
      (o) => o.status === "scheduled" && o.date >= today
    ).length
    return {
      total_outages: db.outages.length,
      upcoming_count: upcoming,
      subscriber_count: db.subscribers.length,
      alerts_sent: db.alert_logs.length,
    }
  }

  /* ---------------- subscribers / alerts ---------------- */

  async countSubscribers(): Promise<number> {
    return this.read().subscribers.length
  }

  async countAlertLogs(): Promise<number> {
    return this.read().alert_logs.length
  }

  /* ---------------- audit ---------------- */

  async createAuditLog(input: AuditLogInput): Promise<AuditLog> {
    const entry: AuditLog = {
      id: randomUUID(),
      actor_user_id: input.actor_user_id,
      action: input.action,
      target_type: input.target_type,
      target_id: input.target_id ?? null,
      details: input.details ?? null,
      created_at: nowIso(),
    }
    await this.write((db) => {
      db.audit_logs.push(entry)
      return db
    })
    return entry
  }

  async listAuditLogs(limit = 50): Promise<AuditLog[]> {
    const db = this.read()
    return db.audit_logs
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit)
  }
}