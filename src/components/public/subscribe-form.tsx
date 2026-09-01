"use client"

import { FormEvent, useState } from "react"

import { SOGOD_BARANGAYS } from "@shared/index"

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"

export function SubscribeForm({ barangay }: { barangay?: string }) {
  const [email, setEmail] = useState("")
  const [selected, setSelected] = useState(barangay ?? "")
  const [sitio, setSitio] = useState("")
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setState("pending")
    setMessage(null)
    try {
      // Phase 4 (email alerts) will replace this endpoint. Today it is a stub
      // that replies "coming soon" so the subscribe flow is wired end-to-end
      // without sending real email.
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, barangay: selected, sitio: sitio || null }),
      })
      const data = await res.json().catch(() => null)
      setMessage(data?.message ?? "Something went wrong.")
      setState(data?.ok ? "done" : "error")
    } catch {
      setState("error")
      setMessage("Network error. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="subscribe-email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email address
        </label>
        <input
          id="subscribe-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="subscribe-barangay" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Barangay
        </label>
        <select
          id="subscribe-barangay"
          required
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className={inputClass}
        >
          <option value="">Select a barangay…</option>
          {SOGOD_BARANGAYS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="subscribe-sitio" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Sitio <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          id="subscribe-sitio"
          value={sitio}
          onChange={(e) => setSitio(e.target.value)}
          placeholder="e.g. Sitio Riverside"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={state === "pending"}
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "pending" ? "Subscribing…" : "Subscribe to alerts"}
      </button>

      {message && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            state === "done"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  )
}
