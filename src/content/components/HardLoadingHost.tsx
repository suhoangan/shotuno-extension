import { HardLoadingOverlay } from './HardLoadingOverlay';
import { useHardLoadingStore } from '../../store/useHardLoadingStore';

/** Renders the shared hard-loading overlay from `useHardLoadingStore`. */
export function HardLoadingHost() {
  const loading = useHardLoadingStore((s) => s.loading);
  if (!loading) return null;
  return (
    <HardLoadingOverlay
      title={loading.title}
      message={loading.message}
      progress={loading.progress}
      onCancel={loading.onCancel}
    />
  );
}
