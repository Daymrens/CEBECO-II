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

const statusBorder: Record<string, string> = {
  scheduled: "border-l-sky-500 dark:border-l-sky-400",
  ongoing: "border-l-amber-500 dark:border-l-amber-400",
  restored: "border-l-emerald-500 dark:border-l-emerald-400",
  cancelled: "border-l-zinc-400 dark:border-l-zinc-500",
}

export function OutageCard({ outage }: { outage: Outage }) {
  const border = statusBorder[outage.status] ?? statusBorder.scheduled

  return (
    <Link
      href={`/outage/${outage.id}`}
      className={`group block rounded-2xl border border-zinc-200 border-l-[5px] bg-white p-5 shadow-md transition hover:shadow-md dark:border-zinc-800 dark:border-l-zinc-600 dark:bg-zinc-925 ${border}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge type={outage.type} />
        <StatusBadge status={outage.status} />
        {outage.source === "facebook" && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Facebook
          </span>
        )}
      </div>

      <h3 className="mt-3 text-base font-bold text-black dark:text-white">
        {outage.title}
      </h3>

      <dl className="mt-3 space-y-1 text-sm text-zinc-800 dark:text-zinc-200">
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-medium text-zinc-600 dark:text-zinc-300">Date</dt>
          <dd>{formatDate(outage.date)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-medium text-zinc-600 dark:text-zinc-300">Time</dt>
          <dd>
            {outage.start_time}
            {outage.end_time ? ` – ${outage.end_time}` : " (end TBD)"}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-medium text-zinc-600 dark:text-zinc-300">Areas</dt>
          <dd>{outage.barangays.join(", ")}</dd>
        </div>
      </dl>

      {outage.reason && (
        <p className="mt-3 text-sm text-zinc-800 dark:text-zinc-200">
          <span className="font-medium text-zinc-600 dark:text-zinc-300">Reason: </span>
          {outage.reason}
        </p>
      )}

      <p className="mt-4 text-sm font-semibold text-sky-600 transition group-hover:text-sky-700 dark:text-sky-400 dark:group-hover:text-sky-300">
        View details →
      </p>
    </Link>
  )
}
