import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useExerciseStore } from '../store/exerciseStore';
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS, CATEGORY_LABELS } from '../data/exercises';
import { useThemeColors } from '../hooks/useThemeColors';

export default function ExercisesScreen() {
    const router = useRouter();
    const { exercises, searchExercises } = useExerciseStore();
    const [query, setQuery] = useState('');
    const c = useThemeColors();

    const filteredExercises = query.trim() ? searchExercises(query) : exercises;

    // Group by muscle group
    const grouped: Record<string, typeof exercises> = {};
    filteredExercises.forEach((e) => {
        const key = e.muscleGroup;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(e);
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Exercises</Text>
                <View style={styles.headerIcon}>
                    <MaterialIcons name="fitness-center" size={22} color={Colors.primary} />
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
                <View style={[styles.searchContainer, { backgroundColor: c.card, borderColor: c.border }]}>
                    <MaterialIcons name="search" size={22} color={query ? Colors.primary : c.textTertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: c.text }]}
                        placeholder="Search exercises (e.g. Squat, Press)"
                        placeholderTextColor={c.textTertiary}
                        value={query}
                        onChangeText={setQuery}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <MaterialIcons name="close" size={20} color={c.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Exercise List */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {Object.entries(grouped).map(([group, exs]) => (
                    <View key={group} style={styles.groupSection}>
                        <Text style={[styles.groupLabel, { color: c.textTertiary }]}>
                            {MUSCLE_GROUP_LABELS[group as keyof typeof MUSCLE_GROUP_LABELS] || group}
                        </Text>
                        <View style={styles.exerciseList}>
                            {exs.map((ex) => (
                                <View key={ex.id} style={[styles.exRow, { borderBottomColor: c.border }]}>
                                    <View style={[styles.exThumb, { backgroundColor: c.border }]}>
                                        <MaterialIcons name="fitness-center" size={20} color={c.textTertiary} />
                                    </View>
                                    <View style={styles.exInfo}>
                                        <Text style={[styles.exName, { color: c.text }]}>{ex.name}</Text>
                                        <Text style={[styles.exMeta, { color: c.textSecondary }]}>
                                            {MUSCLE_GROUP_LABELS[ex.muscleGroup]} • {EQUIPMENT_LABELS[ex.equipment]} • {CATEGORY_LABELS[ex.category]}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {filteredExercises.length === 0 && (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="search-off" size={48} color={c.textTertiary} />
                        <Text style={[styles.emptyText, { color: c.textSecondary }]}>No exercises found for "{query}"</Text>
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
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold' },
    headerIcon: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryMedium,
        alignItems: 'center', justifyContent: 'center',
    },

    searchWrap: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
        borderWidth: 1,
    },
    searchInput: { flex: 1, fontFamily: 'Lexend_400Regular', fontSize: FontSize.sm },

    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: Spacing.base, paddingBottom: 100 },

    groupSection: { marginTop: Spacing.xl },
    groupLabel: {
        fontSize: 10, fontFamily: 'Lexend_600SemiBold',
        textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: Spacing.sm, paddingLeft: 4,
    },
    exerciseList: {},

    exRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm,
        borderBottomWidth: 1,
    },
    exThumb: {
        width: 40, height: 40, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    exInfo: { flex: 1 },
    exName: { fontSize: FontSize.base, fontFamily: 'Lexend_500Medium' },
    exMeta: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', marginTop: 2 },

    emptyState: { alignItems: 'center', paddingTop: 80, gap: Spacing.base },
    emptyText: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.md },

    fab: {
        position: 'absolute', bottom: 96, right: Spacing.lg,
        width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
    },
});
