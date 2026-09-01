import { JsonFileStore } from "./json-store"
import { PostgresStore } from "./postgres-store"
import type { DBAdapter } from "./types"

let cachedAdapter: DBAdapter | null = null

/**
 * Returns the active DB adapter.
 *
 * DEFAULT: JSON-file store (src/lib/db/json-store.ts) — runs with zero
 * external services, persists to `data/db.json`. If `DATABASE_URL` is set,
 * the Postgres adapter (src/lib/db/postgres-store.ts) is used instead; the
 * schema must exist (supabase/schema.sql).
 */
export function getDb(): DBAdapter {
  if (cachedAdapter) return cachedAdapter

  const databaseUrl = process.env.DATABASE_URL
  cachedAdapter =
    databaseUrl && databaseUrl.length > 0
      ? new PostgresStore(databaseUrl)
      : new JsonFileStore()

  return cachedAdapter
}

// Test/script hook: reset the cached adapter (mainly used by seed scripts).
export function resetDb(): void {
  cachedAdapter = null
}