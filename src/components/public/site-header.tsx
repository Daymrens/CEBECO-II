import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-925">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-600 text-xs font-bold text-white shadow-sm shadow-sky-600/30">
            COP
          </span>
          <span>CEBECO II Outage Portal</span>
        </Link>
        <nav className="flex items-center gap-4" aria-label="Primary">
          <Link
            href="/"
            className="text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Schedule
          </Link>
          <Link
            href="/contact"
            className="text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Contact
          </Link>
          <Link
            href="/admin"
            className="rounded-md border border-zinc-300 px-2.5 py-1 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Admin
          </Link>
        </nav>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-500" />
    </header>
  )
}
