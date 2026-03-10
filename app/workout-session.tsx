import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, TextInputProps } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useWorkoutStore } from '../store/workoutStore';
import { useExerciseStore } from '../store/exerciseStore';
import { useRoutineStore } from '../store/routineStore';
import { useSettingsStore } from '../store/settingsStore';
import { useThemeColors } from '../hooks/useThemeColors';

/** A text input that handles decimals properly by using local string state and committing on blur. */
function NumericInput({ numericValue, onValueChange, isDecimal, style, ...rest }: {
    numericValue: number;
    onValueChange: (val: number) => void;
    isDecimal?: boolean;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'keyboardType'>) {
    const [text, setText] = useState(numericValue > 0 ? String(numericValue) : '');
    const isFocused = useRef(false);

    // Sync from store when not focused (e.g. external updates)
    useEffect(() => {
        if (!isFocused.current) {
            setText(numericValue > 0 ? String(numericValue) : '');
        }
    }, [numericValue]);

    const handleChange = useCallback((t: string) => {
        // Allow digits, and a single dot for decimal fields
        if (isDecimal) {
            const cleaned = t.replace(/[^0-9.]/g, '');
            const parts = cleaned.split('.');
            if (parts.length > 2) return; // reject multiple dots
            if (parts[1] && parts[1].length > 1) return; // max 1 decimal place
            setText(cleaned);
        } else {
            setText(t.replace(/[^0-9]/g, ''));
        }
    }, [isDecimal]);

    const handleBlur = useCallback(() => {
        isFocused.current = false;
        const parsed = isDecimal ? parseFloat(text) : parseInt(text, 10);
        const val = isNaN(parsed) ? 0 : parsed;
        onValueChange(val);
        setText(val > 0 ? String(val) : '');
    }, [text, isDecimal, onValueChange]);

    return (
        <TextInput
            {...rest}
            style={style}
            keyboardType={isDecimal ? 'decimal-pad' : 'number-pad'}
            value={text}
            onChangeText={handleChange}
            onFocus={() => { isFocused.current = true; }}
            onBlur={handleBlur}
        />
    );
}

export default function WorkoutSessionScreen() {
    const router = useRouter();
    const { activeWorkout, finishWorkout, cancelWorkout, addSet, removeSet, removeExerciseFromWorkout, updateSet, completeSet, startRestTimer, clearRestTimer } = useWorkoutStore();
    const { getExerciseById } = useExerciseStore();
    const { weightUnit, restTimerEnabled } = useSettingsStore();
    const c = useThemeColors();

    const [elapsed, setElapsed] = useState(0);
    const [restRemaining, setRestRemaining] = useState(0);
    const startTimeRef = useRef(activeWorkout?.startedAt || Date.now());

    useEffect(() => {
        if (!activeWorkout) {
            const { startWorkout } = useWorkoutStore.getState();
            startWorkout(undefined, 'Quick Workout', []);
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!activeWorkout?.restTimerEnd) { setRestRemaining(0); return; }
        const timer = setInterval(() => {
            const remaining = Math.max(0, Math.floor((activeWorkout.restTimerEnd! - Date.now()) / 1000));
            setRestRemaining(remaining);
            if (remaining <= 0) clearRestTimer();
        }, 100);
        return () => clearInterval(timer);
    }, [activeWorkout?.restTimerEnd]);

    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleFinish = () => {
        Alert.alert('Finish Workout', 'Are you sure you want to finish this workout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Finish', onPress: () => { finishWorkout(); router.back(); } },
        ]);
    };

    const handleCancel = () => {
        Alert.alert('Discard Workout', 'Are you sure? All data will be lost.', [
            { text: 'Keep Training', style: 'cancel' },
            { text: 'Discard', style: 'destructive', onPress: () => { cancelWorkout(); router.back(); } },
        ]);
    };

    const handleCompleteSet = (weId: string, setId: string, exerciseId: string) => {
        completeSet(weId, setId);
        const routineId = activeWorkout?.routineId;
        if (routineId) {
            const routine = useRoutineStore.getState().getRoutineById(routineId);
            const template = routine?.exerciseTemplates?.find((t) => t.exerciseId === exerciseId);
            if (template && template.restTimer > 0) { startRestTimer(template.restTimer); return; }
        }
        if (restTimerEnabled) startRestTimer(90);
    };

    const handleAddExercise = () => { router.push('/add-exercises'); };

    const handleRemoveExercise = (weId: string, exerciseName: string) => {
        Alert.alert('Remove Exercise', `Remove "${exerciseName}" from this workout?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => removeExerciseFromWorkout(weId) },
        ]);
    };

    const handleRemoveSet = (weId: string, setId: string, setsCount: number) => {
        if (setsCount <= 1) {
            Alert.alert('Cannot Remove', 'Each exercise must have at least one set.');
            return;
        }
        removeSet(weId, setId);
    };

    if (!activeWorkout) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: c.textSecondary }]}>Starting workout...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const unitLabel = weightUnit.toUpperCase();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity style={styles.closeBtn} onPress={handleCancel}>
                    <MaterialIcons name="close" size={24} color={c.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerLabel, { color: c.textSecondary }]}>ACTIVE SESSION</Text>
                    <View style={styles.timerRow}>
                        <Text style={[styles.timerText, { color: c.text }]}>{formatTime(elapsed)}</Text>
                        <View style={styles.liveDot} />
                    </View>
                </View>
                <TouchableOpacity onPress={handleFinish}>
                    <Text style={styles.finishBtn}>Finish</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeWorkout.exercises.map((we) => {
                    const exercise = getExerciseById(we.exerciseId);
                    if (!exercise) return null;

                    return (
                        <View key={we.id} style={styles.exerciseBlock}>
                            <View style={styles.exerciseHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.exerciseName, { color: c.text }]}>{exercise.name}</Text>
                                    <Text style={[styles.exerciseMuscle, { color: c.textSecondary }]}>{exercise.muscleGroup}</Text>
                                </View>
                                <TouchableOpacity style={styles.removeExBtn} onPress={() => handleRemoveExercise(we.id, exercise.name)}>
                                    <MaterialIcons name="delete-outline" size={20} color="#e74c3c" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.setHeaderRow}>
                                <Text style={[styles.setHeaderText, { width: 40, textAlign: 'center', color: c.textTertiary }]}>SET</Text>
                                <Text style={[styles.setHeaderText, { flex: 1, color: c.textTertiary }]}>PREVIOUS</Text>
                                <Text style={[styles.setHeaderText, { width: 60, textAlign: 'center', color: c.textTertiary }]}>{unitLabel}</Text>
                                <Text style={[styles.setHeaderText, { width: 60, textAlign: 'center', color: c.textTertiary }]}>REPS</Text>
                                <View style={{ width: 36 }} />
                            </View>

                            {we.sets.map((s, si) => {
                                const prevSets = useWorkoutStore.getState().getPreviousSets(we.exerciseId);
                                const prev = prevSets?.[si];

                                return (
                                    <View key={s.id} style={[
                                        styles.setRow,
                                        { backgroundColor: c.card, borderColor: c.border },
                                        s.completed && styles.setRowCompleted,
                                        !s.completed && si > 0 && !we.sets[si - 1]?.completed && styles.setRowDimmed
                                    ]}>
                                        <Text style={[styles.setNum, { color: c.textTertiary }, s.completed && styles.setNumCompleted]}>{si + 1}</Text>
                                        <Text style={[styles.prevText, { color: c.textSecondary }]}>
                                            {prev ? `${prev.weight} ${weightUnit} × ${prev.reps}` : '—'}
                                        </Text>
                                        <NumericInput
                                            style={[styles.input, { backgroundColor: c.background, color: c.text }]}
                                            isDecimal
                                            placeholder={prev ? `${prev.weight}` : '0'}
                                            placeholderTextColor={c.textTertiary}
                                            numericValue={s.weight}
                                            onValueChange={(v) => updateSet(we.id, s.id, 'weight', v)}
                                        />
                                        <NumericInput
                                            style={[styles.input, { backgroundColor: c.background, color: c.text }]}
                                            placeholder={prev ? `${prev.reps}` : '0'}
                                            placeholderTextColor={c.textTertiary}
                                            numericValue={s.reps}
                                            onValueChange={(v) => updateSet(we.id, s.id, 'reps', v)}
                                        />
                                        <TouchableOpacity
                                            style={[styles.checkBtn, { backgroundColor: c.borderDark }, s.completed && styles.checkBtnCompleted]}
                                            onPress={() => handleCompleteSet(we.id, s.id, we.exerciseId)}
                                        >
                                            <MaterialIcons name="check" size={20} color={s.completed ? '#000' : c.textTertiary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.removeSetBtn}
                                            onPress={() => handleRemoveSet(we.id, s.id, we.sets.length)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <MaterialIcons name="remove-circle-outline" size={18} color={c.textTertiary} />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}

                            <TouchableOpacity style={[styles.addSetBtn, { backgroundColor: c.borderDark }]} onPress={() => addSet(we.id)}>
                                <MaterialIcons name="add" size={18} color={c.text} />
                                <Text style={[styles.addSetText, { color: c.text }]}>Add Set</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}

                {activeWorkout.exercises.length === 0 && (
                    <View style={styles.noExercises}>
                        <MaterialIcons name="fitness-center" size={48} color={c.textTertiary} />
                        <Text style={[styles.noExercisesText, { color: c.textSecondary }]}>No exercises yet. Add one below!</Text>
                    </View>
                )}
            </ScrollView>

            {/* Rest Timer (floating) */}
            {restRemaining > 0 && (
                <View style={styles.restTimer}>
                    <View style={styles.restTimerInner}>
                        <View style={styles.restTimerLeft}>
                            <MaterialIcons name="timer" size={22} color={Colors.primary} />
                            <Text style={styles.restTimerText}>Resting: <Text style={styles.restTimerBold}>{formatTime(restRemaining)}</Text></Text>
                        </View>
                        <View style={styles.restTimerRight}>
                            <TouchableOpacity onPress={() => startRestTimer(restRemaining + 30)}>
                                <Text style={styles.restTimerAction}>+30s</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={clearRestTimer}>
                                <Text style={[styles.restTimerSkip, { color: c.textTertiary }]}>Skip</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Bottom Actions */}
            <View style={[styles.bottomActions, { backgroundColor: c.background, borderTopColor: c.border }]}>
                <TouchableOpacity style={styles.addExerciseBtn} onPress={handleAddExercise}>
                    <MaterialIcons name="add-circle" size={22} color={Colors.primary} />
                    <Text style={styles.addExerciseBtnText}>Add Exercise</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.finishWorkoutBtn} onPress={handleFinish}>
                    <MaterialIcons name="done-all" size={22} color="#000" />
                    <Text style={styles.finishWorkoutBtnText}>Finish Workout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.base },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    closeBtn: { padding: Spacing.sm, borderRadius: BorderRadius.full },
    headerCenter: { alignItems: 'center' },
    headerLabel: { fontSize: 10, fontFamily: 'Lexend_500Medium', textTransform: 'uppercase', letterSpacing: 1.5 },
    timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    timerText: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', fontVariant: ['tabular-nums'] },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
    finishBtn: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.primary, paddingHorizontal: Spacing.sm },

    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 200 },

    exerciseBlock: { paddingHorizontal: Spacing.base, paddingTop: Spacing.xl },
    exerciseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.base },
    exerciseName: { fontSize: FontSize.xxl, fontFamily: 'Lexend_700Bold' },
    exerciseMuscle: { fontSize: FontSize.sm, fontFamily: 'Lexend_400Regular', textTransform: 'capitalize', marginTop: 2 },
    removeExBtn: { padding: Spacing.sm, backgroundColor: 'rgba(231,76,60,0.1)', borderRadius: BorderRadius.sm },
    removeSetBtn: { paddingLeft: 4 },

    setHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, paddingHorizontal: 4 },
    setHeaderText: { fontSize: 10, fontFamily: 'Lexend_700Bold', textTransform: 'uppercase', letterSpacing: 1.5 },

    setRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        borderRadius: BorderRadius.sm, padding: 6, marginBottom: Spacing.sm, borderWidth: 1,
    },
    setRowCompleted: { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryMedium },
    setRowDimmed: { opacity: 0.6 },
    setNum: { width: 40, textAlign: 'center', fontFamily: 'Lexend_700Bold', fontSize: FontSize.base },
    setNumCompleted: { color: Colors.primary },
    prevText: { flex: 1, fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium' },
    input: {
        width: 60, borderRadius: 6, textAlign: 'center',
        fontFamily: 'Lexend_700Bold', fontSize: FontSize.sm, paddingVertical: 6, paddingHorizontal: 4,
    },
    checkBtn: {
        width: 36, height: 36, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
    },
    checkBtnCompleted: { backgroundColor: Colors.primary },

    addSetBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        marginTop: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    },
    addSetText: { fontFamily: 'Lexend_600SemiBold', fontSize: FontSize.sm },

    noExercises: { alignItems: 'center', paddingTop: 80, gap: Spacing.base },
    noExercisesText: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.md },

    restTimer: { position: 'absolute', bottom: 100, left: '5%', right: '5%' },
    restTimerInner: {
        backgroundColor: '#1a1a1a', borderRadius: BorderRadius.full,
        paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1, borderColor: 'rgba(19,236,106,0.3)',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
    },
    restTimerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    restTimerText: { fontSize: FontSize.sm, fontFamily: 'Lexend_500Medium', color: '#fff' },
    restTimerBold: { fontFamily: 'Lexend_700Bold', fontVariant: ['tabular-nums'] },
    restTimerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
    restTimerAction: { fontSize: FontSize.xs, fontFamily: 'Lexend_700Bold', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
    restTimerSkip: { fontSize: FontSize.xs, fontFamily: 'Lexend_700Bold', textTransform: 'uppercase', letterSpacing: 1 },

    bottomActions: {
        flexDirection: 'row', gap: Spacing.md,
        paddingHorizontal: Spacing.base, paddingTop: Spacing.base, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        borderTopWidth: 1,
    },
    addExerciseBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        paddingVertical: Spacing.base, borderRadius: BorderRadius.lg, backgroundColor: Colors.primaryMedium,
    },
    addExerciseBtnText: { fontFamily: 'Lexend_700Bold', fontSize: FontSize.base, color: Colors.primary },
    finishWorkoutBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        paddingVertical: Spacing.base, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary,
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    finishWorkoutBtnText: { fontFamily: 'Lexend_700Bold', fontSize: FontSize.base, color: '#000' },
});
