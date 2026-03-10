import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useWorkoutStore } from '../store/workoutStore';
import { useExerciseStore } from '../store/exerciseStore';
import { useThemeColors } from '../hooks/useThemeColors';

export default function WorkoutDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { workoutHistory } = useWorkoutStore();
    const { getExerciseById } = useExerciseStore();
    const c = useThemeColors();

    const workout = workoutHistory.find((w) => w.id === id);

    if (!workout) {
        return (
            <SafeAreaView style={[s.container, { backgroundColor: c.background }]} edges={['top']}>
                <View style={s.header}>
                    <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[s.headerTitle, { color: c.text }]}>Workout</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={s.empty}>
                    <MaterialIcons name="error-outline" size={48} color={c.textTertiary} />
                    <Text style={[s.emptyText, { color: c.textTertiary }]}>Workout not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const durationMs = workout.endedAt - workout.startedAt;
    const durationMins = Math.round(durationMs / 60000);
    const durationStr = durationMins >= 60 ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m` : `${durationMins}m`;

    const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.completed).length, 0);
    const totalReps = workout.exercises.reduce((sum, e) => sum + e.sets.reduce((sr, s) => sr + (s.completed ? s.reps : 0), 0), 0);
    let totalVolume = 0;
    workout.exercises.forEach((e) => e.sets.forEach((s) => { if (s.completed) totalVolume += s.weight * s.reps; }));

    const formatVolume = (vol: number) => {
        if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
        if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
        return `${vol}`;
    };

    const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

    const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
    });

    return (
        <SafeAreaView style={[s.container, { backgroundColor: c.background }]} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: c.text }]}>Workout Detail</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                <View style={s.titleSection}>
                    <Text style={[s.workoutName, { color: c.text }]}>{workout.routineName}</Text>
                    <Text style={[s.workoutDate, { color: c.textSecondary }]}>{formatDate(workout.startedAt)}</Text>
                    <Text style={[s.workoutTime, { color: c.textTertiary }]}>{formatTime(workout.startedAt)} – {formatTime(workout.endedAt)}</Text>
                </View>

                <View style={[s.statsRow, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={s.statItem}>
                        <MaterialIcons name="timer" size={20} color={Colors.primary} />
                        <Text style={[s.statVal, { color: c.text }]}>{durationStr}</Text>
                        <Text style={[s.statLabel, { color: c.textTertiary }]}>Duration</Text>
                    </View>
                    <View style={[s.statDivider, { backgroundColor: c.border }]} />
                    <View style={s.statItem}>
                        <MaterialIcons name="layers" size={20} color={Colors.primary} />
                        <Text style={[s.statVal, { color: c.text }]}>{totalSets}</Text>
                        <Text style={[s.statLabel, { color: c.textTertiary }]}>Sets</Text>
                    </View>
                    <View style={[s.statDivider, { backgroundColor: c.border }]} />
                    <View style={s.statItem}>
                        <MaterialIcons name="repeat" size={20} color={Colors.primary} />
                        <Text style={[s.statVal, { color: c.text }]}>{totalReps}</Text>
                        <Text style={[s.statLabel, { color: c.textTertiary }]}>Reps</Text>
                    </View>
                    <View style={[s.statDivider, { backgroundColor: c.border }]} />
                    <View style={s.statItem}>
                        <MaterialIcons name="monitor-weight" size={20} color={Colors.primary} />
                        <Text style={[s.statVal, { color: c.text }]}>{formatVolume(totalVolume)}</Text>
                        <Text style={[s.statLabel, { color: c.textTertiary }]}>Volume (kg)</Text>
                    </View>
                </View>

                <Text style={[s.sectionTitle, { color: c.text }]}>Exercises ({workout.exercises.length})</Text>
                {workout.exercises.map((we) => {
                    const exercise = getExerciseById(we.exerciseId);
                    const exName = exercise?.name || 'Unknown Exercise';
                    const completedSets = we.sets.filter((s) => s.completed);
                    const bestSet = completedSets.length > 0
                        ? completedSets.reduce((best, s) => (s.weight * s.reps > best.weight * best.reps ? s : best))
                        : null;

                    return (
                        <View key={we.id} style={[s.exerciseCard, { backgroundColor: c.card, borderColor: c.border }]}>
                            <View style={s.exerciseHeader}>
                                <View style={s.exerciseIcon}>
                                    <MaterialIcons name="fitness-center" size={20} color={Colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[s.exerciseName, { color: c.text }]}>{exName}</Text>
                                    {bestSet && (
                                        <Text style={s.bestSet}>Best: {bestSet.weight} kg × {bestSet.reps}</Text>
                                    )}
                                </View>
                                <Text style={[s.setCount, { color: c.textSecondary }]}>
                                    {completedSets.length}/{we.sets.length} sets
                                </Text>
                            </View>

                            <View style={s.setTable}>
                                <View style={[s.setHeaderRow, { backgroundColor: c.border }]}>
                                    <Text style={[s.setHeaderCell, { flex: 0.5, color: c.textTertiary }]}>Set</Text>
                                    <Text style={[s.setHeaderCell, { color: c.textTertiary }]}>Weight (kg)</Text>
                                    <Text style={[s.setHeaderCell, { color: c.textTertiary }]}>Reps</Text>
                                    <Text style={[s.setHeaderCell, { flex: 0.5, color: c.textTertiary }]}></Text>
                                </View>
                                {we.sets.map((set, si) => (
                                    <View key={set.id} style={s.setRow}>
                                        <Text style={[s.setCell, { flex: 0.5, color: c.text }]}>{si + 1}</Text>
                                        <Text style={[s.setCell, { color: c.text }]}>{set.weight}</Text>
                                        <Text style={[s.setCell, { color: c.text }]}>{set.reps}</Text>
                                        <View style={{ flex: 0.5, alignItems: 'center' }}>
                                            <MaterialIcons
                                                name={set.completed ? 'check-circle' : 'radio-button-unchecked'}
                                                size={18}
                                                color={set.completed ? Colors.primary : c.textTertiary}
                                            />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}
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
    scroll: { padding: Spacing.base, paddingBottom: 60 },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.base },
    emptyText: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.base },

    titleSection: { marginBottom: Spacing.lg },
    workoutName: { fontSize: FontSize.xxl, fontFamily: 'Lexend_700Bold' },
    workoutDate: { fontSize: FontSize.base, fontFamily: 'Lexend_500Medium', marginTop: 4 },
    workoutTime: { fontSize: FontSize.sm, fontFamily: 'Lexend_400Regular', marginTop: 2 },

    statsRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
        paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.xl,
    },
    statItem: { alignItems: 'center', gap: 4 },
    statVal: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold' },
    statLabel: { fontSize: 10, fontFamily: 'Lexend_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 },
    statDivider: { width: 1, height: 40 },

    sectionTitle: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', marginBottom: Spacing.base },

    exerciseCard: { borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.base, overflow: 'hidden' },
    exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.base },
    exerciseIcon: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight,
        alignItems: 'center', justifyContent: 'center',
    },
    exerciseName: { fontFamily: 'Lexend_600SemiBold', fontSize: FontSize.base },
    bestSet: { fontFamily: 'Lexend_400Regular', fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
    setCount: { fontFamily: 'Lexend_500Medium', fontSize: FontSize.xs },

    setTable: {},
    setHeaderRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, paddingVertical: 6 },
    setHeaderCell: { flex: 1, fontSize: 10, fontFamily: 'Lexend_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
    setRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, paddingVertical: 8 },
    setCell: { flex: 1, fontSize: FontSize.sm, fontFamily: 'Lexend_500Medium', textAlign: 'center' },
});
