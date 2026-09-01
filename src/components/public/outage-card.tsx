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
  scheduled: "border-l-blue-500",
  ongoing: "border-l-amber-500",
  restored: "border-l-emerald-500",
  cancelled: "border-l-zinc-400",
}

export function OutageCard({ outage }: { outage: Outage }) {
  const border = statusBorder[outage.status] ?? statusBorder.scheduled

  return (
    <Link
      href={`/outage/${outage.id}`}
      className={`group block rounded-xl border border-gray-200 border-l-[4px] bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md ${border}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge type={outage.type} />
        <StatusBadge status={outage.status} />
        {outage.source === "facebook" && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            Facebook
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-bold text-gray-900">
        {outage.title}
      </h3>

      <dl className="mt-3 space-y-1 text-sm text-gray-700">
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-medium text-gray-500">Date</dt>
          <dd>{formatDate(outage.date)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-medium text-gray-500">Time</dt>
          <dd>
            {outage.start_time}
            {outage.end_time ? ` – ${outage.end_time}` : " (end TBD)"}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-medium text-gray-500">Areas</dt>
          <dd>{outage.barangays.join(", ")}</dd>
        </div>
      </dl>

      {outage.reason && (
        <p className="mt-3 text-sm text-gray-700">
          <span className="font-medium text-gray-500">Reason: </span>
          {outage.reason}
        </p>
      )}

      <p className="mt-4 text-sm font-semibold text-blue-600 transition group-hover:text-blue-700">
        View details →
      </p>
    </Link>
  )
}
