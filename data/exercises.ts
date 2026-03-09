export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';
export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'other';
export type Category = 'push' | 'pull' | 'legs' | 'core';

export interface Exercise {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    equipment: Equipment;
    category: Category;
    instructions: string;
    isCustom: boolean;
    createdBy?: string;
}

export const SEED_EXERCISES: Exercise[] = [
    // Chest
    { id: 'ex-001', name: 'Bench Press', muscleGroup: 'chest', equipment: 'barbell', category: 'push', instructions: 'Lie flat on bench. Grip barbell slightly wider than shoulders. Lower to chest, press up.', isCustom: false },
    { id: 'ex-002', name: 'Incline Bench Press', muscleGroup: 'chest', equipment: 'barbell', category: 'push', instructions: 'Set bench to 30-45 degrees. Press barbell from upper chest.', isCustom: false },
    { id: 'ex-003', name: 'Dumbbell Press', muscleGroup: 'chest', equipment: 'dumbbell', category: 'push', instructions: 'Lie flat on bench with dumbbells. Press up from chest level.', isCustom: false },
    { id: 'ex-004', name: 'Incline Dumbbell Fly', muscleGroup: 'chest', equipment: 'dumbbell', category: 'push', instructions: 'Incline bench, arms extended. Lower dumbbells in arc, squeeze back up.', isCustom: false },
    { id: 'ex-005', name: 'Cable Crossover', muscleGroup: 'chest', equipment: 'cable', category: 'push', instructions: 'Stand between cables, arms wide. Pull handles together in front.', isCustom: false },

    // Back
    { id: 'ex-006', name: 'Deadlift', muscleGroup: 'back', equipment: 'barbell', category: 'pull', instructions: 'Stand with feet hip-width. Hinge at hips, grip bar. Drive through heels.', isCustom: false },
    { id: 'ex-007', name: 'Barbell Row', muscleGroup: 'back', equipment: 'barbell', category: 'pull', instructions: 'Bent over at 45 degrees. Pull barbell to lower chest.', isCustom: false },
    { id: 'ex-008', name: 'Pull Ups', muscleGroup: 'back', equipment: 'bodyweight', category: 'pull', instructions: 'Hang from bar, palms forward. Pull chin over bar.', isCustom: false },
    { id: 'ex-009', name: 'Lat Pulldown', muscleGroup: 'back', equipment: 'cable', category: 'pull', instructions: 'Sit at lat pulldown machine. Pull bar to upper chest.', isCustom: false },
    { id: 'ex-010', name: 'Seated Cable Row', muscleGroup: 'back', equipment: 'machine', category: 'pull', instructions: 'Sit at cable row. Pull handle to lower chest, squeeze shoulder blades.', isCustom: false },

    // Legs
    { id: 'ex-011', name: 'Squat', muscleGroup: 'legs', equipment: 'barbell', category: 'legs', instructions: 'Bar on upper back. Squat down until thighs parallel. Drive up.', isCustom: false },
    { id: 'ex-012', name: 'Leg Press', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Sit in leg press machine. Press platform away, control return.', isCustom: false },
    { id: 'ex-013', name: 'Lunges', muscleGroup: 'legs', equipment: 'dumbbell', category: 'legs', instructions: 'Step forward, lower back knee toward ground. Push back to start.', isCustom: false },
    { id: 'ex-014', name: 'Leg Curl', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Lie face down on leg curl machine. Curl heels toward glutes.', isCustom: false },
    { id: 'ex-015', name: 'Leg Extension', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Sit on leg extension machine. Extend legs fully, control descent.', isCustom: false },

    // Shoulders
    { id: 'ex-016', name: 'Overhead Press', muscleGroup: 'shoulders', equipment: 'barbell', category: 'push', instructions: 'Stand with barbell at shoulders. Press straight overhead.', isCustom: false },
    { id: 'ex-017', name: 'Lateral Raise', muscleGroup: 'shoulders', equipment: 'dumbbell', category: 'push', instructions: 'Stand with dumbbells at sides. Raise arms to shoulder height.', isCustom: false },

    // Arms
    { id: 'ex-018', name: 'Bicep Curl', muscleGroup: 'arms', equipment: 'dumbbell', category: 'pull', instructions: 'Stand with dumbbells. Curl to shoulders, control descent.', isCustom: false },
    { id: 'ex-019', name: 'Tricep Pushdown', muscleGroup: 'arms', equipment: 'cable', category: 'push', instructions: 'Stand at cable machine. Push bar down, extend arms fully.', isCustom: false },
    { id: 'ex-020', name: 'Hammer Curl', muscleGroup: 'arms', equipment: 'dumbbell', category: 'pull', instructions: 'Stand with dumbbells, palms facing in. Curl to shoulders.', isCustom: false },

    // Core
    { id: 'ex-021', name: 'Plank', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Hold push-up position on forearms. Keep body straight.', isCustom: false },
    { id: 'ex-022', name: 'Cable Crunch', muscleGroup: 'core', equipment: 'cable', category: 'core', instructions: 'Kneel at cable machine. Crunch down, bringing elbows to knees.', isCustom: false },
];

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
    chest: 'Chest',
    back: 'Back',
    legs: 'Legs',
    shoulders: 'Shoulders',
    arms: 'Arms',
    core: 'Core',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
    barbell: 'Barbell',
    dumbbell: 'Dumbbells',
    machine: 'Machine',
    cable: 'Cable',
    bodyweight: 'Bodyweight',
    other: 'Other',
};
