import type { OutageStatus, OutageType } from "@shared/types"

const statusClasses: Record<OutageStatus, string> = {
  scheduled: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  ongoing: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  restored: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
}

const typeClasses: Record<OutageType, string> = {
  scheduled: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  emergency: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  brownout: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
}

const labels: Record<string, string> = {
  scheduled: "Scheduled",
  ongoing: "Ongoing",
  restored: "Restored",
  cancelled: "Cancelled",
  emergency: "Emergency",
  brownout: "Brownout",
}

function StatusDot({ status }: { status: OutageStatus }) {
  if (status !== "ongoing") return null
  return (
    <span className="relative mr-0.5 inline-block h-1.5 w-1.5 flex-shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  )
}

export function StatusBadge({ status }: { status: OutageStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      <StatusDot status={status} />
      {labels[status] ?? status}
    </span>
  )
}

export function TypeBadge({ type }: { type: OutageType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${typeClasses[type]}`}
    >
      {labels[type] ?? type}
    </span>
  )
}
