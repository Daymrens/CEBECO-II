import Link from "next/link"

import type { Outage } from "@shared/types"

import { StatusBadge, TypeBadge } from "./badges"

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function OutageCard({ outage }: { outage: Outage }) {
  return (
    <Link
      href={`/outage/${outage.id}`}
      className="block rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-sky-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-925 dark:hover:border-sky-800"
    >
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge type={outage.type} />
        <StatusBadge status={outage.status} />
        {outage.source === "facebook" && (
          <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Facebook
          </span>
        )}
      </div>

      <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {outage.title}
      </h3>

      <dl className="mt-3 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-zinc-400 dark:text-zinc-500">Date</dt>
          <dd>{formatDate(outage.date)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-zinc-400 dark:text-zinc-500">Time</dt>
          <dd>
            {outage.start_time}
            {outage.end_time ? ` – ${outage.end_time}` : " (end TBD)"}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-zinc-400 dark:text-zinc-500">Areas</dt>
          <dd>{outage.barangays.join(", ")}</dd>
        </div>
      </dl>

      {outage.reason && (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          <span className="text-zinc-400 dark:text-zinc-500">Reason: </span>
          {outage.reason}
        </p>
      )}

      <p className="mt-4 text-sm font-medium text-sky-600 dark:text-sky-400">View details →</p>
    </Link>
  )
}
