import { SiteFooter } from "@/components/public/site-footer"
import { SiteHeader } from "@/components/public/site-header"
import { TransparencyBanner } from "@/components/public/transparency-banner"

export default function ContactPage() {
  return (
    <div className="flex min-h-svh flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />
      <TransparencyBanner />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Contact
        </h1>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-925">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Report an outage or concern — CEBECO II
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            For official outage reports, billing, or emergencies, contact CEBECO II directly.
            Outages posted on this portal come from CEBECO II&apos;s public announcements and
            manual entries, so always confirm with official channels.
          </p>

          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-medium text-zinc-400 dark:text-zinc-500">Hotline</dt>
              <dd className="text-zinc-900 dark:text-zinc-50">(032) 434-8555</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-medium text-zinc-400 dark:text-zinc-500">
                Office
              </dt>
              <dd className="text-zinc-900 dark:text-zinc-50">
                CEBECO II Main Office, Malingin, 6010 Bogo City, Cebu
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-medium text-zinc-400 dark:text-zinc-500">Website</dt>
              <dd>
                <a
                  href="https://cebeco2.com.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 underline hover:text-sky-500 dark:text-sky-400"
                >
                  cebeco2.com.ph
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-medium text-zinc-400 dark:text-zinc-500">
                Facebook
              </dt>
              <dd>
                <a
                  href="https://www.facebook.com/cebeco2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 underline hover:text-sky-500 dark:text-sky-400"
                >
                  CEBECO II on Facebook
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-925">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            About this project
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            This is an unofficial, community-built portal for browsing power outages in the
            CEBECO II area, primarily Sogod, Cebu. We curate outage information from public
            sources and manual reports to help residents plan around scheduled maintenance and
            brownouts.
          </p>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Found an error or want to report an outage? Please use the{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 underline hover:text-sky-500 dark:text-sky-400"
            >
              project repository
            </a>{" "}
            issues page, or file a report through the official CEBECO II channels above.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
