import Link from "next/link"
import { redirect } from "next/navigation"

import { getCurrentAdmin } from "@/lib/auth/require-admin"

import { LogoutButton } from "./logout-button"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentAdmin()
  if (!user) redirect("/admin/login")

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/outages", label: "Outages" },
    { href: "/admin/audit-logs", label: "Audit Logs" },
  ]

  return (
    <div className="min-h-svh bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-925">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              CEBECO II Admin
            </Link>
            <nav className="flex items-center gap-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-500 sm:inline dark:text-zinc-400">
              {user.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}