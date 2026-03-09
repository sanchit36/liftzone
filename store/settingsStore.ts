import { create } from 'zustand';

export type WeightUnit = 'kg' | 'lbs';

interface SettingsState {
    weightUnit: WeightUnit;
    restTimerEnabled: boolean;
    restTimerDuration: number;
    toggleWeightUnit: () => void;
    setRestTimerDuration: (seconds: number) => void;
    setRestTimerEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    weightUnit: 'kg',
    restTimerEnabled: false,
    restTimerDuration: 90,

    toggleWeightUnit: () =>
        set((state) => ({ weightUnit: state.weightUnit === 'kg' ? 'lbs' : 'kg' })),

    setRestTimerDuration: (seconds) => set({ restTimerDuration: seconds }),

    setRestTimerEnabled: (enabled) => set({ restTimerEnabled: enabled }),
}));
