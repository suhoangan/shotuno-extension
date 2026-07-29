/**
 * Sentry error reporting only. No-ops when VITE_SENTRY_DSN is unset.
 */

type Props = Record<string, string | number | boolean | undefined>;

let sentryReady = false;

function env(key: string): string | undefined {
  try {
    const v = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.[key];
    return typeof v === 'string' && v.trim() ? v.trim() : undefined;
  } catch {
    return undefined;
  }
}

/** Init Sentry once. Safe to call multiple times. */
export async function initTelemetry(): Promise<void> {
  const sentryDsn = env('VITE_SENTRY_DSN');
  if (!sentryDsn || sentryReady) return;

  try {
    const Sentry = await import('@sentry/browser');
    Sentry.init({
      dsn: sentryDsn,
      environment: env('VITE_SENTRY_ENVIRONMENT') || 'production',
      tracesSampleRate: 0.1,
      beforeSend(event) {
        if (event.request?.data && typeof event.request.data === 'string') {
          if (event.request.data.startsWith('data:')) {
            event.request.data = '[redacted data-url]';
          }
        }
        return event;
      },
    });
    sentryReady = true;
  } catch (e) {
    console.warn('Shotuno: Sentry init failed', e);
  }
}

export function captureException(error: unknown, context?: Props): void {
  void (async () => {
    try {
      if (!sentryReady) await initTelemetry();
      if (!sentryReady) return;
      const Sentry = await import('@sentry/browser');
      Sentry.captureException(error, { extra: context });
    } catch {
      /* ignore */
    }
  })();
}
