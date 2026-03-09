import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useExerciseStore } from '../store/exerciseStore';
import { useWorkoutStore } from '../store/workoutStore';
import { MuscleGroup, Equipment, Category, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS, CATEGORY_LABELS } from '../data/exercises';

const ALL_MUSCLES: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
const ALL_EQUIPMENT: Equipment[] = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'];
const ALL_CATEGORIES: Category[] = ['push', 'pull', 'legs', 'core', 'cardio'];

export default function AddExercisesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ mode?: string }>();
    const { exercises } = useExerciseStore();
    const { addExerciseToWorkout } = useWorkoutStore();

    const [query, setQuery] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const filtered = useMemo(() => {
        let list = exercises;
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter((e) => e.name.toLowerCase().includes(q) || e.muscleGroup.includes(q));
        }
        if (selectedMuscle) list = list.filter((e) => e.muscleGroup === selectedMuscle);
        if (selectedEquipment) list = list.filter((e) => e.equipment === selectedEquipment);
        if (selectedCategory) list = list.filter((e) => e.category === selectedCategory);
        return list;
    }, [exercises, query, selectedMuscle, selectedEquipment, selectedCategory]);

    const toggleExercise = (id: string) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const handleAdd = () => {
        if (params.mode === 'routine') {
            // Return selected IDs via global state or params — for now just go back
            router.back();
            return;
        }
        // Workout mode: add each selected exercise to the active workout
        selectedIds.forEach((id) => addExerciseToWorkout(id));
        router.back();
    };

    const clearFilters = () => {
        setSelectedMuscle(null);
        setSelectedEquipment(null);
        setSelectedCategory(null);
        setQuery('');
    };

    const hasFilters = selectedMuscle || selectedEquipment || selectedCategory || query.trim();

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <MaterialIcons name="close" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Add Exercises</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search */}
            <View style={s.searchWrap}>
                <View style={s.searchBox}>
                    <MaterialIcons name="search" size={20} color={query ? Colors.primary : Colors.light.textTertiary} />
                    <TextInput
                        style={s.searchInput}
                        placeholder="Search exercises..."
                        placeholderTextColor={Colors.light.textTertiary}
                        value={query}
                        onChangeText={setQuery}
                        autoCorrect={false}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <MaterialIcons name="close" size={18} color={Colors.light.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter: Body Part */}
            <View style={s.filterSection}>
                <Text style={s.filterLabel}>BODY PART</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
                    {ALL_MUSCLES.map((m) => (
                        <TouchableOpacity
                            key={m}
                            style={[s.chip, selectedMuscle === m && s.chipActive]}
                            onPress={() => setSelectedMuscle(selectedMuscle === m ? null : m)}
                        >
                            <Text style={[s.chipText, selectedMuscle === m && s.chipTextActive]}>
                                {MUSCLE_GROUP_LABELS[m]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Filter: Equipment */}
            <View style={s.filterSection}>
                <Text style={s.filterLabel}>EQUIPMENT</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
                    {ALL_EQUIPMENT.map((eq) => (
                        <TouchableOpacity
                            key={eq}
                            style={[s.chip, selectedEquipment === eq && s.chipActive]}
                            onPress={() => setSelectedEquipment(selectedEquipment === eq ? null : eq)}
                        >
                            <Text style={[s.chipText, selectedEquipment === eq && s.chipTextActive]}>
                                {EQUIPMENT_LABELS[eq]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Filter: Category */}
            <View style={s.filterSection}>
                <Text style={s.filterLabel}>CATEGORY</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
                    {ALL_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[s.chip, selectedCategory === cat && s.chipActive]}
                            onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        >
                            <Text style={[s.chipText, selectedCategory === cat && s.chipTextActive]}>
                                {CATEGORY_LABELS[cat]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Active filters summary */}
            {hasFilters && (
                <View style={s.filterSummary}>
                    <Text style={s.filterSummaryText}>{filtered.length} exercises found</Text>
                    <TouchableOpacity onPress={clearFilters}>
                        <Text style={s.clearText}>Clear All</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Exercise List */}
            <ScrollView style={s.list} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
                {filtered.map((ex) => {
                    const isSelected = selectedIds.includes(ex.id);
                    return (
                        <TouchableOpacity
                            key={ex.id}
                            style={[s.exRow, isSelected && s.exRowSelected]}
                            activeOpacity={0.7}
                            onPress={() => toggleExercise(ex.id)}
                        >
                            <View style={[s.checkbox, isSelected && s.checkboxActive]}>
                                {isSelected && <MaterialIcons name="check" size={16} color={Colors.dark.background} />}
                            </View>
                            <View style={s.exInfo}>
                                <Text style={s.exName}>{ex.name}</Text>
                                <Text style={s.exMeta}>
                                    {MUSCLE_GROUP_LABELS[ex.muscleGroup]} • {EQUIPMENT_LABELS[ex.equipment]} • {CATEGORY_LABELS[ex.category]}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
                {filtered.length === 0 && (
                    <View style={s.empty}>
                        <MaterialIcons name="search-off" size={40} color={Colors.light.textTertiary} />
                        <Text style={s.emptyText}>No exercises match your filters</Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Add Button */}
            {selectedIds.length > 0 && (
                <View style={s.bottomBar}>
                    <TouchableOpacity style={s.addBtn} activeOpacity={0.8} onPress={handleAdd}>
                        <MaterialIcons name="add" size={22} color={Colors.dark.background} />
                        <Text style={s.addBtnText}>
                            Add {selectedIds.length} Exercise{selectedIds.length > 1 ? 's' : ''}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },

    searchWrap: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
        borderWidth: 1, borderColor: Colors.light.border,
    },
    searchInput: { flex: 1, fontFamily: 'Lexend_400Regular', fontSize: FontSize.sm, color: Colors.light.text },

    filterSection: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: 4 },
    filterLabel: {
        fontSize: 10, fontFamily: 'Lexend_600SemiBold', color: Colors.light.textTertiary,
        textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: Spacing.sm,
    },
    chipRow: { gap: Spacing.sm, paddingRight: Spacing.base },
    chip: {
        paddingHorizontal: Spacing.md, paddingVertical: 6,
        borderRadius: BorderRadius.full, backgroundColor: Colors.light.card,
        borderWidth: 1, borderColor: Colors.light.borderDark,
    },
    chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    chipText: { fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium', color: Colors.light.textSecondary },
    chipTextActive: { color: Colors.dark.background, fontFamily: 'Lexend_700Bold' },

    filterSummary: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    },
    filterSummaryText: { fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium', color: Colors.light.textSecondary },
    clearText: { fontSize: FontSize.xs, fontFamily: 'Lexend_700Bold', color: Colors.primary },

    list: { flex: 1 },
    listContent: { paddingHorizontal: Spacing.base, paddingBottom: 120 },
    exRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.sm, marginBottom: 2,
    },
    exRowSelected: { backgroundColor: Colors.primaryLight },
    checkbox: {
        width: 26, height: 26, borderRadius: 7,
        borderWidth: 2, borderColor: Colors.light.borderDark,
        alignItems: 'center', justifyContent: 'center',
    },
    checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    exInfo: { flex: 1 },
    exName: { fontSize: FontSize.base, fontFamily: 'Lexend_500Medium', color: Colors.light.text },
    exMeta: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary, marginTop: 2 },

    empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.base },
    emptyText: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.md, color: Colors.light.textSecondary },

    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
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
