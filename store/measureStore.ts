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

interface MeasureState {
    measurements: Measurement[];
    loadMeasurements: () => void;
    addMeasurement: (measurement: Measurement) => void;
    getMeasurementsByType: (type: MeasureType) => Measurement[];
    getLatestByType: (type: MeasureType) => Measurement | undefined;
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

    getMeasurementsByType: (type) =>
        get()
            .measurements.filter((m) => m.type === type)
            .sort((a, b) => a.date - b.date),

    getLatestByType: (type) => {
        const filtered = get().measurements.filter((m) => m.type === type);
        return filtered.sort((a, b) => b.date - a.date)[0];
    },
}));
