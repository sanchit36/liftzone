import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useExerciseStore } from '../store/exerciseStore';
import { MuscleGroup, Equipment, Category, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS, CATEGORY_LABELS } from '../data/exercises';

const MUSCLE_GROUPS: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
const EQUIPMENTS: Equipment[] = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'other'];
const CATEGORIES: Category[] = ['push', 'pull', 'legs', 'core', 'cardio'];

export default function CreateExerciseScreen() {
    const router = useRouter();
    const { addExercise } = useExerciseStore();

    const [name, setName] = useState('');
    const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [category, setCategory] = useState<Category | null>(null);
    const [instructions, setInstructions] = useState('');

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) { Alert.alert('Missing Name', 'Please enter an exercise name.'); return; }
        if (trimmedName.length < 2) { Alert.alert('Name Too Short', 'Exercise name must be at least 2 characters.'); return; }
        if (trimmedName.length > 50) { Alert.alert('Name Too Long', 'Exercise name must be at most 50 characters.'); return; }
        if (!muscleGroup) { Alert.alert('Missing Muscle Group', 'Please select a muscle group.'); return; }
        if (!equipment) { Alert.alert('Missing Equipment', 'Please select equipment type.'); return; }
        if (!category) { Alert.alert('Missing Category', 'Please select a category.'); return; }

        addExercise({
            id: `custom-${Date.now()}`,
            name: trimmedName,
            muscleGroup,
            equipment,
            category,
            instructions: instructions.trim(),
            isCustom: true,
        });

        router.back();
    };

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>New Exercise</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={s.saveBtn}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                {/* Name */}
                <Text style={s.label}>Exercise Name</Text>
                <TextInput
                    style={s.input}
                    placeholder="e.g. Bulgarian Split Squat"
                    placeholderTextColor={Colors.light.textTertiary}
                    value={name}
                    onChangeText={setName}
                    maxLength={50}
                    autoFocus
                />
                <Text style={s.charCount}>{name.length}/50</Text>

                {/* Muscle Group */}
                <Text style={s.label}>Muscle Group</Text>
                <View style={s.chipRow}>
                    {MUSCLE_GROUPS.map((mg) => (
                        <TouchableOpacity
                            key={mg}
                            style={[s.chip, muscleGroup === mg && s.chipActive]}
                            onPress={() => setMuscleGroup(mg)}
                        >
                            <Text style={[s.chipText, muscleGroup === mg && s.chipTextActive]}>
                                {MUSCLE_GROUP_LABELS[mg]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Equipment */}
                <Text style={s.label}>Equipment</Text>
                <View style={s.chipRow}>
                    {EQUIPMENTS.map((eq) => (
                        <TouchableOpacity
                            key={eq}
                            style={[s.chip, equipment === eq && s.chipActive]}
                            onPress={() => setEquipment(eq)}
                        >
                            <Text style={[s.chipText, equipment === eq && s.chipTextActive]}>
                                {EQUIPMENT_LABELS[eq]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Category */}
                <Text style={s.label}>Category</Text>
                <View style={s.chipRow}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[s.chip, category === cat && s.chipActive]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[s.chipText, category === cat && s.chipTextActive]}>
                                {CATEGORY_LABELS[cat]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Instructions */}
                <Text style={s.label}>Instructions <Text style={s.optional}>(optional)</Text></Text>
                <TextInput
                    style={[s.input, s.textArea]}
                    placeholder="Describe how to perform this exercise..."
                    placeholderTextColor={Colors.light.textTertiary}
                    value={instructions}
                    onChangeText={setInstructions}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={300}
                />
                <Text style={s.charCount}>{instructions.length}/300</Text>

                {/* Preview Card */}
                {name.trim().length > 0 && muscleGroup && equipment && (
                    <View style={s.preview}>
                        <Text style={s.previewTitle}>Preview</Text>
                        <View style={s.previewCard}>
                            <View style={s.previewIcon}>
                                <MaterialIcons name="fitness-center" size={24} color={Colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.previewName}>{name.trim()}</Text>
                                <Text style={s.previewMeta}>
                                    {MUSCLE_GROUP_LABELS[muscleGroup]} • {EQUIPMENT_LABELS[equipment]}
                                    {category ? ` • ${CATEGORY_LABELS[category]}` : ''}
                                </Text>
                            </View>
                            <View style={s.customBadge}>
                                <Text style={s.customBadgeText}>Custom</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    saveBtn: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    scroll: { padding: Spacing.base, paddingBottom: 60 },

    label: { fontSize: FontSize.sm, fontFamily: 'Lexend_600SemiBold', color: Colors.light.text, marginTop: Spacing.lg, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
    optional: { fontFamily: 'Lexend_400Regular', color: Colors.light.textTertiary, textTransform: 'none', letterSpacing: 0 },
    input: {
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.light.border,
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
        fontFamily: 'Lexend_500Medium', fontSize: FontSize.base, color: Colors.light.text,
    },
    textArea: { minHeight: 100, paddingTop: Spacing.md },
    charCount: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', color: Colors.light.textTertiary, textAlign: 'right', marginTop: 4 },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chip: {
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full, backgroundColor: Colors.light.card,
        borderWidth: 1, borderColor: Colors.light.border,
    },
    chipActive: { backgroundColor: Colors.primaryMedium, borderColor: Colors.primary },
    chipText: { fontSize: FontSize.sm, fontFamily: 'Lexend_500Medium', color: Colors.light.textSecondary },
    chipTextActive: { color: Colors.primary, fontFamily: 'Lexend_700Bold' },

    preview: { marginTop: Spacing.xxl },
    previewTitle: { fontSize: FontSize.sm, fontFamily: 'Lexend_600SemiBold', color: Colors.light.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
    previewCard: {
        flexDirection: 'row', alignItems: 'center', padding: Spacing.base,
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.light.border,
    },
    previewIcon: {
        width: 48, height: 48, borderRadius: BorderRadius.sm,
        backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.base,
    },
    previewName: { fontFamily: 'Lexend_600SemiBold', fontSize: FontSize.base, color: Colors.light.text },
    previewMeta: { fontFamily: 'Lexend_400Regular', fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 2 },
    customBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
    customBadgeText: { fontSize: 10, fontFamily: 'Lexend_700Bold', color: Colors.primary },
});
