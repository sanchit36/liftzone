import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useWorkoutStore } from '../store/workoutStore';

export default function StatisticsScreen() {
    const router = useRouter();
    const { getTotalStats, streakDays, workoutHistory } = useWorkoutStore();
    const stats = getTotalStats();

    // Find favorite exercise (most common)
    const exerciseCounts: Record<string, number> = {};
    workoutHistory.forEach((w) => w.exercises.forEach((e) => {
        exerciseCounts[e.exerciseId] = (exerciseCounts[e.exerciseId] || 0) + 1;
    }));
    const favoriteId = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0];

    const { getExerciseById } = require('../store/exerciseStore').useExerciseStore.getState();
    const favoriteExercise = favoriteId ? getExerciseById(favoriteId[0]) : null;

    const weeklyActivity = [40, 60, 35, 80, 100, 55, 20];
    const maxActivity = Math.max(...weeklyActivity);

    const formatVolume = (vol: number) => {
        if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
        if (vol >= 1000) return `${(vol / 1000).toFixed(0)}k`;
        return `${vol}`;
    };

    const statItems = [
        { icon: 'fitness-center' as const, label: 'Total Workouts', value: `${stats.workouts}` },
        { icon: 'layers' as const, label: 'Total Sets', value: stats.sets.toLocaleString() },
        { icon: 'repeat' as const, label: 'Total Reps', value: stats.reps.toLocaleString() },
        { icon: 'monitor-weight' as const, label: 'Total Volume', value: `${formatVolume(stats.volume)} kg` },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Statistics</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Brief */}
                <View style={styles.profileBrief}>
                    <View style={styles.profileAvatar}>
                        <MaterialIcons name="person" size={32} color={Colors.primary} />
                    </View>
                    <View>
                        <Text style={styles.profileSubtitle}>Activity Overview</Text>
                        <Text style={styles.profileName}>Alex Johnson</Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {statItems.map((item, i) => (
                        <View key={i} style={styles.statCard}>
                            <MaterialIcons name={item.icon} size={24} color={Colors.primary} />
                            <Text style={styles.statLabel}>{item.label}</Text>
                            <Text style={styles.statValue}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Highlights */}
                <View style={styles.highlights}>
                    <Text style={styles.sectionTitle}>Highlights</Text>

                    <View style={styles.streakCard}>
                        <View style={styles.streakIcon}>
                            <MaterialIcons name="local-fire-department" size={28} color={Colors.dark.background} />
                        </View>
                        <View>
                            <Text style={styles.highlightTitle}>Longest Streak</Text>
                            <Text style={styles.streakValue}>{streakDays} Days Consistent</Text>
                        </View>
                    </View>

                    {favoriteExercise && (
                        <View style={styles.favoriteCard}>
                            <View style={styles.favoriteIcon}>
                                <MaterialIcons name="favorite" size={28} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.highlightTitle}>Favorite Exercise</Text>
                                <Text style={styles.favoriteValue}>{favoriteExercise.name} ({favoriteId![1]} sessions)</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Weekly Activity Chart */}
                <View style={styles.chartCard}>
                    <View style={styles.chartBars}>
                        {weeklyActivity.map((val, i) => (
                            <View key={i} style={[styles.bar, { height: `${(val / maxActivity) * 100}%`, opacity: 0.2 + (val / maxActivity) * 0.8 }]} />
                        ))}
                    </View>
                    <Text style={styles.chartLabel}>Weekly Activity Level</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },

    profileBrief: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, paddingVertical: Spacing.base },
    profileAvatar: {
        width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryMedium,
        alignItems: 'center', justifyContent: 'center',
    },
    profileSubtitle: { fontSize: FontSize.sm, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary },
    profileName: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.light.text },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.base, marginTop: Spacing.base },
    statCard: {
        width: '47%', gap: Spacing.sm, padding: Spacing.lg,
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.light.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    statLabel: { fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium', color: Colors.light.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
    statValue: { fontSize: FontSize.xxl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },

    highlights: { marginTop: Spacing.xxl },
    sectionTitle: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.light.text, marginBottom: Spacing.base },
    streakCard: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.base,
        padding: Spacing.lg, borderRadius: BorderRadius.lg,
        backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primaryMedium,
        marginBottom: Spacing.base,
    },
    streakIcon: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    highlightTitle: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    streakValue: { fontSize: FontSize.base, fontFamily: 'Lexend_600SemiBold', color: Colors.primary },
    favoriteCard: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.base,
        padding: Spacing.lg, borderRadius: BorderRadius.lg,
        backgroundColor: Colors.light.card, borderWidth: 1, borderColor: Colors.light.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    favoriteIcon: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.light.border,
        alignItems: 'center', justifyContent: 'center',
    },
    favoriteValue: { fontSize: FontSize.base, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary },

    chartCard: {
        marginTop: Spacing.xxl, padding: Spacing.lg,
        backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.light.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    chartBars: { flexDirection: 'row', justifyContent: 'space-between', height: 128, gap: Spacing.sm, alignItems: 'flex-end' },
    bar: { flex: 1, backgroundColor: Colors.primary, borderTopLeftRadius: 3, borderTopRightRadius: 3, minHeight: 8 },
    chartLabel: {
        textAlign: 'center', marginTop: Spacing.base,
        fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium', color: Colors.light.textTertiary,
        textTransform: 'uppercase', letterSpacing: 1.5,
    },
});
