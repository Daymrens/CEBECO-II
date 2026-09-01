import { SiteFooter } from "@/components/public/site-footer"
import { SiteHeader } from "@/components/public/site-header"
import { TransparencyBanner } from "@/components/public/transparency-banner"

export default function ContactPage() {
  return (
    <div className="flex min-h-svh flex-col bg-gray-50">
      <SiteHeader />
      <TransparencyBanner />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Contact
        </h1>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Report an outage or concern — CEBECO II
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            For official outage reports, billing, or emergencies, contact CEBECO II directly.
            Outages posted on this portal come from CEBECO II&apos;s public announcements and
            manual entries, so always confirm with official channels.
          </p>

          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-medium text-gray-500">Hotline</dt>
              <dd className="text-gray-900">(032) 434-8555</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-medium text-gray-500">
                Office
              </dt>
              <dd className="text-gray-900">
                CEBECO II Main Office, Malingin, 6010 Bogo City, Cebu
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-medium text-gray-500">Website</dt>
              <dd>
                <a
                  href="https://cebeco2.com.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  cebeco2.com.ph
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-medium text-gray-500">
                Facebook
              </dt>
              <dd>
                <a
                  href="https://www.facebook.com/cebeco2.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  CEBECO II on Facebook
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            About this project
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            This is an unofficial, community-built portal for browsing power outages in the
            CEBECO II area, primarily Sogod, Cebu. We curate outage information from public
            sources and manual reports to help residents plan around scheduled maintenance and
            brownouts.
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Found an error or want to report an outage? Please use the{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-700"
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
