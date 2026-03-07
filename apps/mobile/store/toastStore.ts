import { create } from 'zustand';

interface ToastState {
    showToast: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    triggerToast: (message: string, type: 'success' | 'error' | 'info') => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    showToast: false,
    message: '',
    type: 'info',
    triggerToast: (message, type) => {
        set({ showToast: true, message, type });
        setTimeout(() => {
            set({ showToast: false });
        }, 3000);
    },
    hideToast: () => set({ showToast: false }),
}));
