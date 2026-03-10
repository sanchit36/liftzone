import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useExerciseStore } from '../store/exerciseStore';
import { MuscleGroup, Equipment, Category, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS, CATEGORY_LABELS } from '../data/exercises';
import { useThemeColors } from '../hooks/useThemeColors';

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
    const c = useThemeColors();

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) { Alert.alert('Missing Name', 'Please enter an exercise name.'); return; }
        if (trimmedName.length < 2) { Alert.alert('Name Too Short', 'Exercise name must be at least 2 characters.'); return; }
        if (trimmedName.length > 50) { Alert.alert('Name Too Long', 'Exercise name must be at most 50 characters.'); return; }
        if (!muscleGroup) { Alert.alert('Missing Muscle Group', 'Please select a muscle group.'); return; }
        if (!equipment) { Alert.alert('Missing Equipment', 'Please select equipment type.'); return; }
        if (!category) { Alert.alert('Missing Category', 'Please select a category.'); return; }

        addExercise({
            id: `custom-${Date.now()}`, name: trimmedName, muscleGroup, equipment, category,
            instructions: instructions.trim(), isCustom: true,
        });
        router.back();
    };

    return (
        <SafeAreaView style={[s.container, { backgroundColor: c.background }]} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: c.text }]}>New Exercise</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={s.saveBtn}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                <Text style={[s.label, { color: c.text }]}>Exercise Name</Text>
                <TextInput
                    style={[s.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
                    placeholder="e.g. Bulgarian Split Squat"
                    placeholderTextColor={c.textTertiary}
                    value={name}
                    onChangeText={setName}
                    maxLength={50}
                    autoFocus
                />
                <Text style={[s.charCount, { color: c.textTertiary }]}>{name.length}/50</Text>

                <Text style={[s.label, { color: c.text }]}>Muscle Group</Text>
                <View style={s.chipRow}>
                    {MUSCLE_GROUPS.map((mg) => (
                        <TouchableOpacity key={mg}
                            style={[s.chip, { backgroundColor: c.card, borderColor: c.border }, muscleGroup === mg && s.chipActive]}
                            onPress={() => setMuscleGroup(mg)}>
                            <Text style={[s.chipText, { color: c.textSecondary }, muscleGroup === mg && s.chipTextActive]}>{MUSCLE_GROUP_LABELS[mg]}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[s.label, { color: c.text }]}>Equipment</Text>
                <View style={s.chipRow}>
                    {EQUIPMENTS.map((eq) => (
                        <TouchableOpacity key={eq}
                            style={[s.chip, { backgroundColor: c.card, borderColor: c.border }, equipment === eq && s.chipActive]}
                            onPress={() => setEquipment(eq)}>
                            <Text style={[s.chipText, { color: c.textSecondary }, equipment === eq && s.chipTextActive]}>{EQUIPMENT_LABELS[eq]}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[s.label, { color: c.text }]}>Category</Text>
                <View style={s.chipRow}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat}
                            style={[s.chip, { backgroundColor: c.card, borderColor: c.border }, category === cat && s.chipActive]}
                            onPress={() => setCategory(cat)}>
                            <Text style={[s.chipText, { color: c.textSecondary }, category === cat && s.chipTextActive]}>{CATEGORY_LABELS[cat]}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[s.label, { color: c.text }]}>Instructions <Text style={[s.optional, { color: c.textTertiary }]}>(optional)</Text></Text>
                <TextInput
                    style={[s.input, s.textArea, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
                    placeholder="Describe how to perform this exercise..."
                    placeholderTextColor={c.textTertiary}
                    value={instructions}
                    onChangeText={setInstructions}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={300}
                />
                <Text style={[s.charCount, { color: c.textTertiary }]}>{instructions.length}/300</Text>

                {name.trim().length > 0 && muscleGroup && equipment && (
                    <View style={s.preview}>
                        <Text style={[s.previewTitle, { color: c.textSecondary }]}>Preview</Text>
                        <View style={[s.previewCard, { backgroundColor: c.card, borderColor: c.border }]}>
                            <View style={s.previewIcon}>
                                <MaterialIcons name="fitness-center" size={24} color={Colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.previewName, { color: c.text }]}>{name.trim()}</Text>
                                <Text style={[s.previewMeta, { color: c.textSecondary }]}>
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
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold' },
    saveBtn: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    scroll: { padding: Spacing.base, paddingBottom: 60 },

    label: { fontSize: FontSize.sm, fontFamily: 'Lexend_600SemiBold', marginTop: Spacing.lg, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
    optional: { fontFamily: 'Lexend_400Regular', textTransform: 'none', letterSpacing: 0 },
    input: {
        borderRadius: BorderRadius.lg, borderWidth: 1,
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
        fontFamily: 'Lexend_500Medium', fontSize: FontSize.base,
    },
    textArea: { minHeight: 100, paddingTop: Spacing.md },
    charCount: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', textAlign: 'right', marginTop: 4 },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chip: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
    chipActive: { backgroundColor: Colors.primaryMedium, borderColor: Colors.primary },
    chipText: { fontSize: FontSize.sm, fontFamily: 'Lexend_500Medium' },
    chipTextActive: { color: Colors.primary, fontFamily: 'Lexend_700Bold' },

    preview: { marginTop: Spacing.xxl },
    previewTitle: { fontSize: FontSize.sm, fontFamily: 'Lexend_600SemiBold', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
    previewCard: {
        flexDirection: 'row', alignItems: 'center', padding: Spacing.base,
        borderRadius: BorderRadius.lg, borderWidth: 1,
    },
    previewIcon: {
        width: 48, height: 48, borderRadius: BorderRadius.sm,
        backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.base,
    },
    previewName: { fontFamily: 'Lexend_600SemiBold', fontSize: FontSize.base },
    previewMeta: { fontFamily: 'Lexend_400Regular', fontSize: FontSize.xs, marginTop: 2 },
    customBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
    customBadgeText: { fontSize: 10, fontFamily: 'Lexend_700Bold', color: Colors.primary },
});
