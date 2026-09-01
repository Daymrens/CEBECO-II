"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import {
  MUNICIPALITIES,
  OUTAGE_STATUSES,
  OUTAGE_TYPES,
  SOGOD_BARANGAYS,
} from "@shared/index"
import type { Outage, OutageStatus, OutageType } from "@shared/types"

export interface OutageFormValues {
  title: string
  municipality: string
  barangays: string[]
  type: OutageType
  status: OutageStatus
  date: string
  start_time: string
  end_time: string
  reason: string
}

interface Props {
  initial?: Outage | null
}

const EMPTY: OutageFormValues = {
  title: "",
  municipality: "Sogod",
  barangays: [],
  type: "scheduled",
  status: "scheduled",
  date: "",
  start_time: "08:00",
  end_time: "",
  reason: "",
}

export function OutageForm({ initial }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<OutageFormValues>(() =>
    initial
      ? {
          title: initial.title,
          municipality: initial.municipality,
          barangays: initial.barangays,
          type: initial.type,
          status: initial.status,
          date: initial.date,
          start_time: initial.start_time,
          end_time: initial.end_time ?? "",
          reason: initial.reason ?? "",
        }
      : EMPTY
  )
  const [customBarangays, setCustomBarangays] = useState(() =>
    initial && initial.municipality !== "Sogod" ? initial.barangays.join(", ") : ""
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function set<V extends keyof OutageFormValues>(key: V, value: OutageFormValues[V]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function toggleBarangay(brgy: string) {
    setValues((v) => ({
      ...v,
      barangays: v.barangays.includes(brgy)
        ? v.barangays.filter((b) => b !== brgy)
        : [...v.barangays, brgy],
    }))
  }

  function handleMunicipalityChange(municipality: string) {
    setValues((v) => ({
      ...v,
      municipality,
      barangays: municipality === "Sogod" ? [] : v.barangays,
    }))
    if (municipality !== "Sogod") setCustomBarangays(values.barangays.join(", "))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const barangays =
      values.municipality === "Sogod"
        ? values.barangays
        : customBarangays
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean)

    const body = {
      ...values,
      barangays,
      end_time: values.end_time || null,
      reason: values.reason || null,
    }

    const url = initial ? `/api/outages/${initial.id}` : "/api/outages"
    try {
      const res = await fetch(url, {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? "Failed to save outage")
        return
      }
      router.push("/admin/outages")
      router.refresh()
    } catch {
      setError("Network error. Is the server running?")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
        </label>
        <input
          required
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Scheduled maintenance in Poblacion"
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Municipality
          </label>
          <select
            value={values.municipality}
            onChange={(e) => handleMunicipalityChange(e.target.value)}
            className={inputClass}
          >
            {MUNICIPALITIES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Type
          </label>
          <select
            value={values.type}
            onChange={(e) => set("type", e.target.value as OutageType)}
            className={inputClass}
          >
            {OUTAGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "brownout" ? "Brownout" : t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {values.municipality === "Sogod"
            ? `Barangays (${values.barangays.length} selected)`
            : "Barangays (comma-separated)"}
        </label>
        {values.municipality === "Sogod" ? (
          <div className="grid max-h-56 grid-cols-2 gap-1 overflow-y-auto rounded-lg border border-zinc-200 p-3 sm:grid-cols-3 dark:border-zinc-800">
            {SOGOD_BARANGAYS.map((b) => {
              const checked = values.barangays.includes(b)
              return (
                <label
                  key={b}
                  className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm ${
                    checked
                      ? "bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
                      : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBarangay(b)}
                    className="accent-sky-600"
                  />
                  {b}
                </label>
              )
            })}
          </div>
        ) : (
          <input
            value={customBarangays}
            required
            onChange={(e) => setCustomBarangays(e.target.value)}
            placeholder="e.g. Barangay A, Barangay B"
            className={inputClass}
          />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Status
        </label>
        <select
          value={values.status}
          onChange={(e) => set("status", e.target.value as OutageStatus)}
          className={inputClass}
        >
          {OUTAGE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Date
          </label>
          <input
            type="date"
            required
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Start time
          </label>
          <input
            type="time"
            required
            value={values.start_time}
            onChange={(e) => set("start_time", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            End time (optional)
          </label>
          <input
            type="time"
            value={values.end_time}
            onChange={(e) => set("end_time", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Reason
        </label>
        <textarea
          rows={3}
          value={values.reason}
          onChange={(e) => set("reason", e.target.value)}
          placeholder="e.g. Line maintenance / transformer replacement"
          className={inputClass}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving…" : initial ? "Save changes" : "Create outage"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/outages")}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}