import { Routine, CompletedWorkout, WorkoutExercise } from '../store/workoutStore';
import { Measurement } from '../store/measureStore';

export const MOCK_ROUTINES: Routine[] = [
    {
        id: 'rt-001',
        name: 'Push Day',
        exerciseIds: ['ex-001', 'ex-003', 'ex-016', 'ex-019', 'ex-017', 'ex-005'],
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        icon: 'flash-on',
    },
    {
        id: 'rt-002',
        name: 'Pull Day',
        exerciseIds: ['ex-007', 'ex-008', 'ex-009', 'ex-018', 'ex-020'],
        createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
        icon: 'layers',
    },
    {
        id: 'rt-003',
        name: 'Leg Day',
        exerciseIds: ['ex-011', 'ex-012', 'ex-013', 'ex-014', 'ex-015', 'ex-006', 'ex-021'],
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        icon: 'swap-vert',
    },
];

const createMockSets = (weights: number[], reps: number[]) =>
    weights.map((w, i) => ({
        id: `set-${Date.now()}-${i}`,
        weight: w,
        reps: reps[i],
        setIndex: i,
        completed: true,
    }));

const createWorkoutExercise = (exerciseId: string, weights: number[], reps: number[], index: number): WorkoutExercise => ({
    id: `we-${Date.now()}-${index}`,
    exerciseId,
    orderIndex: index,
    sets: createMockSets(weights, reps),
});

export const MOCK_WORKOUTS: CompletedWorkout[] = [
    {
        id: 'wk-001',
        routineId: 'rt-001',
        routineName: 'Push Workout',
        startedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        endedAt: Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000,
        exercises: [
            createWorkoutExercise('ex-001', [60, 65, 65], [8, 6, 6], 0),
            createWorkoutExercise('ex-003', [20, 22, 22], [10, 8, 8], 1),
            createWorkoutExercise('ex-016', [40, 42.5, 42.5], [8, 6, 5], 2),
        ],
    },
    {
        id: 'wk-002',
        routineId: 'rt-003',
        routineName: 'Leg Workout',
        startedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        endedAt: Date.now() - 3 * 24 * 60 * 60 * 1000 + 62 * 60 * 1000,
        exercises: [
            createWorkoutExercise('ex-011', [80, 90, 90, 100], [8, 6, 6, 4], 0),
            createWorkoutExercise('ex-012', [120, 140, 140], [10, 8, 8], 1),
            createWorkoutExercise('ex-014', [40, 45, 45], [12, 10, 10], 2),
        ],
    },
    {
        id: 'wk-003',
        routineId: undefined,
        routineName: 'Full Body Strength',
        startedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        endedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 + 55 * 60 * 1000,
        exercises: [
            createWorkoutExercise('ex-001', [55, 60, 60], [8, 6, 6], 0),
            createWorkoutExercise('ex-011', [70, 80, 80], [8, 6, 6], 1),
            createWorkoutExercise('ex-008', [0, 0, 0], [10, 8, 6], 2),
        ],
    },
];

export const MOCK_MEASUREMENTS: Measurement[] = [
    { id: 'm-001', type: 'weight', value: 77.5, unit: 'kg', date: Date.now() - 30 * 24 * 60 * 60 * 1000 },
    { id: 'm-002', type: 'weight', value: 77.0, unit: 'kg', date: Date.now() - 25 * 24 * 60 * 60 * 1000 },
    { id: 'm-003', type: 'weight', value: 76.5, unit: 'kg', date: Date.now() - 20 * 24 * 60 * 60 * 1000 },
    { id: 'm-004', type: 'weight', value: 76.2, unit: 'kg', date: Date.now() - 15 * 24 * 60 * 60 * 1000 },
    { id: 'm-005', type: 'weight', value: 75.8, unit: 'kg', date: Date.now() - 10 * 24 * 60 * 60 * 1000 },
    { id: 'm-006', type: 'weight', value: 75.5, unit: 'kg', date: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { id: 'm-007', type: 'bodyFat', value: 18.2, unit: '%', date: Date.now() - 10 * 24 * 60 * 60 * 1000 },
    { id: 'm-008', type: 'waist', value: 82.0, unit: 'cm', date: Date.now() - 15 * 24 * 60 * 60 * 1000 },
    { id: 'm-009', type: 'chest', value: 104.5, unit: 'cm', date: Date.now() - 30 * 24 * 60 * 60 * 1000 },
    { id: 'm-010', type: 'arms', value: 38.2, unit: 'cm', date: Date.now() - 8 * 24 * 60 * 60 * 1000 },
];
