"use client"

import { useEffect, useState } from "react"

import type { AuditLog } from "@shared/types"

function actionColor(action: AuditLog["action"]): string {
  switch (action) {
    case "create":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
    case "update":
      return "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
    case "cancel":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
    case "delete":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
  }
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/audit-logs")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load audit logs")
        const data = await res.json()
        setLogs(data.logs)
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Audit logs
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Every admin mutation (create / update / cancel / delete) is recorded here.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {!logs && !error && <p className="mt-6 text-sm text-zinc-400">Loading…</p>}

      {logs && logs.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No audit entries yet.
        </p>
      )}

      {logs && logs.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {logs.map((log) => (
            <li
              key={log.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-925"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {log.actor_user_id ? "admin" : "system"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionColor(log.action)}`}
                >
                  {log.action}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-300">
                  {log.target_type}{" "}
                  <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
                    {log.target_id ?? "—"}
                  </code>
                </span>
                <span className="ml-auto text-xs text-zinc-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              {log.details != null && (
                <button
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  className="mt-2 text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  {expanded === log.id ? "Hide details" : "Show details"}
                </button>
              )}
              {expanded === log.id && log.details != null && (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}