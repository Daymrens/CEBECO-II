import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-925">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          This is an unofficial, community-built project and is not operated by, endorsed by, or
          affiliated with CEBECO II (Cebu 2 Electric Cooperative). Outage information is curated
          manually and may be incomplete, delayed, or inaccurate. Always confirm with official
          CEBECO II channels.
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label="Footer">
          <Link href="/" className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Schedule
          </Link>
          <Link href="/contact" className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Contact
          </Link>
          <Link href="/admin" className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Admin login
          </Link>
        </nav>
      </div>
    </footer>
  )
}
