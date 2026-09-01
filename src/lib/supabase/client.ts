import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import type { Outage } from "@shared/types"

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          password_hash: string
          is_admin: boolean
          created_at: string
        }
      }
      subscribers: {
        Row: {
          id: string
          email: string
          barangay: string
          sitio: string | null
          verified: boolean
          created_at: string
        }
      }
      outages: {
        Row: Outage
      }
      alert_logs: {
        Row: {
          id: string
          outage_id: string
          subscriber_id: string
          sent_at: string
          status: "sent" | "failed"
        }
      }
      barangays: {
        Row: {
          municipality: string
          barangay: string
        }
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function createBrowserClient(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

function createServerClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    )
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export const supabaseBrowser = () => createBrowserClient()

export const supabaseServer = () => createServerClient()

export function hasSupabaseCredentials(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}