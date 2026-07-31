/**
 * Telemetry stubs — Shotuno does not send crash reports or analytics.
 * Kept so existing init / ErrorBoundary call sites stay stable.
 */

type Props = Record<string, string | number | boolean | undefined>;

export async function initTelemetry(): Promise<void> {
  /* no-op */
}

export function captureException(_error: unknown, _context?: Props): void {
  /* no-op */
}
