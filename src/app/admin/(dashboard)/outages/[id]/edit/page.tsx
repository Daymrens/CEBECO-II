import Link from "next/link"
import { notFound } from "next/navigation"

import { OutageForm } from "@/components/admin/outage-form"
import { getDb } from "@/lib/db"

export default async function EditOutagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const outage = await getDb().getOutageById(id)
  if (!outage) notFound()

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/outages"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to outages
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Edit outage
      </h1>
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-925">
        <OutageForm initial={outage} />
      </div>
    </div>
  )
}