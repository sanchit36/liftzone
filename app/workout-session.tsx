import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useWorkoutStore } from '../store/workoutStore';
import { useExerciseStore } from '../store/exerciseStore';
import { useSettingsStore } from '../store/settingsStore';

export default function WorkoutSessionScreen() {
    const router = useRouter();
    const { activeWorkout, finishWorkout, cancelWorkout, addExerciseToWorkout, addSet, removeSet, updateSet, completeSet, startRestTimer, clearRestTimer } = useWorkoutStore();
    const { getExerciseById } = useExerciseStore();
    const { weightUnit, restTimerEnabled } = useSettingsStore();

    const [elapsed, setElapsed] = useState(0);
    const [restRemaining, setRestRemaining] = useState(0);
    const startTimeRef = useRef(activeWorkout?.startedAt || Date.now());

    // Quick-start if no active workout
    useEffect(() => {
        if (!activeWorkout) {
            const { startWorkout } = useWorkoutStore.getState();
            startWorkout(undefined, 'Quick Workout', []);
        }
    }, []);

    // Elapsed timer
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Rest timer
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

    const handleCompleteSet = (weId: string, setId: string) => {
        completeSet(weId, setId);
        if (restTimerEnabled) startRestTimer(90);
    };

    const handleAddExercise = () => {
        router.push('/add-exercises');
    };

    if (!activeWorkout) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Starting workout...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const unitLabel = weightUnit.toUpperCase();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeBtn} onPress={handleCancel}>
                    <MaterialIcons name="close" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerLabel}>ACTIVE SESSION</Text>
                    <View style={styles.timerRow}>
                        <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
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
                            {/* Exercise Header */}
                            <View style={styles.exerciseHeader}>
                                <View>
                                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                                    <Text style={styles.exerciseMuscle}>{exercise.muscleGroup}</Text>
                                </View>
                                <TouchableOpacity style={styles.moreBtn}>
                                    <MaterialIcons name="more-horiz" size={24} color={Colors.primary} />
                                </TouchableOpacity>
                            </View>

                            {/* Set Headers */}
                            <View style={styles.setHeaderRow}>
                                <Text style={[styles.setHeaderText, { width: 40, textAlign: 'center' }]}>SET</Text>
                                <Text style={[styles.setHeaderText, { flex: 1 }]}>PREVIOUS</Text>
                                <Text style={[styles.setHeaderText, { width: 60, textAlign: 'center' }]}>{unitLabel}</Text>
                                <Text style={[styles.setHeaderText, { width: 60, textAlign: 'center' }]}>REPS</Text>
                                <View style={{ width: 36 }} />
                            </View>

                            {/* Set Rows */}
                            {we.sets.map((s, si) => {
                                const prevSets = useWorkoutStore.getState().getPreviousSets(we.exerciseId);
                                const prev = prevSets?.[si];

                                return (
                                    <View key={s.id} style={[styles.setRow, s.completed && styles.setRowCompleted, !s.completed && si > 0 && !we.sets[si - 1]?.completed && styles.setRowDimmed]}>
                                        <Text style={[styles.setNum, s.completed && styles.setNumCompleted]}>{si + 1}</Text>
                                        <Text style={styles.prevText}>
                                            {prev ? `${prev.weight} ${weightUnit} × ${prev.reps}` : '—'}
                                        </Text>
                                        <TextInput
                                            style={styles.input}
                                            keyboardType="numeric"
                                            placeholder={prev ? `${prev.weight}` : '0'}
                                            placeholderTextColor={Colors.light.textTertiary}
                                            value={s.weight > 0 ? String(s.weight) : ''}
                                            onChangeText={(t) => updateSet(we.id, s.id, 'weight', parseFloat(t) || 0)}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            keyboardType="numeric"
                                            placeholder={prev ? `${prev.reps}` : '0'}
                                            placeholderTextColor={Colors.light.textTertiary}
                                            value={s.reps > 0 ? String(s.reps) : ''}
                                            onChangeText={(t) => updateSet(we.id, s.id, 'reps', parseInt(t) || 0)}
                                        />
                                        <TouchableOpacity
                                            style={[styles.checkBtn, s.completed && styles.checkBtnCompleted]}
                                            onPress={() => handleCompleteSet(we.id, s.id)}
                                        >
                                            <MaterialIcons name="check" size={20} color={s.completed ? Colors.light.text : Colors.light.textTertiary} />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}

                            {/* Add Set */}
                            <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(we.id)}>
                                <MaterialIcons name="add" size={18} color={Colors.light.text} />
                                <Text style={styles.addSetText}>Add Set</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}

                {activeWorkout.exercises.length === 0 && (
                    <View style={styles.noExercises}>
                        <MaterialIcons name="fitness-center" size={48} color={Colors.light.textTertiary} />
                        <Text style={styles.noExercisesText}>No exercises yet. Add one below!</Text>
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
                                <Text style={styles.restTimerSkip}>Skip</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.addExerciseBtn} onPress={handleAddExercise}>
                    <MaterialIcons name="add-circle" size={22} color={Colors.primary} />
                    <Text style={styles.addExerciseBtnText}>Add Exercise</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.finishWorkoutBtn} onPress={handleFinish}>
                    <MaterialIcons name="done-all" size={22} color={Colors.dark.background} />
                    <Text style={styles.finishWorkoutBtnText}>Finish Workout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.base, color: Colors.light.textSecondary },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
        borderBottomWidth: 1, borderBottomColor: 'rgba(19,236,106,0.1)',
    },
    closeBtn: { padding: Spacing.sm, borderRadius: BorderRadius.full },
    headerCenter: { alignItems: 'center' },
    headerLabel: { fontSize: 10, fontFamily: 'Lexend_500Medium', color: Colors.light.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5 },
    timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    timerText: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.light.text, fontVariant: ['tabular-nums'] },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
    finishBtn: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.primary, paddingHorizontal: Spacing.sm },

    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 200 },

    exerciseBlock: { paddingHorizontal: Spacing.base, paddingTop: Spacing.xl },
    exerciseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.base },
    exerciseName: { fontSize: FontSize.xxl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    exerciseMuscle: { fontSize: FontSize.sm, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary, textTransform: 'capitalize', marginTop: 2 },
    moreBtn: { padding: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.sm },

    setHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, paddingHorizontal: 4 },
    setHeaderText: { fontSize: 10, fontFamily: 'Lexend_700Bold', color: Colors.light.textTertiary, textTransform: 'uppercase', letterSpacing: 1.5 },

    setRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.sm,
        padding: 6, marginBottom: Spacing.sm,
        borderWidth: 1, borderColor: Colors.light.border,
    },
    setRowCompleted: { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryMedium },
    setRowDimmed: { opacity: 0.6 },
    setNum: { width: 40, textAlign: 'center', fontFamily: 'Lexend_700Bold', fontSize: FontSize.base, color: Colors.light.textTertiary },
    setNumCompleted: { color: Colors.primary },
    prevText: { flex: 1, fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium', color: Colors.light.textSecondary },
    input: {
        width: 60, backgroundColor: Colors.light.background, borderRadius: 6, textAlign: 'center',
        fontFamily: 'Lexend_700Bold', fontSize: FontSize.sm, paddingVertical: 6, paddingHorizontal: 4, color: Colors.light.text,
    },
    checkBtn: {
        width: 36, height: 36, borderRadius: 8, backgroundColor: Colors.light.borderDark,
        alignItems: 'center', justifyContent: 'center',
    },
    checkBtnCompleted: { backgroundColor: Colors.primary },

    addSetBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        marginTop: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
        backgroundColor: Colors.light.borderDark,
    },
    addSetText: { fontFamily: 'Lexend_600SemiBold', fontSize: FontSize.sm, color: Colors.light.text },

    noExercises: { alignItems: 'center', paddingTop: 80, gap: Spacing.base },
    noExercisesText: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.md, color: Colors.light.textSecondary },

    restTimer: {
        position: 'absolute', bottom: 100, left: '5%', right: '5%',
    },
    restTimerInner: {
        backgroundColor: '#1e293b', borderRadius: BorderRadius.full,
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
    restTimerSkip: { fontSize: FontSize.xs, fontFamily: 'Lexend_700Bold', color: Colors.light.textTertiary, textTransform: 'uppercase', letterSpacing: 1 },

    bottomActions: {
        flexDirection: 'row', gap: Spacing.md,
        paddingHorizontal: Spacing.base, paddingTop: Spacing.base, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        backgroundColor: Colors.light.background, borderTopWidth: 1, borderTopColor: 'rgba(19,236,106,0.1)',
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
    finishWorkoutBtnText: { fontFamily: 'Lexend_700Bold', fontSize: FontSize.base, color: Colors.dark.background },
});
