import { Pool } from "pg"

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
 * Postgres data store.
 *
 * Activated by setting `DATABASE_URL` (and, in production, real Supabase /
 * Postgres credentials). The schema is defined in `supabase/schema.sql`.
 * Queries here mirror the JSON-file store (src/lib/db/json-store.ts) so the
 * two backends behave identically.
 *
 * NOT the default: this sandbox has no live Postgres, so the app defaults to
 * the JSON-file store. Set `DATABASE_URL` and restart to switch.
 */

function rowToOutage(row: Record<string, unknown>): Outage {
  return {
    id: String(row.id),
    title: String(row.title),
    municipality: String(row.municipality),
    barangays: Array.isArray(row.barangays)
      ? (row.barangays as string[])
      : [String(row.barangays)],
    sitio_notes: row.sitio_notes == null ? null : String(row.sitio_notes),
    type: row.type as Outage["type"],
    status: row.status as Outage["status"],
    date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date),
    start_time: String(row.start_time),
    end_time: row.end_time == null ? null : String(row.end_time),
    reason: row.reason == null ? null : String(row.reason),
    source: row.source as Outage["source"],
    source_url: row.source_url == null ? null : String(row.source_url),
    map_geojson: row.map_geojson ?? null,
    created_by: row.created_by == null ? null : String(row.created_by),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  }
}

export class PostgresStore implements DBAdapter {
  readonly name = "postgres"
  private pool: Pool

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 10,
    })
  }

  /* ---------------- users ---------------- */

  async getUserByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      `select * from public.users where lower(email) = lower($1) limit 1`,
      [email]
    )
    return rows[0] ? this.toUser(rows[0]) : null
  }

  async getUserById(id: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      `select * from public.users where id = $1 limit 1`,
      [id]
    )
    return rows[0] ? this.toUser(rows[0]) : null
  }

  async createUser(input: UserInput): Promise<User> {
    const { rows } = await this.pool.query(
      `insert into public.users (name, email, password_hash, is_admin)
       values ($1, $2, $3, $4)
       on conflict (email) do update set name = excluded.name, password_hash = excluded.password_hash, is_admin = excluded.is_admin
       returning *`,
      [input.name, input.email, input.password_hash, input.is_admin]
    )
    return this.toUser(rows[0])
  }

  private toUser(row: Record<string, unknown>): User {
    return {
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      password_hash: String(row.password_hash),
      is_admin: Boolean(row.is_admin),
      created_at:
        row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    }
  }

  /* ---------------- outages ---------------- */

  async listOutages(filters?: OutageFilters): Promise<Outage[]> {
    const conditions: string[] = []
    const params: unknown[] = []
    const { municipality, barangay, range } = filters ?? {}

    if (municipality) {
      params.push(municipality)
      conditions.push(`municipality = $${params.length}`)
    }
    if (barangay) {
      params.push(barangay)
      conditions.push(`$${params.length} = any(barangays)`)
    }
    if (range === "day") {
      conditions.push(`date = current_date`)
    } else if (range === "week") {
      conditions.push(`date >= current_date - interval '7 days'`)
    }

    const where = conditions.length ? `where ${conditions.join(" and ")}` : ""
    const { rows } = await this.pool.query(
      `select * from public.outages ${where} order by date desc`,
      params
    )
    return rows.map((r) => rowToOutage(r))
  }

  async getOutageById(id: string): Promise<Outage | null> {
    const { rows } = await this.pool.query(
      `select * from public.outages where id = $1 limit 1`,
      [id]
    )
    return rows[0] ? rowToOutage(rows[0]) : null
  }

  async createOutage(input: OutageInput): Promise<Outage> {
    const { rows } = await this.pool.query(
      `insert into public.outages
         (title, municipality, barangays, sitio_notes, type, status, date, start_time, end_time, reason, source, created_by)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       returning *`,
      [
        input.title,
        input.municipality,
        input.barangays,
        input.sitio_notes,
        input.type,
        input.status,
        input.date,
        input.start_time,
        input.end_time,
        input.reason,
        input.source ?? "manual",
        input.created_by,
      ]
    )
    return rowToOutage(rows[0])
  }

  async updateOutage(id: string, patch: OutageUpdate): Promise<Outage | null> {
    const fields = Object.keys(patch).filter((k) => patch[k as keyof OutageUpdate] !== undefined)
    if (fields.length === 0) return this.getOutageById(id)

    const sets = fields.map((f, i) => `${f} = $${i + 1}`)
    const params: unknown[] = fields.map((f) => patch[f as keyof OutageUpdate])
    params.push(id)
    const { rows } = await this.pool.query(
      `update public.outages set ${sets.join(", ")} where id = $${params.length} returning *`,
      params
    )
    return rows[0] ? rowToOutage(rows[0]) : null
  }

  async deleteOutage(id: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      `delete from public.outages where id = $1`,
      [id]
    )
    return (rowCount ?? 0) > 0
  }

  /* ---------------- stats ---------------- */

  async getOutageStats(): Promise<AdminStats> {
    const [total, upcoming, subscribers, alerts] = await Promise.all([
      this.pool.query(`select count(*)::int as c from public.outages`),
      this.pool.query(
        `select count(*)::int as c from public.outages where status = 'scheduled' and date >= current_date`
      ),
      this.pool.query(`select count(*)::int as c from public.subscribers`),
      this.pool.query(`select count(*)::int as c from public.alert_logs`),
    ])
    return {
      total_outages: total.rows[0].c,
      upcoming_count: upcoming.rows[0].c,
      subscriber_count: subscribers.rows[0].c,
      alerts_sent: alerts.rows[0].c,
    }
  }

  /* ---------------- subscribers / alerts ---------------- */

  async countSubscribers(): Promise<number> {
    const { rows } = await this.pool.query(
      `select count(*)::int as c from public.subscribers`
    )
    return rows[0].c
  }

  async countAlertLogs(): Promise<number> {
    const { rows } = await this.pool.query(
      `select count(*)::int as c from public.alert_logs`
    )
    return rows[0].c
  }

  /* ---------------- audit ---------------- */

  async createAuditLog(input: AuditLogInput): Promise<AuditLog> {
    const { rows } = await this.pool.query(
      `insert into public.audit_logs (actor_user_id, action, target_type, target_id, details)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [
        input.actor_user_id,
        input.action,
        input.target_type,
        input.target_id ?? null,
        input.details == null
          ? null
          : JSON.stringify(input.details),
      ]
    )
    return this.toAuditLog(rows[0])
  }

  async listAuditLogs(limit = 50): Promise<AuditLog[]> {
    const { rows } = await this.pool.query(
      `select * from public.audit_logs order by created_at desc limit $1`,
      [limit]
    )
    return rows.map((r) => this.toAuditLog(r))
  }

  private toAuditLog(row: Record<string, unknown>): AuditLog {
    let details: unknown = null
    try {
      details =
        typeof row.details === "string"
          ? JSON.parse(row.details)
          : (row.details ?? null)
    } catch {
      details = row.details ?? null
    }
    return {
      id: String(row.id),
      actor_user_id: row.actor_user_id == null ? null : String(row.actor_user_id),
      action: row.action as AuditLog["action"],
      target_type: row.target_type as AuditLog["target_type"],
      target_id: row.target_id == null ? null : String(row.target_id),
      details,
      created_at:
        row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    }
  }
}