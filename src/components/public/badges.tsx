import type { OutageStatus, OutageType } from "@shared/types"

const statusClasses: Record<OutageStatus, string> = {
  scheduled: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  ongoing: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  restored: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
}

const typeClasses: Record<OutageType, string> = {
  scheduled: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  emergency: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  brownout: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
}

const labels: Record<string, string> = {
  scheduled: "Scheduled",
  ongoing: "Ongoing",
  restored: "Restored",
  cancelled: "Cancelled",
  emergency: "Emergency",
  brownout: "Brownout",
}

export function StatusBadge({ status }: { status: OutageStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[status]}`}
    >
      {labels[status] ?? status}
    </span>
  )
}

export function TypeBadge({ type }: { type: OutageType }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${typeClasses[type]}`}
    >
      {labels[type] ?? type}
    </span>
  )
}
