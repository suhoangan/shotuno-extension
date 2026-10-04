import { create } from 'zustand';

export type ActiveMenuType = 'shape' | 'delete' | 'border' | 'watermark' | null;

interface UIState {
  activeMenu: ActiveMenuType;
  isAIModalOpen: boolean;
  isClearAllOpen: boolean;
  filename: string;

  // Actions
  setActiveMenu: (menu: ActiveMenuType) => void;
  setIsAIModalOpen: (isOpen: boolean) => void;
  setIsClearAllOpen: (isOpen: boolean) => void;
  setFilename: (filename: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeMenu: null,
  isAIModalOpen: false,
  isClearAllOpen: false,
  filename: `Screenshot_${new Date().toISOString().slice(0, 10)}`,

  setActiveMenu: (menu) => set({ activeMenu: menu }),
  setIsAIModalOpen: (isOpen) => set({ isAIModalOpen: isOpen }),
  setIsClearAllOpen: (isOpen) => set({ isClearAllOpen: isOpen }),
  setFilename: (filename) => set({ filename }),
}));
