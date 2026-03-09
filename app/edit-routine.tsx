import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useExerciseStore } from '../store/exerciseStore';
import { useRoutineStore } from '../store/routineStore';
import { useWorkoutStore, RoutineExerciseTemplate } from '../store/workoutStore';

interface EditableSet {
    weight: string;
    reps: string;
}

interface EditableExercise {
    exerciseId: string;
    sets: EditableSet[];
    restTimer: string; // seconds as string for easier TextInput
}

export default function EditRoutineScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const { getExerciseById } = useExerciseStore();
    const { getRoutineById, updateRoutine, draftExerciseIds, clearDraft } = useRoutineStore();
    const { getPreviousSets } = useWorkoutStore();

    const routine = getRoutineById(params.id || '');
    const [name, setName] = useState(routine?.name || '');
    const [exercises, setExercises] = useState<EditableExercise[]>([]);

    // Initialize exercises with template data or previous workout data
    useEffect(() => {
        if (!routine) return;
        const templates = routine.exerciseTemplates || [];
        const initial: EditableExercise[] = routine.exerciseIds.map((exId) => {
            const template = templates.find((t) => t.exerciseId === exId);
            if (template) {
                return {
                    exerciseId: exId,
                    sets: template.sets.map((s) => ({ weight: String(s.weight || ''), reps: String(s.reps || '') })),
                    restTimer: String(template.restTimer),
                };
            }
            // Try previous workout data
            const prev = getPreviousSets(exId);
            if (prev && prev.length > 0) {
                return {
                    exerciseId: exId,
                    sets: prev.map((s) => ({ weight: String(s.weight || ''), reps: String(s.reps || '') })),
                    restTimer: '90',
                };
            }
            return {
                exerciseId: exId,
                sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }, { weight: '', reps: '' }],
                restTimer: '90',
            };
        });
        setExercises(initial);
    }, [routine?.id]);

    // When returning from add-exercises, merge new draft exercises
    useEffect(() => {
        if (draftExerciseIds.length > 0) {
            const currentIds = exercises.map((e) => e.exerciseId);
            const newExercises: EditableExercise[] = draftExerciseIds
                .filter((id) => !currentIds.includes(id))
                .map((id) => {
                    const prev = getPreviousSets(id);
                    if (prev && prev.length > 0) {
                        return {
                            exerciseId: id,
                            sets: prev.map((s) => ({ weight: String(s.weight || ''), reps: String(s.reps || '') })),
                            restTimer: '90',
                        };
                    }
                    return {
                        exerciseId: id,
                        sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }, { weight: '', reps: '' }],
                        restTimer: '90',
                    };
                });
            if (newExercises.length > 0) {
                setExercises((prev) => [...prev, ...newExercises]);
            }
            clearDraft();
        }
    }, [draftExerciseIds]);

    if (!routine) {
        return (
            <SafeAreaView style={s.container} edges={['top']}>
                <View style={s.emptyState}>
                    <Text style={s.emptyText}>Routine not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleSave = () => {
        if (!name.trim()) { Alert.alert('Name Required', 'Please enter a routine name.'); return; }
        const exerciseTemplates: RoutineExerciseTemplate[] = exercises.map((e) => ({
            exerciseId: e.exerciseId,
            sets: e.sets.map((s) => ({ weight: parseFloat(s.weight) || 0, reps: parseInt(s.reps) || 0 })),
            restTimer: parseInt(e.restTimer) || 90,
        }));
        updateRoutine(routine.id, {
            name: name.trim(),
            exerciseIds: exercises.map((e) => e.exerciseId),
            exerciseTemplates,
        });
        router.back();
    };

    const handleAddExercises = () => {
        clearDraft();
        router.push('/add-exercises?mode=routine');
    };

    const handleRemoveExercise = (exerciseId: string) => {
        setExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId));
    };

    const handleAddSet = (exerciseId: string) => {
        setExercises((prev) => prev.map((e) => {
            if (e.exerciseId !== exerciseId) return e;
            const lastSet = e.sets[e.sets.length - 1];
            return { ...e, sets: [...e.sets, { weight: lastSet?.weight || '', reps: lastSet?.reps || '' }] };
        }));
    };

    const handleRemoveSet = (exerciseId: string, setIndex: number) => {
        setExercises((prev) => prev.map((e) => {
            if (e.exerciseId !== exerciseId || e.sets.length <= 1) return e;
            return { ...e, sets: e.sets.filter((_, i) => i !== setIndex) };
        }));
    };

    const handleSetChange = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
        setExercises((prev) => prev.map((e) => {
            if (e.exerciseId !== exerciseId) return e;
            return { ...e, sets: e.sets.map((s, i) => i === setIndex ? { ...s, [field]: value } : s) };
        }));
    };

    const handleRestTimerChange = (exerciseId: string, value: string) => {
        setExercises((prev) => prev.map((e) => e.exerciseId === exerciseId ? { ...e, restTimer: value } : e));
    };

    const handleDeleteRoutine = () => {
        Alert.alert('Delete Routine', `Delete "${routine.name}" permanently?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: () => {
                    useRoutineStore.getState().removeRoutine(routine.id);
                    router.back();
                }
            },
        ]);
    };

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Edit Routine</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={s.saveBtn}>Save</Text>
                </TouchableOpacity>
            </View>

            {/* Routine Name */}
            <View style={s.nameWrap}>
                <TextInput
                    style={s.nameInput}
                    placeholder="Routine Name"
                    placeholderTextColor={Colors.light.textTertiary}
                    value={name}
                    onChangeText={setName}
                />
            </View>

            {/* Exercise Blocks */}
            <ScrollView style={s.scrollView} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {exercises.map((re, index) => {
                    const ex = getExerciseById(re.exerciseId);
                    if (!ex) return null;

                    return (
                        <View key={re.exerciseId} style={s.exerciseBlock}>
                            {/* Exercise Header */}
                            <View style={s.exerciseHeader}>
                                <View style={s.exerciseLeft}>
                                    <View style={s.exerciseIndex}>
                                        <Text style={s.exerciseIndexText}>{index + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.exerciseName}>{ex.name}</Text>
                                        <Text style={s.exerciseMuscle}>{ex.muscleGroup} • {ex.equipment}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={s.removeExBtn} onPress={() => handleRemoveExercise(re.exerciseId)}>
                                    <MaterialIcons name="delete-outline" size={20} color="#e74c3c" />
                                </TouchableOpacity>
                            </View>

                            {/* Rest Timer */}
                            <View style={s.restTimerRow}>
                                <MaterialIcons name="timer" size={16} color={Colors.light.textSecondary} />
                                <Text style={s.restLabel}>Rest</Text>
                                <TextInput
                                    style={s.restInput}
                                    value={re.restTimer}
                                    onChangeText={(v) => handleRestTimerChange(re.exerciseId, v)}
                                    keyboardType="number-pad"
                                    maxLength={3}
                                />
                                <Text style={s.restUnit}>sec</Text>
                            </View>

                            {/* Set Column Headers */}
                            <View style={s.setHeaders}>
                                <Text style={[s.setHeaderText, { width: 36 }]}>SET</Text>
                                <Text style={[s.setHeaderText, { flex: 1, textAlign: 'center' }]}>KG</Text>
                                <Text style={[s.setHeaderText, { flex: 1, textAlign: 'center' }]}>REPS</Text>
                                <View style={{ width: 28 }} />
                            </View>

                            {/* Set Rows */}
                            {re.sets.map((set, si) => (
                                <View key={si} style={s.setRow}>
                                    <Text style={s.setNum}>{si + 1}</Text>
                                    <TextInput
                                        style={s.setInput}
                                        value={set.weight}
                                        onChangeText={(v) => handleSetChange(re.exerciseId, si, 'weight', v)}
                                        keyboardType="decimal-pad"
                                        placeholder="0"
                                        placeholderTextColor={Colors.light.textTertiary}
                                    />
                                    <TextInput
                                        style={s.setInput}
                                        value={set.reps}
                                        onChangeText={(v) => handleSetChange(re.exerciseId, si, 'reps', v)}
                                        keyboardType="number-pad"
                                        placeholder="0"
                                        placeholderTextColor={Colors.light.textTertiary}
                                    />
                                    <TouchableOpacity style={s.removeSetBtn} onPress={() => handleRemoveSet(re.exerciseId, si)}>
                                        <MaterialIcons name="remove-circle-outline" size={18} color={Colors.light.textTertiary} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Add Set */}
                            <TouchableOpacity style={s.addSetBtn} onPress={() => handleAddSet(re.exerciseId)}>
                                <MaterialIcons name="add" size={18} color={Colors.light.text} />
                                <Text style={s.addSetText}>Add Set</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}

                {exercises.length === 0 && (
                    <View style={s.noExercises}>
                        <MaterialIcons name="fitness-center" size={48} color={Colors.light.textTertiary} />
                        <Text style={s.noExercisesText}>No exercises. Add some below!</Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={s.bottomActions}>
                <TouchableOpacity style={s.addExerciseBtn} onPress={handleAddExercises}>
                    <MaterialIcons name="add-circle" size={22} color={Colors.primary} />
                    <Text style={s.addExerciseBtnText}>Add Exercises</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.deleteRoutineBtn} onPress={handleDeleteRoutine}>
                    <MaterialIcons name="delete-outline" size={22} color="#e74c3c" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.base, color: Colors.light.textSecondary },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    },
    backBtn: { padding: Spacing.sm, borderRadius: 20 },
    headerTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    saveBtn: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.primary },

    nameWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
    nameInput: {
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg, padding: Spacing.base,
        fontSize: FontSize.lg, fontFamily: 'Lexend_600SemiBold', color: Colors.light.text,
        borderWidth: 1, borderColor: Colors.light.border,
    },

    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 200 },

    exerciseBlock: { paddingHorizontal: Spacing.base, paddingTop: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.light.border, paddingBottom: Spacing.xl },
    exerciseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
    exerciseLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
    exerciseIndex: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryLight,
        alignItems: 'center', justifyContent: 'center',
    },
    exerciseIndexText: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    exerciseName: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    exerciseMuscle: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary, textTransform: 'capitalize', marginTop: 2 },
    removeExBtn: { padding: Spacing.sm },

    restTimerRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.sm,
        padding: Spacing.sm, marginBottom: Spacing.md,
        borderWidth: 1, borderColor: Colors.light.border,
    },
    restLabel: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.sm, color: Colors.light.textSecondary },
    restInput: {
        width: 52, textAlign: 'center', fontFamily: 'Lexend_700Bold', fontSize: FontSize.base,
        color: Colors.light.text, backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.sm, padding: 4, borderWidth: 1, borderColor: Colors.light.border,
    },
    restUnit: { fontFamily: 'Lexend_400Regular', fontSize: FontSize.sm, color: Colors.light.textTertiary },

    setHeaders: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, marginBottom: Spacing.sm },
    setHeaderText: { fontSize: 10, fontFamily: 'Lexend_700Bold', color: Colors.light.textTertiary, textTransform: 'uppercase', letterSpacing: 1.5, width: 40 },

    setRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.sm,
        padding: Spacing.sm, marginBottom: Spacing.sm,
        borderWidth: 1, borderColor: Colors.light.border,
    },
    setNum: { width: 36, textAlign: 'center', fontFamily: 'Lexend_700Bold', fontSize: FontSize.base, color: Colors.light.textTertiary },
    setInput: {
        flex: 1, textAlign: 'center', fontFamily: 'Lexend_600SemiBold', fontSize: FontSize.base,
        color: Colors.light.text, backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.sm, paddingVertical: 8, paddingHorizontal: 4,
        borderWidth: 1, borderColor: Colors.light.border,
    },
    removeSetBtn: { width: 28, alignItems: 'center' },

    addSetBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        marginTop: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
        backgroundColor: Colors.light.borderDark,
    },
    addSetText: { fontFamily: 'Lexend_600SemiBold', fontSize: FontSize.sm, color: Colors.light.text },

    noExercises: { alignItems: 'center', paddingTop: 80, gap: Spacing.base },
    noExercisesText: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.md, color: Colors.light.textSecondary },

    bottomActions: {
        flexDirection: 'row', gap: Spacing.md,
        paddingHorizontal: Spacing.base, paddingTop: Spacing.base,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        backgroundColor: Colors.light.background, borderTopWidth: 1, borderTopColor: 'rgba(19,236,106,0.1)',
    },
    addExerciseBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        paddingVertical: Spacing.base, borderRadius: BorderRadius.lg, backgroundColor: Colors.primaryMedium,
    },
    addExerciseBtnText: { fontFamily: 'Lexend_700Bold', fontSize: FontSize.base, color: Colors.primary },
    deleteRoutineBtn: {
        width: 52, alignItems: 'center', justifyContent: 'center',
        borderRadius: BorderRadius.lg, backgroundColor: 'rgba(231,76,60,0.1)',
    },
});
