"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import type { AdminStats } from "@shared/types"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load stats")
        const data = await res.json()
        setStats(data.stats)
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <Link
          href="/admin/outages/new"
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
        >
          New outage
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {!error && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total outages" value={stats?.total_outages ?? "—"} />
          <StatCard label="Upcoming" value={stats?.upcoming_count ?? "—"} accent="sky" />
          <StatCard label="Subscribers" value={stats?.subscriber_count ?? "—"} />
          <StatCard label="Alerts sent" value={stats?.alerts_sent ?? "—"} />
        </div>
      )}

      {stats && (
        <p className="mt-6 text-xs text-zinc-400">
          Live counts from /api/admin/stats (storage: JSON-file store).
        </p>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: "sky"
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-925">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={`mt-2 text-3xl font-semibold tracking-tight ${
          accent === "sky" ? "text-sky-600 dark:text-sky-400" : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {value}
      </p>
    </div>
  )
}