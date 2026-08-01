interface CreditsBadgeProps {
  creditsRemaining: number | null;
}

export function CreditsBadge({ creditsRemaining }: CreditsBadgeProps) {
  if (creditsRemaining === null) return null;

  return (
    <div className="fixed bottom-6 right-4 z-[9999999] pointer-events-auto">
      <div className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md">
        {creditsRemaining} Credits Remaining
      </div>
    </div>
  );
}
