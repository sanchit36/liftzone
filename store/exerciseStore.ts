import { create } from 'zustand';
import { Exercise, SEED_EXERCISES } from '../data/exercises';

interface ExerciseState {
    exercises: Exercise[];
    addExercise: (exercise: Exercise) => void;
    removeExercise: (id: string) => void;
    getExerciseById: (id: string) => Exercise | undefined;
    getExercisesByMuscleGroup: () => Record<string, Exercise[]>;
    searchExercises: (query: string) => Exercise[];
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
    exercises: SEED_EXERCISES,

    addExercise: (exercise) =>
        set((state) => ({ exercises: [...state.exercises, exercise] })),

    removeExercise: (id) =>
        set((state) => ({
            exercises: state.exercises.filter((e) => e.id !== id),
        })),

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
