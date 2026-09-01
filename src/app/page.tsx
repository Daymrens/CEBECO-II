import { MUNICIPALITIES, SOGOD_BARANGAYS } from "@shared/index"

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col justify-center gap-8 py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            CEBECO II Outage Portal
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Phase 1 scaffold. Shared constants loaded from{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-sm dark:bg-white/[.08]">
              shared/
            </code>
            .
          </p>
        </div>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Municipalities ({MUNICIPALITIES.length})
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-1 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-3">
            {MUNICIPALITIES.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Sogod Barangays ({SOGOD_BARANGAYS.length})
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-1 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-3">
            {SOGOD_BARANGAYS.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}