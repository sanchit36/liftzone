import { create } from 'zustand';
import * as dbOps from '../db/database';
import { Routine, RoutineExerciseTemplate, RoutineSetTemplate } from './workoutStore';

interface RoutineState {
    routines: Routine[];
    draftExerciseIds: string[];
    loadRoutines: () => void;
    addRoutine: (routine: Routine) => void;
    updateRoutine: (id: string, updates: Partial<Routine>) => void;
    removeRoutine: (id: string) => void;
    getRoutineById: (id: string) => Routine | undefined;
    addToDraft: (ids: string[]) => void;
    removeFromDraft: (id: string) => void;
    clearDraft: () => void;
}

function loadRoutinesFromDb(): Routine[] {
    const rows = dbOps.getAllRoutines();
    return rows.map((r) => {
        const reRows = dbOps.getRoutineExercises(r.id);
        const exerciseIds = reRows.map((re) => re.exercise_id);
        const exerciseTemplates: RoutineExerciseTemplate[] = reRows.map((re) => {
            let sets: RoutineSetTemplate[] = [];
            try { sets = JSON.parse(re.sets_template); } catch { }
            return { exerciseId: re.exercise_id, sets, restTimer: re.rest_timer };
        });
        return {
            id: r.id, name: r.name, icon: r.icon || undefined,
            createdAt: r.created_at, exerciseIds, exerciseTemplates,
        };
    });
}

function saveRoutineExercises(routineId: string, routine: Routine): void {
    dbOps.deleteRoutineExercises(routineId);
    const templates = routine.exerciseTemplates || [];
    routine.exerciseIds.forEach((exId, i) => {
        const template = templates.find((t) => t.exerciseId === exId);
        dbOps.insertRoutineExercise(
            routineId, exId, i,
            template?.restTimer ?? 0,
            JSON.stringify(template?.sets ?? [])
        );
    });
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
    routines: [],
    draftExerciseIds: [],

    loadRoutines: () => {
        set({ routines: loadRoutinesFromDb() });
    },

    addRoutine: (routine) => {
        dbOps.insertRoutine(routine.id, routine.name, routine.icon || null, routine.createdAt);
        saveRoutineExercises(routine.id, routine);
        set((state) => ({ routines: [routine, ...state.routines] }));
    },

    updateRoutine: (id, updates) => {
        const current = get().routines.find((r) => r.id === id);
        if (!current) return;
        const updated = { ...current, ...updates };
        dbOps.updateRoutineRow(id, updated.name, updated.icon || null);
        saveRoutineExercises(id, updated);
        set((state) => ({
            routines: state.routines.map((r) => (r.id === id ? updated : r)),
        }));
    },

    removeRoutine: (id) => {
        dbOps.deleteRoutine(id);
        set((state) => ({ routines: state.routines.filter((r) => r.id !== id) }));
    },

    getRoutineById: (id) => get().routines.find((r) => r.id === id),

    addToDraft: (ids) =>
        set((state) => ({
            draftExerciseIds: [...state.draftExerciseIds, ...ids.filter((id) => !state.draftExerciseIds.includes(id))],
        })),

    removeFromDraft: (id) =>
        set((state) => ({
            draftExerciseIds: state.draftExerciseIds.filter((x) => x !== id),
        })),

    clearDraft: () => set({ draftExerciseIds: [] }),
}));
