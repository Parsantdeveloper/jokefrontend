import { RedirectsView } from '@/components/redirects-view'
import { AdminShell } from '@/components/admin-shell'

export default function AdminRedirectsPage() {
  return (
    <AdminShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Manage redirects</h1>
          <p className="max-w-2xl text-muted-foreground">Control how your application moves visitors between routes.</p>
        </div>
        <RedirectsView />
      </div>
    </AdminShell>
  )
}
