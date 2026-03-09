import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useExerciseStore } from '../store/exerciseStore';
import { useRoutineStore } from '../store/routineStore';
import { useThemeColors } from '../hooks/useThemeColors';

export default function CreateRoutineScreen() {
    const router = useRouter();
    const { getExerciseById } = useExerciseStore();
    const { addRoutine, draftExerciseIds, removeFromDraft, clearDraft } = useRoutineStore();
    const [name, setName] = useState('');
    const c = useThemeColors();

    // Clear draft on mount
    useEffect(() => {
        clearDraft();
    }, []);

    const handleSave = () => {
        if (!name.trim()) { Alert.alert('Name Required', 'Please enter a routine name.'); return; }
        if (draftExerciseIds.length === 0) { Alert.alert('No Exercises', 'Add at least one exercise.'); return; }
        addRoutine({
            id: `rt-${Date.now()}`,
            name: name.trim(),
            exerciseIds: draftExerciseIds,
            createdAt: Date.now(),
        });
        clearDraft();
        router.back();
    };

    const handleAddExercises = () => {
        router.push('/add-exercises?mode=routine');
    };

    return (
        <SafeAreaView style={[s.container, { backgroundColor: c.background }]} edges={['top']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => { clearDraft(); router.back(); }}>
                    <MaterialIcons name="close" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: c.text }]}>New Routine</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={[s.saveBtn, (!name.trim() || draftExerciseIds.length === 0) && s.saveBtnDisabled]}>Save</Text>
                </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View style={s.nameWrap}>
                <TextInput
                    style={s.nameInput}
                    placeholder="Routine Name"
                    placeholderTextColor={c.textTertiary}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                />
            </View>

            {/* Exercise Count */}
            {draftExerciseIds.length > 0 && (
                <Text style={s.countText}>{draftExerciseIds.length} exercise{draftExerciseIds.length > 1 ? 's' : ''} added</Text>
            )}

            {/* Exercise List or Empty State */}
            <ScrollView style={s.list} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
                {draftExerciseIds.length === 0 ? (
                    <View style={s.empty}>
                        <View style={s.emptyIcon}>
                            <MaterialIcons name="fitness-center" size={48} color={Colors.light.textTertiary} />
                        </View>
                        <Text style={s.emptyTitle}>No exercises yet</Text>
                        <Text style={s.emptySubtitle}>Tap the button below to add exercises to your routine</Text>
                    </View>
                ) : (
                    draftExerciseIds.map((exId, index) => {
                        const ex = getExerciseById(exId);
                        if (!ex) return null;
                        return (
                            <View key={exId} style={[s.exRow, { backgroundColor: c.card, borderColor: c.border }]}>
                                <View style={s.exIndex}>
                                    <Text style={s.exIndexText}>{index + 1}</Text>
                                </View>
                                <View style={s.exInfo}>
                                    <Text style={[s.exName, { color: c.text }]}>{ex.name}</Text>
                                    <Text style={s.exMeta}>{ex.muscleGroup} • {ex.equipment}</Text>
                                </View>
                                <TouchableOpacity style={s.removeBtn} onPress={() => removeFromDraft(exId)}>
                                    <MaterialIcons name="close" size={18} color={Colors.light.textTertiary} />
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Bottom: Add Exercises Button */}
            <View style={s.bottomBar}>
                <TouchableOpacity style={s.addBtn} activeOpacity={0.8} onPress={handleAddExercises}>
                    <MaterialIcons name="add-circle" size={22} color={Colors.dark.background} />
                    <Text style={s.addBtnText}>Add Exercises</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base },
    headerTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    saveBtn: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    saveBtnDisabled: { opacity: 0.4 },

    nameWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
    nameInput: {
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg, padding: Spacing.base,
        fontSize: FontSize.lg, fontFamily: 'Lexend_600SemiBold', color: Colors.light.text,
        borderWidth: 1, borderColor: Colors.light.border,
    },

    countText: {
        paddingHorizontal: Spacing.base, fontFamily: 'Lexend_500Medium',
        fontSize: FontSize.sm, color: Colors.primary, marginBottom: Spacing.sm,
    },

    list: { flex: 1 },
    listContent: { paddingHorizontal: Spacing.base, paddingBottom: 120 },

    empty: { alignItems: 'center', paddingTop: 80 },
    emptyIcon: {
        width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.light.border,
        alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
    },
    emptyTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.light.textSecondary, marginBottom: Spacing.sm },
    emptySubtitle: {
        fontSize: FontSize.md, fontFamily: 'Lexend_400Regular', color: Colors.light.textTertiary,
        textAlign: 'center', paddingHorizontal: Spacing.xxl, lineHeight: 22,
    },

    exRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm,
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.sm,
        borderWidth: 1, borderColor: Colors.light.border, marginBottom: Spacing.sm,
    },
    exIndex: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryLight,
        alignItems: 'center', justifyContent: 'center',
    },
    exIndexText: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    exInfo: { flex: 1 },
    exName: { fontSize: FontSize.base, fontFamily: 'Lexend_600SemiBold', color: Colors.light.text },
    exMeta: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary, textTransform: 'capitalize', marginTop: 2 },
    removeBtn: { padding: Spacing.sm },

    bottomBar: {
        paddingHorizontal: Spacing.base, paddingTop: Spacing.base,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        backgroundColor: Colors.light.background,
        borderTopWidth: 1, borderTopColor: 'rgba(19,236,106,0.1)',
    },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        paddingVertical: Spacing.base, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary,
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    addBtnText: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.dark.background },
});
