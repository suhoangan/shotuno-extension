import { Dashboard } from './Dashboard'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import { BuyMeCoffeeLink } from '../components/BuyMeCoffeeLink'

function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-center" theme="light" />
      <TooltipProvider>
        <main className="min-h-screen w-full overflow-auto bg-muted/20">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
            <h1 className="text-sm font-semibold text-foreground">Shotuno</h1>
            <BuyMeCoffeeLink />
          </header>
          <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
            <Dashboard />
          </div>
        </main>
      </TooltipProvider>
    </ErrorBoundary>
  )
}

export default App
