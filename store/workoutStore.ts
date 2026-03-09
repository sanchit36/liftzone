import { create } from 'zustand';
import * as dbOps from '../db/database';

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

export interface RoutineSetTemplate {
    weight: number;
    reps: number;
}

export interface RoutineExerciseTemplate {
    exerciseId: string;
    sets: RoutineSetTemplate[];
    restTimer: number;
}

export interface Routine {
    id: string;
    name: string;
    exerciseIds: string[];
    exerciseTemplates?: RoutineExerciseTemplate[];
    createdAt: number;
    icon?: string;
}

interface WorkoutState {
    activeWorkout: ActiveWorkout | null;
    workoutHistory: CompletedWorkout[];
    streakDays: number;

    loadWorkoutHistory: () => void;
    startWorkout: (routineId?: string, routineName?: string, exerciseIds?: string[], exerciseTemplates?: RoutineExerciseTemplate[]) => void;
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

function loadHistoryFromDb(): CompletedWorkout[] {
    const workoutRows = dbOps.getAllWorkouts();
    return workoutRows.map((w) => {
        const weRows = dbOps.getWorkoutExercises(w.id);
        const exercises: WorkoutExercise[] = weRows.map((we) => {
            const setRows = dbOps.getWorkoutSets(we.id);
            return {
                id: we.id,
                exerciseId: we.exercise_id,
                orderIndex: we.order_index,
                sets: setRows.map((s) => ({
                    id: s.id, weight: s.weight, reps: s.reps,
                    setIndex: s.set_index, completed: s.completed === 1,
                })),
            };
        });
        return {
            id: w.id, routineId: w.routine_id || undefined,
            routineName: w.routine_name, startedAt: w.started_at,
            endedAt: w.ended_at, exercises,
        };
    });
}

function calculateStreakFromHistory(history: CompletedWorkout[]): number {
    if (history.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayMs = 24 * 60 * 60 * 1000;
    const workoutDays = new Set(
        history.map((w) => {
            const d = new Date(w.startedAt);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        })
    );
    let streak = 0;
    let checkDate = today.getTime();
    // If no workout today, start from yesterday
    if (!workoutDays.has(checkDate)) {
        checkDate -= dayMs;
    }
    while (workoutDays.has(checkDate)) {
        streak++;
        checkDate -= dayMs;
    }
    return streak;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
    activeWorkout: null,
    workoutHistory: [],
    streakDays: 0,

    loadWorkoutHistory: () => {
        const history = loadHistoryFromDb();
        set({ workoutHistory: history, streakDays: calculateStreakFromHistory(history) });
    },

    startWorkout: (routineId, routineName, exerciseIds, exerciseTemplates) => {
        const exercises: WorkoutExercise[] = (exerciseIds || []).map((exId, i) => {
            // Priority: 1) previous workout, 2) routine template, 3) empty default
            const prevSets = get().getPreviousSets(exId);
            const template = exerciseTemplates?.find((t) => t.exerciseId === exId);
            let defaultSets: SetData[];
            if (prevSets && prevSets.length > 0) {
                defaultSets = prevSets.map((s, si) => ({
                    id: `s-${Date.now()}-${++setCounter}`,
                    weight: s.weight, reps: s.reps,
                    setIndex: si, completed: false,
                }));
            } else if (template && template.sets.length > 0) {
                defaultSets = template.sets.map((s, si) => ({
                    id: `s-${Date.now()}-${++setCounter}`,
                    weight: s.weight, reps: s.reps,
                    setIndex: si, completed: false,
                }));
            } else {
                defaultSets = [{ id: `s-${Date.now()}-${++setCounter}`, weight: 0, reps: 0, setIndex: 0, completed: false }];
            }

            return {
                id: `we-${Date.now()}-${++exerciseCounter}`,
                exerciseId: exId, orderIndex: i, sets: defaultSets,
            };
        });

        set({
            activeWorkout: {
                id: `wk-${Date.now()}`, routineId,
                routineName: routineName || 'Empty Workout',
                startedAt: Date.now(), exercises,
                restTimerEnd: null, restDuration: 0,
            },
        });
    },

    finishWorkout: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const completed: CompletedWorkout = {
            id: activeWorkout.id, routineId: activeWorkout.routineId,
            routineName: activeWorkout.routineName,
            startedAt: activeWorkout.startedAt, endedAt: Date.now(),
            exercises: activeWorkout.exercises,
        };

        // Persist to SQLite
        dbOps.insertWorkout({
            id: completed.id, routine_id: completed.routineId || null,
            routine_name: completed.routineName,
            started_at: completed.startedAt, ended_at: completed.endedAt,
        });
        for (const we of completed.exercises) {
            dbOps.insertWorkoutExercise({
                id: we.id, workout_id: completed.id,
                exercise_id: we.exerciseId, order_index: we.orderIndex,
            });
            for (const s of we.sets) {
                dbOps.insertWorkoutSet({
                    id: s.id, workout_exercise_id: we.id,
                    set_index: s.setIndex, weight: s.weight,
                    reps: s.reps, completed: s.completed ? 1 : 0,
                });
            }
        }

        const newHistory = [completed, ...get().workoutHistory];
        set({
            activeWorkout: null,
            workoutHistory: newHistory,
            streakDays: calculateStreakFromHistory(newHistory),
        });
    },

    cancelWorkout: () => set({ activeWorkout: null }),

    addExerciseToWorkout: (exerciseId) => {
        const { activeWorkout, getPreviousSets } = get();
        if (!activeWorkout) return;

        const prevSets = getPreviousSets(exerciseId);
        const defaultSets: SetData[] = prevSets
            ? prevSets.map((s, si) => ({
                id: `s-${Date.now()}-${++setCounter}`,
                weight: s.weight, reps: s.reps,
                setIndex: si, completed: false,
            }))
            : [{ id: `s-${Date.now()}-${++setCounter}`, weight: 0, reps: 0, setIndex: 0, completed: false }];

        const newExercise: WorkoutExercise = {
            id: `we-${Date.now()}-${++exerciseCounter}`,
            exerciseId, orderIndex: activeWorkout.exercises.length,
            sets: defaultSets,
        };

        set({
            activeWorkout: { ...activeWorkout, exercises: [...activeWorkout.exercises, newExercise] },
        });
    },

    removeExerciseFromWorkout: (workoutExerciseId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
            activeWorkout: { ...activeWorkout, exercises: activeWorkout.exercises.filter((e) => e.id !== workoutExerciseId) },
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
                        sets: [...e.sets, {
                            id: `s-${Date.now()}-${++setCounter}`,
                            weight: lastSet?.weight || 0, reps: lastSet?.reps || 0,
                            setIndex: e.sets.length, completed: false,
                        }],
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
                    return { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)) };
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
                    return { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s)) };
                }),
            },
        });
    },

    startRestTimer: (duration) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({ activeWorkout: { ...activeWorkout, restTimerEnd: Date.now() + duration * 1000, restDuration: duration } });
    },

    clearRestTimer: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({ activeWorkout: { ...activeWorkout, restTimerEnd: null } });
    },

    getPreviousSets: (exerciseId) => {
        // First check in-memory history
        const history = get().workoutHistory;
        for (const w of history) {
            const exercise = w.exercises.find((e) => e.exerciseId === exerciseId);
            if (exercise) return exercise.sets;
        }
        // Fallback to DB query
        const dbSets = dbOps.getPreviousSetsForExercise(exerciseId);
        if (dbSets && dbSets.length > 0) {
            return dbSets.map((s) => ({
                id: s.id, weight: s.weight, reps: s.reps,
                setIndex: s.set_index, completed: s.completed === 1,
            }));
        }
        return undefined;
    },

    calculateStreak: () => get().streakDays,

    getTotalStats: () => {
        const history = get().workoutHistory;
        let sets = 0, reps = 0, volume = 0;
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
