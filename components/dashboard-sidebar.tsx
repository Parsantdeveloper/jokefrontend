'use client'

import { Laugh, Link2, LogOut, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
export type DashboardSection = 'jokes' | 'redirects'

const links = [
  { id: 'jokes' as const, label: 'Jokes', icon: Laugh },
  { id: 'redirects' as const, label: 'Redirects', icon: Link2 },
]

export function DashboardSidebar({ section, onSectionChange }: { section: DashboardSection; onSectionChange?: (section: DashboardSection) => void }) {
  const router = useRouter()


  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="h-16 justify-center px-3">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ShieldCheck data-icon="inline-start" />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-tight">Jestboard</span>
            <span className="truncate text-xs text-sidebar-foreground/60">Content control center</span>
          </div>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.id}>
                  <SidebarMenuButton isActive={section === link.id} tooltip={link.label} onClick={() => onSectionChange ? onSectionChange(link.id) : router.push(`/admin/${link.id}`)}>
                    <link.icon data-icon="inline-start" />
                    <span>{link.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter className="p-3 group-data-[collapsible=icon]:px-2">
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 text-sidebar-foreground/70 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2" aria-label="Log out">
          <LogOut data-icon="inline-start" />
          <span className="group-data-[collapsible=icon]:hidden">Log out</span>
        </Button>
      </SidebarFooter> */}
    </Sidebar>
  )
}
