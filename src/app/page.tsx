"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { MUNICIPALITIES, SOGOD_BARANGAYS } from "@shared/index"
import type { Outage } from "@shared/types"

import { OutageCard } from "@/components/public/outage-card"
import { SiteFooter } from "@/components/public/site-footer"
import { SiteHeader } from "@/components/public/site-header"
import { SubscribeForm } from "@/components/public/subscribe-form"
import { TransparencyBanner } from "@/components/public/transparency-banner"

type Range = "day" | "week" | "all"

const RANGES: { value: Range; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "all", label: "All Upcoming" },
]

const selectClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"

export default function Home() {
  const [municipality, setMunicipality] = useState("Sogod")
  const [range, setRange] = useState<Range>("week")
  const [barangay, setBarangay] = useState("")
  const [search, setSearch] = useState("")

  const [outages, setOutages] = useState<Outage[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    const params = new URLSearchParams({ municipality, range })
    if (barangay) params.set("barangay", barangay)
    fetch(`/api/outages?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load outages")
        const data = await res.json()
        setOutages(data.outages)
        setError(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load outages")
        setOutages(null)
      })
  }, [municipality, range, barangay])

  useEffect(() => {
    load()
  }, [load])

  function refresh(query: { municipality?: string; range?: Range; barangay?: string }) {
    setOutages(null)
    setError(null)
    if (query.municipality !== undefined) setMunicipality(query.municipality)
    if (query.range !== undefined) setRange(query.range)
    if (query.barangay !== undefined) setBarangay(query.barangay)
  }

  function handleMunicipalityChange(value: string) {
    refresh({ municipality: value, barangay: "" })
  }

  function handleRangeChange(value: Range) {
    refresh({ range: value })
  }

  function handleBarangayChip(value: string) {
    refresh({ barangay: barangay === value ? "" : value })
  }

  const loading = outages === null && error === null

  const filtered = useMemo(() => {
    if (!outages) return null
    const q = search.trim().toLowerCase()
    if (!q) return outages
    return outages.filter((o) => {
      const inBarangay = o.barangays.some((b) => b.toLowerCase().includes(q))
      const inSitio = o.sitio_notes ? o.sitio_notes.toLowerCase().includes(q) : false
      return inBarangay || inSitio
    })
  }, [outages, search])

  return (
    <div className="flex min-h-svh flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />
      <TransparencyBanner />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Outage Schedule
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Browse scheduled and ongoing power outages across the CEBECO II area.
        </p>

        {/* Controls */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Municipality
              <select
                value={municipality}
                onChange={(e) => handleMunicipalityChange(e.target.value)}
                className={selectClass}
              >
                {MUNICIPALITIES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <div
              role="tablist"
              aria-label="Time range"
              className="inline-flex rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-925"
            >
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  role="tab"
                  aria-selected={range === r.value}
                  onClick={() => handleRangeChange(r.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    range === r.value
                      ? "bg-sky-600 text-white"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="sr-only" htmlFor="outage-search">
              Search by barangay or sitio
            </label>
            <input
              id="outage-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search barangay or sitio in ${municipality}…`}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {municipality === "Sogod" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Barangay:
              </span>
              {["", ...SOGOD_BARANGAYS].map((b) => {
                const active = barangay === b
                return (
                  <button
                    key={b || "__all"}
                    onClick={() => handleBarangayChip(b)}
                    aria-pressed={active}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-sky-600 text-white"
                        : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-925 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {b || "All"}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Status */}
        {error && (
          <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        {loading && <p className="mt-6 text-sm text-zinc-400">Loading…</p>}

        {!loading && !error && filtered && filtered.length === 0 && (
          <p className="mt-6 rounded-xl border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No outages match the current filters.
            {(search || barangay) && (
              <span>
                {" "}
                Try clearing your search or barangay filter.
              </span>
            )}
          </p>
        )}

        {/* List */}
        {!loading && !error && filtered && filtered.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((o) => (
              <OutageCard key={o.id} outage={o} />
            ))}
          </div>
        )}

        {/* Subscribe */}
        <section className="mt-12 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-925">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Get notified of outages in your area
          </h2>
          <p className="mt-1 mb-5 text-sm text-zinc-600 dark:text-zinc-400">
            Enter your email and we&apos;ll alert you when an outage affects your barangay.
          </p>
          <SubscribeForm barangay={barangay || undefined} />
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
