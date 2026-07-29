import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthStore } from "../store/authStore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { userInitials } from "../lib/userInitials"

export function AppSidebar({ currentView, setCurrentView }: { currentView: string, setCurrentView: (v: any) => void }) {
  const { user } = useAuthStore()
  
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-bold">S</span>
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold text-sm">Shotuno</span>
            <span className="text-xs text-muted-foreground">Account</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')}>
                  <span className="text-lg">📊</span>
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user?.role === 'ADMIN' && (
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={currentView === 'admin'} onClick={() => setCurrentView('admin')}>
                    <span className="text-lg">🛡️</span>
                    <span>Admin Panel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span className="text-lg">📁</span>
                  <span>Integrations</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span className="text-lg">🎨</span>
                  <span>Canvas Editor</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span className="text-lg">⚙️</span>
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {userInitials(user?.name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.name || 'User'}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
