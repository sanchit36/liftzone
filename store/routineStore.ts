import { create } from 'zustand';
import { MOCK_ROUTINES } from '../data/mockData';
import { Routine } from './workoutStore';

interface RoutineState {
    routines: Routine[];
    addRoutine: (routine: Routine) => void;
    updateRoutine: (id: string, updates: Partial<Routine>) => void;
    removeRoutine: (id: string) => void;
    getRoutineById: (id: string) => Routine | undefined;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
    routines: MOCK_ROUTINES,

    addRoutine: (routine) =>
        set((state) => ({ routines: [...state.routines, routine] })),

    updateRoutine: (id, updates) =>
        set((state) => ({
            routines: state.routines.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

    removeRoutine: (id) =>
        set((state) => ({ routines: state.routines.filter((r) => r.id !== id) })),

    getRoutineById: (id) => get().routines.find((r) => r.id === id),
}));
