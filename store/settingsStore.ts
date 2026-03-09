import { create } from 'zustand';
import * as db from '../db/database';

export type WeightUnit = 'kg' | 'lbs';

interface SettingsState {
    weightUnit: WeightUnit;
    restTimerEnabled: boolean;
    restTimerDuration: number;
    darkMode: boolean;
    loadSettings: () => void;
    toggleWeightUnit: () => void;
    setRestTimerDuration: (seconds: number) => void;
    setRestTimerEnabled: (enabled: boolean) => void;
    toggleDarkMode: () => void;
    setDarkMode: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    weightUnit: 'kg',
    restTimerEnabled: false,
    restTimerDuration: 0,
    darkMode: false,

    loadSettings: () => {
        const unit = db.getSetting('weightUnit');
        const timerEnabled = db.getSetting('restTimerEnabled');
        const timerDuration = db.getSetting('restTimerDuration');
        const darkMode = db.getSetting('darkMode');
        set({
            weightUnit: (unit as WeightUnit) || 'kg',
            restTimerEnabled: timerEnabled === 'true',
            restTimerDuration: timerDuration ? parseInt(timerDuration) : 0,
            darkMode: darkMode === 'true',
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

    toggleDarkMode: () => {
        const newVal = !get().darkMode;
        db.setSetting('darkMode', String(newVal));
        set({ darkMode: newVal });
    },

    setDarkMode: (enabled) => {
        db.setSetting('darkMode', String(enabled));
        set({ darkMode: enabled });
    },
}));
