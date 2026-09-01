"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import type { Outage } from "@shared/types"

function statusColor(status: Outage["status"]): string {
  switch (status) {
    case "scheduled":
      return "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
    case "ongoing":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
    case "restored":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
    case "cancelled":
      return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
  }
}

export default function AdminOutagesListPage() {
  const [outages, setOutages] = useState<Outage[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch("/api/outages")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load outages")
        const data = await res.json()
        setOutages(data.outages)
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(load, [load])

  async function cancelOutage(id: string) {
    if (!window.confirm("Cancel this outage? This records an audit log entry.")) return
    setCancelling(id)
    try {
      const res = await fetch(`/api/outages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? "Failed to cancel outage")
        return
      }
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel outage")
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Outages
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

      {!outages && !error && <p className="mt-6 text-sm text-zinc-400">Loading…</p>}

      {outages && outages.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No outages yet.{" "}
          <Link href="/admin/outages/new" className="text-sky-600 underline dark:text-sky-400">
            Create the first one
          </Link>
          .
        </p>
      )}

      {outages && outages.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-925">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Municipality</th>
                <th className="px-4 py-3">Barangays</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {outages.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {o.title}
                    {o.reason && (
                      <span className="ml-2 text-xs font-normal text-zinc-400">({o.reason})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{o.municipality}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {o.barangays.join(", ")}
                  </td>
                  <td className="px-4 py-3 capitalize text-zinc-600 dark:text-zinc-300">{o.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(o.status)}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{o.date}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {o.start_time}
                    {o.end_time ? `–${o.end_time}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/outages/${o.id}/edit`}
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Edit
                      </Link>
                      {o.status !== "cancelled" && (
                        <button
                          onClick={() => cancelOutage(o.id)}
                          disabled={cancelling === o.id}
                          className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}