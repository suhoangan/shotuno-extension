import { useEffect, useState } from 'react'
import { bindAuthStorageListener, useAuthStore } from '../store/authStore'
import { AuthModal } from './AuthModal'
import { Dashboard } from './Dashboard'
import { AdminDashboard } from './AdminDashboard'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { UserAvatarMenu } from '../components/UserAvatarMenu'
import { API_BASE } from '../lib/api'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const { isAuthenticated, user, logout, hydrateFromChrome } = useAuthStore()
  const [currentView, setCurrentView] = useState<'dashboard' | 'admin'>('dashboard')

  useEffect(() => {
    hydrateFromChrome()
    return bindAuthStorageListener()
  }, [hydrateFromChrome])

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' })
    } catch {
      /* ignore */
    }
    logout()
  }

  return (
    <ErrorBoundary>
      <Toaster position="top-center" theme="light" />
      <TooltipProvider>
        {!isAuthenticated && <AuthModal />}
        {isAuthenticated && (
          <SidebarProvider>
            <AppSidebar currentView={currentView} setCurrentView={setCurrentView} />
            <main className="w-full flex-1 overflow-auto bg-muted/20">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentView === 'admin' ? 'Admin Panel' : 'Dashboard'}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <div className="ml-auto">
                  <UserAvatarMenu
                    name={user?.name ?? null}
                    email={user?.email ?? null}
                    onLogout={handleLogout}
                  />
                </div>
              </header>
              <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
                 {currentView === 'dashboard' ? <Dashboard /> : <AdminDashboard />}
              </div>
            </main>
          </SidebarProvider>
        )}
      </TooltipProvider>
    </ErrorBoundary>
  )
}

export default App
