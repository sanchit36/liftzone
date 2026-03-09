export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';
export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'other';
export type Category = 'push' | 'pull' | 'legs' | 'core' | 'cardio';

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
    // ── CHEST ──────────────────────────────────────────
    { id: 'ex-001', name: 'Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell', category: 'push', instructions: 'Lie flat on bench. Grip barbell slightly wider than shoulders. Lower to chest, press up.', isCustom: false },
    { id: 'ex-002', name: 'Incline Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell', category: 'push', instructions: 'Set bench to 30-45 degrees. Press barbell from upper chest.', isCustom: false },
    { id: 'ex-003', name: 'Decline Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell', category: 'push', instructions: 'Set bench to decline. Press barbell from lower chest.', isCustom: false },
    { id: 'ex-004', name: 'Dumbbell Bench Press', muscleGroup: 'chest', equipment: 'dumbbell', category: 'push', instructions: 'Lie flat on bench with dumbbells. Press up from chest level.', isCustom: false },
    { id: 'ex-005', name: 'Incline Dumbbell Press', muscleGroup: 'chest', equipment: 'dumbbell', category: 'push', instructions: 'Incline bench at 30-45 degrees. Press dumbbells from upper chest.', isCustom: false },
    { id: 'ex-006', name: 'Decline Dumbbell Press', muscleGroup: 'chest', equipment: 'dumbbell', category: 'push', instructions: 'Decline bench. Press dumbbells from lower chest.', isCustom: false },
    { id: 'ex-007', name: 'Dumbbell Fly', muscleGroup: 'chest', equipment: 'dumbbell', category: 'push', instructions: 'Lie flat, arms extended. Lower dumbbells in wide arc, squeeze back up.', isCustom: false },
    { id: 'ex-008', name: 'Incline Dumbbell Fly', muscleGroup: 'chest', equipment: 'dumbbell', category: 'push', instructions: 'Incline bench, arms extended. Lower dumbbells in arc, squeeze back up.', isCustom: false },
    { id: 'ex-009', name: 'Cable Crossover', muscleGroup: 'chest', equipment: 'cable', category: 'push', instructions: 'Stand between cables, arms wide. Pull handles together in front.', isCustom: false },
    { id: 'ex-010', name: 'Low Cable Fly', muscleGroup: 'chest', equipment: 'cable', category: 'push', instructions: 'Set cables low. Pull handles up and together in front of chest.', isCustom: false },
    { id: 'ex-011', name: 'Machine Chest Press', muscleGroup: 'chest', equipment: 'machine', category: 'push', instructions: 'Sit at chest press machine. Press handles forward, control return.', isCustom: false },
    { id: 'ex-012', name: 'Pec Deck', muscleGroup: 'chest', equipment: 'machine', category: 'push', instructions: 'Sit at pec deck. Bring pads together in front of chest.', isCustom: false },
    { id: 'ex-013', name: 'Push Ups', muscleGroup: 'chest', equipment: 'bodyweight', category: 'push', instructions: 'Hands shoulder-width. Lower body to floor, push back up.', isCustom: false },
    { id: 'ex-014', name: 'Dips (Chest)', muscleGroup: 'chest', equipment: 'bodyweight', category: 'push', instructions: 'Lean forward on dip bars. Lower body, press back up.', isCustom: false },
    { id: 'ex-015', name: 'Close-Grip Bench Press', muscleGroup: 'chest', equipment: 'barbell', category: 'push', instructions: 'Hands shoulder-width on barbell. Lower to chest, press up.', isCustom: false },
    { id: 'ex-016', name: 'Landmine Press', muscleGroup: 'chest', equipment: 'barbell', category: 'push', instructions: 'Hold barbell end at chest. Press up and forward.', isCustom: false },

    // ── BACK ──────────────────────────────────────────
    { id: 'ex-017', name: 'Deadlift', muscleGroup: 'back', equipment: 'barbell', category: 'pull', instructions: 'Stand with feet hip-width. Hinge at hips, grip bar. Drive through heels.', isCustom: false },
    { id: 'ex-018', name: 'Sumo Deadlift', muscleGroup: 'back', equipment: 'barbell', category: 'pull', instructions: 'Wide stance, toes out. Grip bar between legs. Drive up.', isCustom: false },
    { id: 'ex-019', name: 'Romanian Deadlift', muscleGroup: 'back', equipment: 'barbell', category: 'pull', instructions: 'Slight knee bend. Hinge at hips lowering bar along legs.', isCustom: false },
    { id: 'ex-020', name: 'Barbell Row', muscleGroup: 'back', equipment: 'barbell', category: 'pull', instructions: 'Bent over at 45 degrees. Pull barbell to lower chest.', isCustom: false },
    { id: 'ex-021', name: 'Pendlay Row', muscleGroup: 'back', equipment: 'barbell', category: 'pull', instructions: 'Strict bent-over row. Bar returns to floor each rep.', isCustom: false },
    { id: 'ex-022', name: 'T-Bar Row', muscleGroup: 'back', equipment: 'barbell', category: 'pull', instructions: 'Straddle T-bar. Pull to chest, squeeze shoulder blades.', isCustom: false },
    { id: 'ex-023', name: 'Dumbbell Row', muscleGroup: 'back', equipment: 'dumbbell', category: 'pull', instructions: 'One hand on bench. Pull dumbbell to hip, squeeze lat.', isCustom: false },
    { id: 'ex-024', name: 'Dumbbell Pullover', muscleGroup: 'back', equipment: 'dumbbell', category: 'pull', instructions: 'Lie across bench. Hold dumbbell overhead, lower behind head, pull back.', isCustom: false },
    { id: 'ex-025', name: 'Pull Ups', muscleGroup: 'back', equipment: 'bodyweight', category: 'pull', instructions: 'Hang from bar, palms forward. Pull chin over bar.', isCustom: false },
    { id: 'ex-026', name: 'Chin Ups', muscleGroup: 'back', equipment: 'bodyweight', category: 'pull', instructions: 'Hang from bar, palms facing you. Pull chin over bar.', isCustom: false },
    { id: 'ex-027', name: 'Lat Pulldown', muscleGroup: 'back', equipment: 'cable', category: 'pull', instructions: 'Sit at lat pulldown machine. Pull bar to upper chest.', isCustom: false },
    { id: 'ex-028', name: 'Close-Grip Lat Pulldown', muscleGroup: 'back', equipment: 'cable', category: 'pull', instructions: 'Use V-bar attachment. Pull to upper chest, squeeze lats.', isCustom: false },
    { id: 'ex-029', name: 'Seated Cable Row', muscleGroup: 'back', equipment: 'cable', category: 'pull', instructions: 'Sit at cable row. Pull handle to lower chest, squeeze shoulder blades.', isCustom: false },
    { id: 'ex-030', name: 'Face Pull', muscleGroup: 'back', equipment: 'cable', category: 'pull', instructions: 'Set cable high with rope. Pull toward face, externally rotate.', isCustom: false },
    { id: 'ex-031', name: 'Straight Arm Pulldown', muscleGroup: 'back', equipment: 'cable', category: 'pull', instructions: 'Stand at cable. Arms straight, pull bar down to thighs.', isCustom: false },
    { id: 'ex-032', name: 'Machine Row', muscleGroup: 'back', equipment: 'machine', category: 'pull', instructions: 'Sit at row machine. Pull handles back, squeeze shoulder blades.', isCustom: false },
    { id: 'ex-033', name: 'Hyperextension', muscleGroup: 'back', equipment: 'bodyweight', category: 'pull', instructions: 'Face down on hyperextension bench. Lower torso, extend back up.', isCustom: false },
    { id: 'ex-034', name: 'Inverted Row', muscleGroup: 'back', equipment: 'bodyweight', category: 'pull', instructions: 'Hang under bar, feet on floor. Pull chest to bar.', isCustom: false },
    { id: 'ex-035', name: 'Rack Pull', muscleGroup: 'back', equipment: 'barbell', category: 'pull', instructions: 'Set bar at knee height in rack. Deadlift from this position.', isCustom: false },

    // ── LEGS ──────────────────────────────────────────
    { id: 'ex-036', name: 'Barbell Back Squat', muscleGroup: 'legs', equipment: 'barbell', category: 'legs', instructions: 'Bar on upper back. Squat down until thighs parallel. Drive up.', isCustom: false },
    { id: 'ex-037', name: 'Front Squat', muscleGroup: 'legs', equipment: 'barbell', category: 'legs', instructions: 'Bar on front delts, elbows high. Squat to parallel, drive up.', isCustom: false },
    { id: 'ex-038', name: 'Goblet Squat', muscleGroup: 'legs', equipment: 'dumbbell', category: 'legs', instructions: 'Hold dumbbell at chest. Squat deep, drive through heels.', isCustom: false },
    { id: 'ex-039', name: 'Hack Squat', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Back against pad on hack squat machine. Squat down, press up.', isCustom: false },
    { id: 'ex-040', name: 'Leg Press', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Sit in leg press machine. Press platform away, control return.', isCustom: false },
    { id: 'ex-041', name: 'Bulgarian Split Squat', muscleGroup: 'legs', equipment: 'dumbbell', category: 'legs', instructions: 'Rear foot on bench. Squat on front leg, drive up.', isCustom: false },
    { id: 'ex-042', name: 'Walking Lunges', muscleGroup: 'legs', equipment: 'dumbbell', category: 'legs', instructions: 'Step forward into lunge, alternate legs while walking.', isCustom: false },
    { id: 'ex-043', name: 'Reverse Lunge', muscleGroup: 'legs', equipment: 'dumbbell', category: 'legs', instructions: 'Step backward into lunge. Push back to standing.', isCustom: false },
    { id: 'ex-044', name: 'Leg Extension', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Sit on leg extension machine. Extend legs fully, control descent.', isCustom: false },
    { id: 'ex-045', name: 'Leg Curl (Lying)', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Lie face down on leg curl machine. Curl heels toward glutes.', isCustom: false },
    { id: 'ex-046', name: 'Seated Leg Curl', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Sit on leg curl machine. Curl heels under seat.', isCustom: false },
    { id: 'ex-047', name: 'Barbell Hip Thrust', muscleGroup: 'legs', equipment: 'barbell', category: 'legs', instructions: 'Upper back on bench, bar on hips. Drive hips up, squeeze glutes.', isCustom: false },
    { id: 'ex-048', name: 'Glute Bridge', muscleGroup: 'legs', equipment: 'bodyweight', category: 'legs', instructions: 'Lie on back, knees bent. Drive hips up, squeeze glutes.', isCustom: false },
    { id: 'ex-049', name: 'Sumo Squat', muscleGroup: 'legs', equipment: 'dumbbell', category: 'legs', instructions: 'Wide stance, toes out. Hold dumbbell between legs. Squat and drive up.', isCustom: false },
    { id: 'ex-050', name: 'Step Ups', muscleGroup: 'legs', equipment: 'dumbbell', category: 'legs', instructions: 'Step onto box or bench. Drive through heel, stand tall.', isCustom: false },
    { id: 'ex-051', name: 'Calf Raise (Standing)', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Stand on calf raise machine. Rise onto toes, lower slowly.', isCustom: false },
    { id: 'ex-052', name: 'Seated Calf Raise', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Sit on calf raise machine. Rise onto toes, lower slowly.', isCustom: false },
    { id: 'ex-053', name: 'Leg Press Calf Raise', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Use leg press with toes on edge. Press with calves only.', isCustom: false },
    { id: 'ex-054', name: 'Pistol Squat', muscleGroup: 'legs', equipment: 'bodyweight', category: 'legs', instructions: 'Stand on one leg. Squat down fully, stand back up.', isCustom: false },
    { id: 'ex-055', name: 'Nordic Hamstring Curl', muscleGroup: 'legs', equipment: 'bodyweight', category: 'legs', instructions: 'Kneel with ankles locked. Lower body forward slowly, push back up.', isCustom: false },
    { id: 'ex-056', name: 'Good Morning', muscleGroup: 'legs', equipment: 'barbell', category: 'legs', instructions: 'Bar on back. Hinge at hips, lower torso, return to standing.', isCustom: false },
    { id: 'ex-057', name: 'Dumbbell Romanian Deadlift', muscleGroup: 'legs', equipment: 'dumbbell', category: 'legs', instructions: 'Hold dumbbells. Hinge at hips, lower along legs, squeeze hamstrings.', isCustom: false },
    { id: 'ex-058', name: 'Cable Pull Through', muscleGroup: 'legs', equipment: 'cable', category: 'legs', instructions: 'Face away from low cable. Hinge hips, pull cable through legs.', isCustom: false },
    { id: 'ex-059', name: 'Hip Abduction Machine', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Sit on machine. Push legs apart against pads.', isCustom: false },
    { id: 'ex-060', name: 'Hip Adduction Machine', muscleGroup: 'legs', equipment: 'machine', category: 'legs', instructions: 'Sit on machine. Squeeze legs together against pads.', isCustom: false },

    // ── SHOULDERS ──────────────────────────────────────
    { id: 'ex-061', name: 'Overhead Press', muscleGroup: 'shoulders', equipment: 'barbell', category: 'push', instructions: 'Stand with barbell at shoulders. Press straight overhead.', isCustom: false },
    { id: 'ex-062', name: 'Seated Dumbbell Press', muscleGroup: 'shoulders', equipment: 'dumbbell', category: 'push', instructions: 'Sit on bench, dumbbells at shoulders. Press overhead.', isCustom: false },
    { id: 'ex-063', name: 'Arnold Press', muscleGroup: 'shoulders', equipment: 'dumbbell', category: 'push', instructions: 'Start palms facing you. Rotate and press overhead.', isCustom: false },
    { id: 'ex-064', name: 'Lateral Raise', muscleGroup: 'shoulders', equipment: 'dumbbell', category: 'push', instructions: 'Stand with dumbbells at sides. Raise arms to shoulder height.', isCustom: false },
    { id: 'ex-065', name: 'Cable Lateral Raise', muscleGroup: 'shoulders', equipment: 'cable', category: 'push', instructions: 'Stand sideways to cable. Raise arm to shoulder height.', isCustom: false },
    { id: 'ex-066', name: 'Front Raise', muscleGroup: 'shoulders', equipment: 'dumbbell', category: 'push', instructions: 'Hold dumbbells in front of thighs. Raise to shoulder height.', isCustom: false },
    { id: 'ex-067', name: 'Rear Delt Fly', muscleGroup: 'shoulders', equipment: 'dumbbell', category: 'pull', instructions: 'Bent over. Raise dumbbells out to sides, squeeze rear delts.', isCustom: false },
    { id: 'ex-068', name: 'Reverse Pec Deck', muscleGroup: 'shoulders', equipment: 'machine', category: 'pull', instructions: 'Face pec deck machine. Pull handles back, squeeze rear delts.', isCustom: false },
    { id: 'ex-069', name: 'Upright Row', muscleGroup: 'shoulders', equipment: 'barbell', category: 'pull', instructions: 'Hold barbell at waist. Pull up to chin, elbows high.', isCustom: false },
    { id: 'ex-070', name: 'Barbell Shrug', muscleGroup: 'shoulders', equipment: 'barbell', category: 'pull', instructions: 'Hold barbell at waist. Shrug shoulders up toward ears.', isCustom: false },
    { id: 'ex-071', name: 'Dumbbell Shrug', muscleGroup: 'shoulders', equipment: 'dumbbell', category: 'pull', instructions: 'Hold dumbbells at sides. Shrug shoulders up toward ears.', isCustom: false },
    { id: 'ex-072', name: 'Machine Shoulder Press', muscleGroup: 'shoulders', equipment: 'machine', category: 'push', instructions: 'Sit at shoulder press machine. Press handles overhead.', isCustom: false },
    { id: 'ex-073', name: 'Face Pull', muscleGroup: 'shoulders', equipment: 'cable', category: 'pull', instructions: 'Cable at face height with rope. Pull toward face, externally rotate.', isCustom: false },
    { id: 'ex-074', name: 'Push Press', muscleGroup: 'shoulders', equipment: 'barbell', category: 'push', instructions: 'Slight knee dip, drive barbell overhead using leg momentum.', isCustom: false },
    { id: 'ex-075', name: 'Handstand Push Up', muscleGroup: 'shoulders', equipment: 'bodyweight', category: 'push', instructions: 'Handstand against wall. Lower head to floor, press up.', isCustom: false },

    // ── ARMS ──────────────────────────────────────────
    { id: 'ex-076', name: 'Barbell Bicep Curl', muscleGroup: 'arms', equipment: 'barbell', category: 'pull', instructions: 'Stand with barbell. Curl to shoulders, control descent.', isCustom: false },
    { id: 'ex-077', name: 'EZ-Bar Curl', muscleGroup: 'arms', equipment: 'barbell', category: 'pull', instructions: 'Use EZ-bar. Curl to shoulders with angled grip.', isCustom: false },
    { id: 'ex-078', name: 'Dumbbell Bicep Curl', muscleGroup: 'arms', equipment: 'dumbbell', category: 'pull', instructions: 'Stand with dumbbells. Curl to shoulders, control descent.', isCustom: false },
    { id: 'ex-079', name: 'Hammer Curl', muscleGroup: 'arms', equipment: 'dumbbell', category: 'pull', instructions: 'Stand with dumbbells, palms facing in. Curl to shoulders.', isCustom: false },
    { id: 'ex-080', name: 'Incline Dumbbell Curl', muscleGroup: 'arms', equipment: 'dumbbell', category: 'pull', instructions: 'Sit on incline bench. Let arms hang, curl dumbbells up.', isCustom: false },
    { id: 'ex-081', name: 'Concentration Curl', muscleGroup: 'arms', equipment: 'dumbbell', category: 'pull', instructions: 'Sit, elbow on inner thigh. Curl dumbbell, squeeze bicep.', isCustom: false },
    { id: 'ex-082', name: 'Preacher Curl', muscleGroup: 'arms', equipment: 'barbell', category: 'pull', instructions: 'Arms on preacher bench. Curl barbell up, control descent.', isCustom: false },
    { id: 'ex-083', name: 'Cable Bicep Curl', muscleGroup: 'arms', equipment: 'cable', category: 'pull', instructions: 'Stand at low cable. Curl bar to shoulders.', isCustom: false },
    { id: 'ex-084', name: 'Spider Curl', muscleGroup: 'arms', equipment: 'dumbbell', category: 'pull', instructions: 'Lean over incline bench. Curl dumbbells with arms hanging.', isCustom: false },
    { id: 'ex-085', name: 'Tricep Pushdown', muscleGroup: 'arms', equipment: 'cable', category: 'push', instructions: 'Stand at cable machine. Push bar down, extend arms fully.', isCustom: false },
    { id: 'ex-086', name: 'Rope Tricep Pushdown', muscleGroup: 'arms', equipment: 'cable', category: 'push', instructions: 'Use rope attachment. Push down and spread rope at bottom.', isCustom: false },
    { id: 'ex-087', name: 'Overhead Tricep Extension', muscleGroup: 'arms', equipment: 'dumbbell', category: 'push', instructions: 'Hold dumbbell overhead. Lower behind head, extend back up.', isCustom: false },
    { id: 'ex-088', name: 'Skull Crushers', muscleGroup: 'arms', equipment: 'barbell', category: 'push', instructions: 'Lie on bench. Lower barbell to forehead, extend arms.', isCustom: false },
    { id: 'ex-089', name: 'Tricep Dips', muscleGroup: 'arms', equipment: 'bodyweight', category: 'push', instructions: 'Upright on dip bars. Lower body, press back up.', isCustom: false },
    { id: 'ex-090', name: 'Diamond Push Ups', muscleGroup: 'arms', equipment: 'bodyweight', category: 'push', instructions: 'Hands together in diamond shape. Push up focusing on triceps.', isCustom: false },
    { id: 'ex-091', name: 'Cable Overhead Tricep Ext.', muscleGroup: 'arms', equipment: 'cable', category: 'push', instructions: 'Face away from cable. Extend rope overhead.', isCustom: false },
    { id: 'ex-092', name: 'Tricep Kickback', muscleGroup: 'arms', equipment: 'dumbbell', category: 'push', instructions: 'Bent over. Extend dumbbell behind you, squeeze tricep.', isCustom: false },
    { id: 'ex-093', name: 'Wrist Curl', muscleGroup: 'arms', equipment: 'dumbbell', category: 'pull', instructions: 'Forearms on bench, palms up. Curl wrists up.', isCustom: false },
    { id: 'ex-094', name: 'Reverse Wrist Curl', muscleGroup: 'arms', equipment: 'dumbbell', category: 'pull', instructions: 'Forearms on bench, palms down. Curl wrists up.', isCustom: false },

    // ── CORE ──────────────────────────────────────────
    { id: 'ex-095', name: 'Plank', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Hold push-up position on forearms. Keep body straight.', isCustom: false },
    { id: 'ex-096', name: 'Side Plank', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Lie on side, forearm on floor. Raise hips, hold.', isCustom: false },
    { id: 'ex-097', name: 'Crunches', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Lie on back, knees bent. Curl upper body toward knees.', isCustom: false },
    { id: 'ex-098', name: 'Bicycle Crunches', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Lie on back. Bring opposite elbow to knee, alternating.', isCustom: false },
    { id: 'ex-099', name: 'Hanging Leg Raise', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Hang from bar. Raise legs to 90 degrees, lower slowly.', isCustom: false },
    { id: 'ex-100', name: 'Hanging Knee Raise', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Hang from bar. Bring knees to chest, lower slowly.', isCustom: false },
    { id: 'ex-101', name: 'Cable Crunch', muscleGroup: 'core', equipment: 'cable', category: 'core', instructions: 'Kneel at cable machine. Crunch down, bringing elbows to knees.', isCustom: false },
    { id: 'ex-102', name: 'Cable Woodchop', muscleGroup: 'core', equipment: 'cable', category: 'core', instructions: 'Set cable high. Pull diagonally across body to opposite knee.', isCustom: false },
    { id: 'ex-103', name: 'Russian Twist', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Sit with torso leaned back. Rotate side to side.', isCustom: false },
    { id: 'ex-104', name: 'Ab Rollout', muscleGroup: 'core', equipment: 'other', category: 'core', instructions: 'Kneel with ab wheel. Roll forward, extend body, roll back.', isCustom: false },
    { id: 'ex-105', name: 'Mountain Climbers', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Plank position. Drive knees to chest alternating rapidly.', isCustom: false },
    { id: 'ex-106', name: 'Dead Bug', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Lie on back, arms and legs up. Lower opposite arm and leg.', isCustom: false },
    { id: 'ex-107', name: 'Pallof Press', muscleGroup: 'core', equipment: 'cable', category: 'core', instructions: 'Stand sideways to cable. Press handle straight out, resist rotation.', isCustom: false },
    { id: 'ex-108', name: 'Decline Sit Up', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Lie on decline bench, feet locked. Sit up fully.', isCustom: false },
    { id: 'ex-109', name: 'V-Ups', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Lie flat. Raise legs and torso simultaneously to form V shape.', isCustom: false },
    { id: 'ex-110', name: 'Flutter Kicks', muscleGroup: 'core', equipment: 'bodyweight', category: 'core', instructions: 'Lie on back, legs slightly raised. Kick legs up and down alternating.', isCustom: false },

    // ── CARDIO ──────────────────────────────────────────
    { id: 'ex-111', name: 'Treadmill Running', muscleGroup: 'legs', equipment: 'machine', category: 'cardio', instructions: 'Run on treadmill at desired pace and incline.', isCustom: false },
    { id: 'ex-112', name: 'Treadmill Walking', muscleGroup: 'legs', equipment: 'machine', category: 'cardio', instructions: 'Walk on treadmill. Increase incline for intensity.', isCustom: false },
    { id: 'ex-113', name: 'Stationary Bike', muscleGroup: 'legs', equipment: 'machine', category: 'cardio', instructions: 'Pedal at steady pace. Adjust resistance as needed.', isCustom: false },
    { id: 'ex-114', name: 'Elliptical', muscleGroup: 'legs', equipment: 'machine', category: 'cardio', instructions: 'Use elliptical machine at desired resistance and pace.', isCustom: false },
    { id: 'ex-115', name: 'Rowing Machine', muscleGroup: 'back', equipment: 'machine', category: 'cardio', instructions: 'Drive with legs, pull handle to chest, return with control.', isCustom: false },
    { id: 'ex-116', name: 'Stair Climber', muscleGroup: 'legs', equipment: 'machine', category: 'cardio', instructions: 'Step on stair machine at desired pace.', isCustom: false },
    { id: 'ex-117', name: 'Jump Rope', muscleGroup: 'legs', equipment: 'other', category: 'cardio', instructions: 'Swing rope overhead, jump with both feet. Keep jumps small.', isCustom: false },
    { id: 'ex-118', name: 'Burpees', muscleGroup: 'core', equipment: 'bodyweight', category: 'cardio', instructions: 'Squat, jump feet back to plank, push up, jump feet forward, jump up.', isCustom: false },
    { id: 'ex-119', name: 'Box Jumps', muscleGroup: 'legs', equipment: 'other', category: 'cardio', instructions: 'Stand before box. Jump onto it landing softly. Step down.', isCustom: false },
    { id: 'ex-120', name: 'Battle Ropes', muscleGroup: 'arms', equipment: 'other', category: 'cardio', instructions: 'Hold rope ends. Create waves by alternating arm slams.', isCustom: false },
    { id: 'ex-121', name: 'Assault Bike', muscleGroup: 'legs', equipment: 'machine', category: 'cardio', instructions: 'Pedal and push/pull handles for full-body cardio.', isCustom: false },
    { id: 'ex-122', name: 'Sled Push', muscleGroup: 'legs', equipment: 'other', category: 'cardio', instructions: 'Push weighted sled across floor, driving through legs.', isCustom: false },
    { id: 'ex-123', name: 'Kettlebell Swing', muscleGroup: 'legs', equipment: 'other', category: 'cardio', instructions: 'Hinge at hips, swing kettlebell to shoulder height.', isCustom: false },
    { id: 'ex-124', name: 'Jumping Jacks', muscleGroup: 'legs', equipment: 'bodyweight', category: 'cardio', instructions: 'Jump feet wide while raising arms. Jump back to start.', isCustom: false },
    { id: 'ex-125', name: 'High Knees', muscleGroup: 'legs', equipment: 'bodyweight', category: 'cardio', instructions: 'Run in place bringing knees to waist height rapidly.', isCustom: false },
    { id: 'ex-126', name: 'Sprints', muscleGroup: 'legs', equipment: 'bodyweight', category: 'cardio', instructions: 'Sprint at max effort for set distance or time.', isCustom: false },
];

export const CATEGORY_LABELS: Record<Category, string> = {
    push: 'Push',
    pull: 'Pull',
    legs: 'Legs',
    core: 'Core',
    cardio: 'Cardio',
};

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
