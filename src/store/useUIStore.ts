import { create } from 'zustand';

export type ActiveMenuType = 'shape' | 'delete' | 'border' | 'watermark' | null;

interface UIState {
  activeMenu: ActiveMenuType;
  isAIModalOpen: boolean;
  isClearAllOpen: boolean;
  filename: string;
  showSubscriptionPopup: boolean;
  subscriptionMessage: string;

  // Actions
  setActiveMenu: (menu: ActiveMenuType) => void;
  setIsAIModalOpen: (isOpen: boolean) => void;
  setIsClearAllOpen: (isOpen: boolean) => void;
  setFilename: (filename: string) => void;
  setShowSubscriptionPopup: (isOpen: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeMenu: null,
  isAIModalOpen: false,
  isClearAllOpen: false,
  filename: `Screenshot_${new Date().toISOString().slice(0, 10)}`,
  showSubscriptionPopup: false,
  subscriptionMessage: '',

  setActiveMenu: (menu) => set({ activeMenu: menu }),
  setIsAIModalOpen: (isOpen) => set({ isAIModalOpen: isOpen }),
  setIsClearAllOpen: (isOpen) => set({ isClearAllOpen: isOpen }),
  setFilename: (filename) => set({ filename }),
  setShowSubscriptionPopup: (isOpen, message) =>
    set((state) => ({
      showSubscriptionPopup: isOpen,
      subscriptionMessage: message !== undefined ? message : state.subscriptionMessage,
    })),
}));
