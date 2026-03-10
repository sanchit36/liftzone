import * as SQLite from 'expo-sqlite';
import { SEED_EXERCISES } from '../data/exercises';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
    if (!db) {
        db = SQLite.openDatabaseSync('liftzeno.db');
    }
    return db;
}

// ─── INIT ────────────────────────────────────────────────────
export function initDatabase(): void {
    const database = getDatabase();

    database.execSync(`PRAGMA journal_mode = WAL;`);
    database.execSync(`PRAGMA foreign_keys = ON;`);

    database.execSync(`
        CREATE TABLE IF NOT EXISTS exercises (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            muscle_group TEXT NOT NULL,
            equipment TEXT NOT NULL,
            category TEXT NOT NULL,
            instructions TEXT NOT NULL DEFAULT '',
            is_custom INTEGER NOT NULL DEFAULT 0
        );
    `);

    database.execSync(`
        CREATE TABLE IF NOT EXISTS routines (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            icon TEXT,
            created_at INTEGER NOT NULL
        );
    `);

    database.execSync(`
        CREATE TABLE IF NOT EXISTS routine_exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            routine_id TEXT NOT NULL,
            exercise_id TEXT NOT NULL,
            order_index INTEGER NOT NULL DEFAULT 0,
            rest_timer INTEGER NOT NULL DEFAULT 0,
            sets_template TEXT NOT NULL DEFAULT '[]',
            FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE,
            FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
        );
    `);

    database.execSync(`
        CREATE TABLE IF NOT EXISTS workouts (
            id TEXT PRIMARY KEY NOT NULL,
            routine_id TEXT,
            routine_name TEXT NOT NULL,
            started_at INTEGER NOT NULL,
            ended_at INTEGER NOT NULL
        );
    `);

    database.execSync(`
        CREATE TABLE IF NOT EXISTS workout_exercises (
            id TEXT PRIMARY KEY NOT NULL,
            workout_id TEXT NOT NULL,
            exercise_id TEXT NOT NULL,
            order_index INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
            FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
        );
    `);

    database.execSync(`
        CREATE TABLE IF NOT EXISTS workout_sets (
            id TEXT PRIMARY KEY NOT NULL,
            workout_exercise_id TEXT NOT NULL,
            set_index INTEGER NOT NULL DEFAULT 0,
            weight REAL NOT NULL DEFAULT 0,
            reps INTEGER NOT NULL DEFAULT 0,
            completed INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
        );
    `);

    database.execSync(`
        CREATE TABLE IF NOT EXISTS measurements (
            id TEXT PRIMARY KEY NOT NULL,
            type TEXT NOT NULL,
            value REAL NOT NULL,
            unit TEXT NOT NULL,
            date INTEGER NOT NULL
        );
    `);

    database.execSync(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL
        );
    `);

    // Seed exercises if empty
    seedExercises(database);
}

function seedExercises(database: SQLite.SQLiteDatabase): void {
    const result = database.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM exercises');
    if (result && result.count > 0) return;

    const stmt = database.prepareSync(
        'INSERT INTO exercises (id, name, muscle_group, equipment, category, instructions, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    try {
        database.execSync('BEGIN TRANSACTION;');
        for (const ex of SEED_EXERCISES) {
            stmt.executeSync(ex.id, ex.name, ex.muscleGroup, ex.equipment, ex.category, ex.instructions, ex.isCustom ? 1 : 0);
        }
        database.execSync('COMMIT;');
    } catch (e) {
        database.execSync('ROLLBACK;');
        throw e;
    } finally {
        stmt.finalizeSync();
    }
}

// ─── EXERCISE QUERIES ─────────────────────────────────────────
export interface ExerciseRow {
    id: string;
    name: string;
    muscle_group: string;
    equipment: string;
    category: string;
    instructions: string;
    is_custom: number;
}

export function getAllExercises(): ExerciseRow[] {
    return getDatabase().getAllSync<ExerciseRow>('SELECT * FROM exercises ORDER BY name');
}

export function insertExercise(ex: ExerciseRow): void {
    getDatabase().runSync(
        'INSERT INTO exercises (id, name, muscle_group, equipment, category, instructions, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ex.id, ex.name, ex.muscle_group, ex.equipment, ex.category, ex.instructions, ex.is_custom
    );
}

export function deleteExercise(id: string): void {
    getDatabase().runSync('DELETE FROM exercises WHERE id = ?', id);
}

// ─── ROUTINE QUERIES ──────────────────────────────────────────
export interface RoutineRow {
    id: string;
    name: string;
    icon: string | null;
    created_at: number;
}

export interface RoutineExerciseRow {
    id: number;
    routine_id: string;
    exercise_id: string;
    order_index: number;
    rest_timer: number;
    sets_template: string; // JSON
}

export function getAllRoutines(): RoutineRow[] {
    return getDatabase().getAllSync<RoutineRow>('SELECT * FROM routines ORDER BY created_at DESC');
}

export function getRoutineExercises(routineId: string): RoutineExerciseRow[] {
    return getDatabase().getAllSync<RoutineExerciseRow>(
        'SELECT * FROM routine_exercises WHERE routine_id = ? ORDER BY order_index', routineId
    );
}

export function insertRoutine(id: string, name: string, icon: string | null, createdAt: number): void {
    getDatabase().runSync('INSERT INTO routines (id, name, icon, created_at) VALUES (?, ?, ?, ?)', id, name, icon, createdAt);
}

export function insertRoutineExercise(routineId: string, exerciseId: string, orderIndex: number, restTimer: number, setsTemplate: string): void {
    getDatabase().runSync(
        'INSERT INTO routine_exercises (routine_id, exercise_id, order_index, rest_timer, sets_template) VALUES (?, ?, ?, ?, ?)',
        routineId, exerciseId, orderIndex, restTimer, setsTemplate
    );
}

export function updateRoutineRow(id: string, name: string, icon: string | null): void {
    getDatabase().runSync('UPDATE routines SET name = ?, icon = ? WHERE id = ?', name, icon, id);
}

export function deleteRoutineExercises(routineId: string): void {
    getDatabase().runSync('DELETE FROM routine_exercises WHERE routine_id = ?', routineId);
}

export function deleteRoutine(id: string): void {
    getDatabase().runSync('DELETE FROM routine_exercises WHERE routine_id = ?', id);
    getDatabase().runSync('DELETE FROM routines WHERE id = ?', id);
}

// ─── WORKOUT QUERIES ──────────────────────────────────────────
export interface WorkoutRow {
    id: string;
    routine_id: string | null;
    routine_name: string;
    started_at: number;
    ended_at: number;
}

export interface WorkoutExerciseRow {
    id: string;
    workout_id: string;
    exercise_id: string;
    order_index: number;
}

export interface WorkoutSetRow {
    id: string;
    workout_exercise_id: string;
    set_index: number;
    weight: number;
    reps: number;
    completed: number;
}

export function getAllWorkouts(): WorkoutRow[] {
    return getDatabase().getAllSync<WorkoutRow>('SELECT * FROM workouts ORDER BY started_at DESC');
}

export function getWorkoutExercises(workoutId: string): WorkoutExerciseRow[] {
    return getDatabase().getAllSync<WorkoutExerciseRow>(
        'SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY order_index', workoutId
    );
}

export function getWorkoutSets(workoutExerciseId: string): WorkoutSetRow[] {
    return getDatabase().getAllSync<WorkoutSetRow>(
        'SELECT * FROM workout_sets WHERE workout_exercise_id = ? ORDER BY set_index', workoutExerciseId
    );
}

export function insertWorkout(w: WorkoutRow): void {
    getDatabase().runSync(
        'INSERT INTO workouts (id, routine_id, routine_name, started_at, ended_at) VALUES (?, ?, ?, ?, ?)',
        w.id, w.routine_id, w.routine_name, w.started_at, w.ended_at
    );
}

export function insertWorkoutExercise(we: WorkoutExerciseRow): void {
    getDatabase().runSync(
        'INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index) VALUES (?, ?, ?, ?)',
        we.id, we.workout_id, we.exercise_id, we.order_index
    );
}

export function insertWorkoutSet(ws: WorkoutSetRow): void {
    getDatabase().runSync(
        'INSERT INTO workout_sets (id, workout_exercise_id, set_index, weight, reps, completed) VALUES (?, ?, ?, ?, ?, ?)',
        ws.id, ws.workout_exercise_id, ws.set_index, ws.weight, ws.reps, ws.completed
    );
}

export function deleteWorkout(id: string): void {
    getDatabase().runSync('DELETE FROM workout_sets WHERE workout_exercise_id IN (SELECT id FROM workout_exercises WHERE workout_id = ?)', id);
    getDatabase().runSync('DELETE FROM workout_exercises WHERE workout_id = ?', id);
    getDatabase().runSync('DELETE FROM workouts WHERE id = ?', id);
}

export function getPreviousSetsForExercise(exerciseId: string): WorkoutSetRow[] | null {
    // Find the most recent workout that included this exercise
    const row = getDatabase().getFirstSync<{ id: string }>(
        `SELECT we.id FROM workout_exercises we
         JOIN workouts w ON we.workout_id = w.id
         WHERE we.exercise_id = ?
         ORDER BY w.started_at DESC LIMIT 1`,
        exerciseId
    );
    if (!row) return null;
    return getWorkoutSets(row.id);
}

// ─── MEASUREMENT QUERIES ──────────────────────────────────────
export interface MeasurementRow {
    id: string;
    type: string;
    value: number;
    unit: string;
    date: number;
}

export function getAllMeasurements(): MeasurementRow[] {
    return getDatabase().getAllSync<MeasurementRow>('SELECT * FROM measurements ORDER BY date DESC');
}

export function insertMeasurement(m: MeasurementRow): void {
    getDatabase().runSync(
        'INSERT INTO measurements (id, type, value, unit, date) VALUES (?, ?, ?, ?, ?)',
        m.id, m.type, m.value, m.unit, m.date
    );
}

export function deleteMeasurement(id: string): void {
    getDatabase().runSync('DELETE FROM measurements WHERE id = ?', id);
}

export function hasMeasurementToday(type: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const row = getDatabase().getFirstSync<{ count: number }>(
        'SELECT COUNT(*) as count FROM measurements WHERE type = ? AND date >= ? AND date < ?',
        type, today.getTime(), tomorrow.getTime()
    );
    return (row?.count ?? 0) > 0;
}

// ─── SETTINGS QUERIES ─────────────────────────────────────────
export function getSetting(key: string): string | null {
    const row = getDatabase().getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
    return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
    getDatabase().runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
}
