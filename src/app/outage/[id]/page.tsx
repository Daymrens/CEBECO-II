"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import type { Outage } from "@shared/types"

import { StatusBadge, TypeBadge } from "@/components/public/badges"
import { SiteFooter } from "@/components/public/site-footer"
import { SiteHeader } from "@/components/public/site-header"
import { TransparencyBanner } from "@/components/public/transparency-banner"

const OutageMap = dynamic(
  () => import("@/components/public/outage-map").then((mod) => mod.OutageMap),
  { ssr: false },
)

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function OutageDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [outage, setOutage] = useState<Outage | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/outages/${id}`)
      .then(async (res) => {
        if (res.status === 404) {
          if (!cancelled) setNotFound(true)
          return
        }
        if (!res.ok) throw new Error("Failed to load outage")
        const data = await res.json()
        if (!cancelled) setOutage(data.outage)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load outage")
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="flex min-h-svh flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />
      <TransparencyBanner />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link href="/" className="text-sm text-sky-600 hover:underline dark:text-sky-400">
          ← Back to schedule
        </Link>

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {notFound && (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 px-4 py-14 text-center dark:border-zinc-700">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Outage not found
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This outage may have been removed.{" "}
              <Link href="/" className="text-sky-600 underline dark:text-sky-400">
                Browse the schedule
              </Link>
              .
            </p>
          </div>
        )}

        {!error && !notFound && !outage && <p className="mt-6 text-sm text-zinc-400">Loading…</p>}

        {outage && (
          <article className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={outage.type} />
              <StatusBadge status={outage.status} />
              {outage.source === "facebook" && (
                <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Facebook
                </span>
              )}
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {outage.title}
            </h1>

            <dl className="mt-6 space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-925">
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 font-medium text-zinc-400 dark:text-zinc-500">
                  Municipality
                </dt>
                <dd className="text-zinc-900 dark:text-zinc-50">{outage.municipality}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 font-medium text-zinc-400 dark:text-zinc-500">Date</dt>
                <dd className="text-zinc-900 dark:text-zinc-50">{formatDate(outage.date)}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 font-medium text-zinc-400 dark:text-zinc-500">Time</dt>
                <dd className="text-zinc-900 dark:text-zinc-50">
                  {outage.start_time}
                  {outage.end_time ? ` – ${outage.end_time}` : " (end TBD)"}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 font-medium text-zinc-400 dark:text-zinc-500">
                  Affected areas
                </dt>
                <dd className="text-zinc-900 dark:text-zinc-50">{outage.barangays.join(", ")}</dd>
              </div>
              {outage.sitio_notes && (
                <div className="flex gap-3">
                  <dt className="w-28 shrink-0 font-medium text-zinc-400 dark:text-zinc-500">
                    Sitios
                  </dt>
                  <dd className="text-zinc-900 dark:text-zinc-50">{outage.sitio_notes}</dd>
                </div>
              )}
              {outage.reason && (
                <div className="flex gap-3">
                  <dt className="w-28 shrink-0 font-medium text-zinc-400 dark:text-zinc-500">
                    Reason
                  </dt>
                  <dd className="text-zinc-900 dark:text-zinc-50">{outage.reason}</dd>
                </div>
              )}
            </dl>

            {outage.source_url && (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Source:{" "}
                <a
                  href={outage.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-sky-600 underline hover:text-sky-500 dark:text-sky-400"
                >
                  Original Facebook post
                </a>
              </p>
            )}

            {outage.barangays.length > 0 && (
              <OutageMap
                barangays={outage.barangays}
                municipality={outage.municipality}
              />
            )}
          </article>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
