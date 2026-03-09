import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useExerciseStore } from '../store/exerciseStore';
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '../data/exercises';

export default function ExercisesScreen() {
    const router = useRouter();
    const { exercises, searchExercises, getExercisesByMuscleGroup } = useExerciseStore();
    const [query, setQuery] = useState('');

    const filteredExercises = query.trim() ? searchExercises(query) : exercises;

    // Group by muscle group
    const grouped: Record<string, typeof exercises> = {};
    filteredExercises.forEach((e) => {
        const key = e.muscleGroup;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(e);
    });

    const getEquipmentIcon = (eq: string): keyof typeof MaterialIcons.glyphMap => {
        switch (eq) {
            case 'barbell': return 'hardware';
            case 'dumbbell': return 'hardware';
            case 'machine': return 'settings-input-component';
            case 'cable': return 'settings-input-component';
            case 'bodyweight': return 'person';
            default: return 'fitness-center';
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Exercises</Text>
                <View style={styles.headerIcon}>
                    <MaterialIcons name="fitness-center" size={22} color={Colors.primary} />
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={22} color={query ? Colors.primary : Colors.light.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercises (e.g. Squat, Press)"
                        placeholderTextColor={Colors.light.textTertiary}
                        value={query}
                        onChangeText={setQuery}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <MaterialIcons name="close" size={20} color={Colors.light.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Exercise List */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {Object.entries(grouped).map(([group, exs]) => (
                    <View key={group} style={styles.groupSection}>
                        <Text style={styles.groupLabel}>{MUSCLE_GROUP_LABELS[group as keyof typeof MUSCLE_GROUP_LABELS] || group}</Text>
                        <View style={styles.exerciseList}>
                            {exs.map((ex) => (
                                <TouchableOpacity key={ex.id} style={styles.exerciseItem} activeOpacity={0.7}>
                                    <View style={styles.exerciseThumb}>
                                        <MaterialIcons name="fitness-center" size={24} color={Colors.light.textTertiary} />
                                    </View>
                                    <View style={styles.exerciseInfo}>
                                        <Text style={styles.exerciseName}>{ex.name}</Text>
                                        <View style={styles.exerciseMeta}>
                                            <MaterialIcons name={getEquipmentIcon(ex.equipment)} size={14} color={Colors.light.textSecondary} />
                                            <Text style={styles.exerciseEquipment}>{EQUIPMENT_LABELS[ex.equipment]}</Text>
                                        </View>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={24} color={Colors.light.borderDark} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {filteredExercises.length === 0 && (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="search-off" size={48} color={Colors.light.textTertiary} />
                        <Text style={styles.emptyText}>No exercises found for "{query}"</Text>
                    </View>
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => router.push('/create-exercise' as any)}>
                <MaterialIcons name="add" size={28} color={Colors.dark.background} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    headerIcon: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryMedium,
        alignItems: 'center', justifyContent: 'center',
    },

    searchWrap: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    },
    searchInput: { flex: 1, fontFamily: 'Lexend_400Regular', fontSize: FontSize.sm, color: Colors.light.text },

    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: Spacing.base, paddingBottom: 100 },

    groupSection: { marginTop: Spacing.xl },
    groupLabel: {
        fontSize: FontSize.sm, fontFamily: 'Lexend_600SemiBold', color: Colors.light.textSecondary,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md, paddingLeft: 4,
    },
    exerciseList: { gap: Spacing.md },
    exerciseItem: {
        flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.light.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    },
    exerciseThumb: {
        width: 56, height: 56, borderRadius: BorderRadius.sm,
        backgroundColor: Colors.light.border, alignItems: 'center', justifyContent: 'center',
    },
    exerciseInfo: { flex: 1, marginLeft: Spacing.base },
    exerciseName: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.base, color: Colors.light.text },
    exerciseMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    exerciseEquipment: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary },

    emptyState: { alignItems: 'center', paddingTop: 80, gap: Spacing.base },
    emptyText: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.md, color: Colors.light.textSecondary },

    fab: {
        position: 'absolute', bottom: 96, right: Spacing.lg,
        width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
    },
});
