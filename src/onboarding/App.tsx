import { OnboardingHero } from './components/OnboardingHero';
import { OnboardingSteps } from './components/OnboardingSteps';
import { OnboardingFeatureCards } from './components/OnboardingFeatureCards';
import { OnboardingShortcuts } from './components/OnboardingShortcuts';

export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-6 sm:px-10 space-y-16 max-w-6xl mx-auto">
      {/* Hero Header */}
      <OnboardingHero />

      {/* Getting Started Steps */}
      <OnboardingSteps />

      {/* Core Tools & Features Grid */}
      <OnboardingFeatureCards />

      {/* Keyboard Shortcuts */}
      <OnboardingShortcuts />

      {/* Footer copyright */}
      <footer className="text-center text-xs text-muted-foreground border-t border-border pt-8">
        © 2026 Shotuno Extension. Local-first screenshot & annotation tools.
      </footer>
    </main>
  );
}
