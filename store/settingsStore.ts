import { create } from 'zustand';
import * as db from '../db/database';

export type WeightUnit = 'kg' | 'lbs';

interface SettingsState {
    weightUnit: WeightUnit;
    restTimerEnabled: boolean;
    restTimerDuration: number;
    loadSettings: () => void;
    toggleWeightUnit: () => void;
    setRestTimerDuration: (seconds: number) => void;
    setRestTimerEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    weightUnit: 'kg',
    restTimerEnabled: false,
    restTimerDuration: 0,

    loadSettings: () => {
        const unit = db.getSetting('weightUnit');
        const timerEnabled = db.getSetting('restTimerEnabled');
        const timerDuration = db.getSetting('restTimerDuration');
        set({
            weightUnit: (unit as WeightUnit) || 'kg',
            restTimerEnabled: timerEnabled === 'true',
            restTimerDuration: timerDuration ? parseInt(timerDuration) : 0,
        });
    },

    toggleWeightUnit: () => {
        const newUnit = get().weightUnit === 'kg' ? 'lbs' : 'kg';
        db.setSetting('weightUnit', newUnit);
        set({ weightUnit: newUnit as WeightUnit });
    },

    setRestTimerDuration: (seconds) => {
        db.setSetting('restTimerDuration', String(seconds));
        set({ restTimerDuration: seconds });
    },

    setRestTimerEnabled: (enabled) => {
        db.setSetting('restTimerEnabled', String(enabled));
        set({ restTimerEnabled: enabled });
    },
}));
