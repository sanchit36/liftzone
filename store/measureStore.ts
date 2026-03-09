import { create } from 'zustand';
import * as db from '../db/database';

export type MeasureType = 'weight' | 'bodyFat' | 'waist' | 'chest' | 'arms';

export interface Measurement {
    id: string;
    type: MeasureType;
    value: number;
    unit: string;
    date: number;
}

export const MEASURE_LABELS: Record<MeasureType, string> = {
    weight: 'Body Weight',
    bodyFat: 'Body Fat',
    waist: 'Waist',
    chest: 'Chest',
    arms: 'Arms',
};

// Validation limits for each measurement type
export const MEASURE_LIMITS: Record<MeasureType, { min: number; max: number; unit: string }> = {
    weight: { min: 20, max: 300, unit: 'kg' },
    bodyFat: { min: 1, max: 60, unit: '%' },
    waist: { min: 40, max: 200, unit: 'cm' },
    chest: { min: 50, max: 200, unit: 'cm' },
    arms: { min: 15, max: 70, unit: 'cm' },
};

interface MeasureState {
    measurements: Measurement[];
    loadMeasurements: () => void;
    addMeasurement: (measurement: Measurement) => void;
    removeMeasurement: (id: string) => void;
    getMeasurementsByType: (type: MeasureType) => Measurement[];
    getLatestByType: (type: MeasureType) => Measurement | undefined;
    hasEntryToday: (type: MeasureType) => boolean;
}

export const useMeasureStore = create<MeasureState>((set, get) => ({
    measurements: [],

    loadMeasurements: () => {
        const rows = db.getAllMeasurements();
        set({
            measurements: rows.map((r) => ({
                id: r.id, type: r.type as MeasureType,
                value: r.value, unit: r.unit, date: r.date,
            })),
        });
    },

    addMeasurement: (measurement) => {
        db.insertMeasurement({
            id: measurement.id, type: measurement.type,
            value: measurement.value, unit: measurement.unit, date: measurement.date,
        });
        set((state) => ({ measurements: [...state.measurements, measurement] }));
    },

    removeMeasurement: (id) => {
        db.deleteMeasurement(id);
        set((state) => ({ measurements: state.measurements.filter((m) => m.id !== id) }));
    },

    getMeasurementsByType: (type) =>
        get()
            .measurements.filter((m) => m.type === type)
            .sort((a, b) => a.date - b.date),

    getLatestByType: (type) => {
        const filtered = get().measurements.filter((m) => m.type === type);
        return filtered.sort((a, b) => b.date - a.date)[0];
    },

    hasEntryToday: (type) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return get().measurements.some(
            (m) => m.type === type && m.date >= today.getTime() && m.date < tomorrow.getTime()
        );
    },
}));
