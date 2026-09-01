import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold text-gray-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-sm shadow-blue-600/30">
            COP
          </span>
          <span>CEBECO II Outage Portal</span>
        </Link>
        <nav className="flex items-center gap-4" aria-label="Primary">
          <Link
            href="/"
            className="text-sm text-gray-600 transition hover:text-gray-900"
          >
            Schedule
          </Link>
          <Link
            href="/contact"
            className="text-sm text-gray-600 transition hover:text-gray-900"
          >
            Contact
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            Admin
          </Link>
        </nav>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500" />
    </header>
  )
}
