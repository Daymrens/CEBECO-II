import { OutageForm } from "@/components/admin/outage-form"

export default function NewOutagePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New outage
      </h1>
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-925">
        <OutageForm />
      </div>
    </div>
  )
}