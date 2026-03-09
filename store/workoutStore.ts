import { create } from 'zustand';
import { MOCK_WORKOUTS } from '../data/mockData';

export interface SetData {
    id: string;
    weight: number;
    reps: number;
    setIndex: number;
    completed: boolean;
}

export interface WorkoutExercise {
    id: string;
    exerciseId: string;
    orderIndex: number;
    sets: SetData[];
}

export interface CompletedWorkout {
    id: string;
    routineId?: string;
    routineName: string;
    startedAt: number;
    endedAt: number;
    exercises: WorkoutExercise[];
}

export interface ActiveWorkout {
    id: string;
    routineId?: string;
    routineName: string;
    startedAt: number;
    exercises: WorkoutExercise[];
    restTimerEnd: number | null;
    restDuration: number;
}

export interface Routine {
    id: string;
    name: string;
    exerciseIds: string[];
    createdAt: number;
    icon?: string;
}

interface WorkoutState {
    activeWorkout: ActiveWorkout | null;
    workoutHistory: CompletedWorkout[];
    streakDays: number;

    startWorkout: (routineId?: string, routineName?: string, exerciseIds?: string[]) => void;
    finishWorkout: () => void;
    cancelWorkout: () => void;

    addExerciseToWorkout: (exerciseId: string) => void;
    removeExerciseFromWorkout: (exerciseId: string) => void;

    addSet: (workoutExerciseId: string) => void;
    removeSet: (workoutExerciseId: string, setId: string) => void;
    updateSet: (workoutExerciseId: string, setId: string, field: 'weight' | 'reps', value: number) => void;
    completeSet: (workoutExerciseId: string, setId: string) => void;

    startRestTimer: (duration: number) => void;
    clearRestTimer: () => void;

    getPreviousSets: (exerciseId: string) => SetData[] | undefined;
    calculateStreak: () => number;
    getTotalStats: () => { workouts: number; sets: number; reps: number; volume: number };
}

let exerciseCounter = 0;
let setCounter = 0;

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
    activeWorkout: null,
    workoutHistory: MOCK_WORKOUTS,
    streakDays: 7,

    startWorkout: (routineId, routineName, exerciseIds) => {
        const exercises: WorkoutExercise[] = (exerciseIds || []).map((exId, i) => {
            const prevSets = get().getPreviousSets(exId);
            const defaultSets: SetData[] = prevSets
                ? prevSets.map((s, si) => ({
                    id: `s-${Date.now()}-${++setCounter}`,
                    weight: s.weight,
                    reps: s.reps,
                    setIndex: si,
                    completed: false,
                }))
                : [{ id: `s-${Date.now()}-${++setCounter}`, weight: 0, reps: 0, setIndex: 0, completed: false }];

            return {
                id: `we-${Date.now()}-${++exerciseCounter}`,
                exerciseId: exId,
                orderIndex: i,
                sets: defaultSets,
            };
        });

        set({
            activeWorkout: {
                id: `wk-${Date.now()}`,
                routineId,
                routineName: routineName || 'Empty Workout',
                startedAt: Date.now(),
                exercises,
                restTimerEnd: null,
                restDuration: 90,
            },
        });
    },

    finishWorkout: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const completed: CompletedWorkout = {
            id: activeWorkout.id,
            routineId: activeWorkout.routineId,
            routineName: activeWorkout.routineName,
            startedAt: activeWorkout.startedAt,
            endedAt: Date.now(),
            exercises: activeWorkout.exercises,
        };

        set((state) => ({
            activeWorkout: null,
            workoutHistory: [completed, ...state.workoutHistory],
            streakDays: state.streakDays + 1,
        }));
    },

    cancelWorkout: () => set({ activeWorkout: null }),

    addExerciseToWorkout: (exerciseId) => {
        const { activeWorkout, getPreviousSets } = get();
        if (!activeWorkout) return;

        const prevSets = getPreviousSets(exerciseId);
        const defaultSets: SetData[] = prevSets
            ? prevSets.map((s, si) => ({
                id: `s-${Date.now()}-${++setCounter}`,
                weight: s.weight,
                reps: s.reps,
                setIndex: si,
                completed: false,
            }))
            : [{ id: `s-${Date.now()}-${++setCounter}`, weight: 0, reps: 0, setIndex: 0, completed: false }];

        const newExercise: WorkoutExercise = {
            id: `we-${Date.now()}-${++exerciseCounter}`,
            exerciseId,
            orderIndex: activeWorkout.exercises.length,
            sets: defaultSets,
        };

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: [...activeWorkout.exercises, newExercise],
            },
        });
    },

    removeExerciseFromWorkout: (workoutExerciseId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: activeWorkout.exercises.filter((e) => e.id !== workoutExerciseId),
            },
        });
    },

    addSet: (workoutExerciseId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: activeWorkout.exercises.map((e) => {
                    if (e.id !== workoutExerciseId) return e;
                    const lastSet = e.sets[e.sets.length - 1];
                    return {
                        ...e,
                        sets: [
                            ...e.sets,
                            {
                                id: `s-${Date.now()}-${++setCounter}`,
                                weight: lastSet?.weight || 0,
                                reps: lastSet?.reps || 0,
                                setIndex: e.sets.length,
                                completed: false,
                            },
                        ],
                    };
                }),
            },
        });
    },

    removeSet: (workoutExerciseId, setId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: activeWorkout.exercises.map((e) => {
                    if (e.id !== workoutExerciseId) return e;
                    return { ...e, sets: e.sets.filter((s) => s.id !== setId) };
                }),
            },
        });
    },

    updateSet: (workoutExerciseId, setId, field, value) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: activeWorkout.exercises.map((e) => {
                    if (e.id !== workoutExerciseId) return e;
                    return {
                        ...e,
                        sets: e.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
                    };
                }),
            },
        });
    },

    completeSet: (workoutExerciseId, setId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: activeWorkout.exercises.map((e) => {
                    if (e.id !== workoutExerciseId) return e;
                    return {
                        ...e,
                        sets: e.sets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s)),
                    };
                }),
            },
        });
    },

    startRestTimer: (duration) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
            activeWorkout: { ...activeWorkout, restTimerEnd: Date.now() + duration * 1000, restDuration: duration },
        });
    },

    clearRestTimer: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({ activeWorkout: { ...activeWorkout, restTimerEnd: null } });
    },

    getPreviousSets: (exerciseId) => {
        const history = get().workoutHistory;
        for (const w of history) {
            const exercise = w.exercises.find((e) => e.exerciseId === exerciseId);
            if (exercise) return exercise.sets;
        }
        return undefined;
    },

    calculateStreak: () => get().streakDays,

    getTotalStats: () => {
        const history = get().workoutHistory;
        let sets = 0;
        let reps = 0;
        let volume = 0;
        history.forEach((w) => {
            w.exercises.forEach((e) => {
                e.sets.forEach((s) => {
                    if (s.completed) {
                        sets++;
                        reps += s.reps;
                        volume += s.weight * s.reps;
                    }
                });
            });
        });
        return { workouts: history.length, sets, reps, volume };
    },
}));
