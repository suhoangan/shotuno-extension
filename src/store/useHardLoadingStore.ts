import { create } from 'zustand';

export type HardLoadingPayload = {
  title: string;
  message?: string;
  /** 0–100 shows a progress bar; omit for indeterminate spinner-only. */
  progress?: number | null;
  onCancel?: () => void;
};

type HardLoadingState = {
  loading: HardLoadingPayload | null;
  showHardLoading: (payload: HardLoadingPayload) => void;
  updateHardLoading: (patch: Partial<HardLoadingPayload>) => void;
  hideHardLoading: () => void;
};

export const useHardLoadingStore = create<HardLoadingState>((set) => ({
  loading: null,
  showHardLoading: (payload) => set({ loading: payload }),
  updateHardLoading: (patch) =>
    set((state) => (state.loading ? { loading: { ...state.loading, ...patch } } : state)),
  hideHardLoading: () => set({ loading: null }),
}));

export function exportHardLoading(type: string): HardLoadingPayload {
  if (type === 'download') {
    return { title: 'Downloading…', message: 'Saving your screenshot' };
  }
  if (type === 'copy') {
    return { title: 'Copying…', message: 'Preparing image for clipboard' };
  }
  if (type === 'ai') {
    return { title: 'Preparing…', message: 'Getting image ready for AI' };
  }
  return { title: 'Working…', message: 'Please wait' };
}
