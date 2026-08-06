'use client'

import { usePathname, useRouter } from 'next/navigation'
import { DashboardSidebar, type DashboardSection } from '@/components/dashboard-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const section: DashboardSection = pathname.startsWith('/admin/jokes') ? 'jokes' : 'redirects'

  return (
    <SidebarProvider defaultOpen>
      <DashboardSidebar section={section} onSectionChange={(next) => router.push(`/admin/${next}`)} />
      <SidebarInset>
        <main className="min-h-svh overflow-auto bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
