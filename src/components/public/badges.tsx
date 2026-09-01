import type { OutageStatus, OutageType } from "@shared/types"

const statusClasses: Record<OutageStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  ongoing: "bg-amber-100 text-amber-800",
  restored: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-zinc-200 text-zinc-600",
}

const typeClasses: Record<OutageType, string> = {
  scheduled: "bg-indigo-100 text-indigo-800",
  emergency: "bg-red-100 text-red-800",
  brownout: "bg-purple-100 text-purple-800",
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
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      <StatusDot status={status} />
      {labels[status] ?? status}
    </span>
  )
}

export function TypeBadge({ type }: { type: OutageType }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${typeClasses[type]}`}
    >
      {labels[type] ?? type}
    </span>
  )
}
