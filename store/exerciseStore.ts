import { create } from 'zustand';
import { Exercise } from '../data/exercises';
import * as db from '../db/database';

interface ExerciseState {
    exercises: Exercise[];
    loadExercises: () => void;
    addExercise: (exercise: Exercise) => void;
    removeExercise: (id: string) => void;
    getExerciseById: (id: string) => Exercise | undefined;
    getExercisesByMuscleGroup: () => Record<string, Exercise[]>;
    searchExercises: (query: string) => Exercise[];
}

function rowToExercise(row: db.ExerciseRow): Exercise {
    return {
        id: row.id,
        name: row.name,
        muscleGroup: row.muscle_group as Exercise['muscleGroup'],
        equipment: row.equipment as Exercise['equipment'],
        category: row.category as Exercise['category'],
        instructions: row.instructions,
        isCustom: row.is_custom === 1,
    };
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
    exercises: [],

    loadExercises: () => {
        const rows = db.getAllExercises();
        set({ exercises: rows.map(rowToExercise) });
    },

    addExercise: (exercise) => {
        db.insertExercise({
            id: exercise.id, name: exercise.name,
            muscle_group: exercise.muscleGroup, equipment: exercise.equipment,
            category: exercise.category, instructions: exercise.instructions,
            is_custom: exercise.isCustom ? 1 : 0,
        });
        set((state) => ({ exercises: [...state.exercises, exercise] }));
    },

    removeExercise: (id) => {
        db.deleteExercise(id);
        set((state) => ({ exercises: state.exercises.filter((e) => e.id !== id) }));
    },

    getExerciseById: (id) => get().exercises.find((e) => e.id === id),

    getExercisesByMuscleGroup: () => {
        const grouped: Record<string, Exercise[]> = {};
        get().exercises.forEach((e) => {
            if (!grouped[e.muscleGroup]) grouped[e.muscleGroup] = [];
            grouped[e.muscleGroup].push(e);
        });
        return grouped;
    },

    searchExercises: (query) => {
        const q = query.toLowerCase();
        return get().exercises.filter(
            (e) =>
                e.name.toLowerCase().includes(q) ||
                e.muscleGroup.toLowerCase().includes(q) ||
                e.equipment.toLowerCase().includes(q)
        );
    },
}));
