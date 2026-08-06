import { JokesView } from '@/components/jokes-view'
import { AdminShell } from '@/components/admin-shell'

export default function AdminJokesPage() {
  return (
    <AdminShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Manage jokes</h1>
          <p className="max-w-2xl text-muted-foreground">Create, review, and organize the jokes powering your experience.</p>
        </div>
        <JokesView />
      </div>
    </AdminShell>
  )
}
