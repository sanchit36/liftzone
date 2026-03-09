import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useWorkoutStore } from '../store/workoutStore';
import { useExerciseStore } from '../store/exerciseStore';
import { useThemeColors } from '../hooks/useThemeColors';

export default function StatisticsScreen() {
    const router = useRouter();
    const { getTotalStats, streakDays, workoutHistory } = useWorkoutStore();
    const { getExerciseById } = useExerciseStore();
    const stats = getTotalStats();
    const [activeBar, setActiveBar] = useState<number | null>(null);
    const c = useThemeColors();

    // Find favorite exercise (most common)
    const exerciseCounts: Record<string, number> = {};
    workoutHistory.forEach((w) => w.exercises.forEach((e) => {
        exerciseCounts[e.exerciseId] = (exerciseCounts[e.exerciseId] || 0) + 1;
    }));
    const favoriteId = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0];
    const favoriteExercise = favoriteId ? getExerciseById(favoriteId[0]) : null;

    // Real weekly activity: count workouts per day of last 7 days
    const weeklyData = useMemo(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const days: { label: string; count: number; volume: number }[] = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dayStart = new Date(d);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(d);
            dayEnd.setHours(23, 59, 59, 999);

            let volume = 0;
            let count = 0;
            workoutHistory.forEach((w) => {
                if (w.startedAt >= dayStart.getTime() && w.startedAt <= dayEnd.getTime()) {
                    count++;
                    w.exercises.forEach((e) => {
                        e.sets.forEach((s) => {
                            if (s.completed) volume += s.weight * s.reps;
                        });
                    });
                }
            });

            days.push({
                label: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
                count,
                volume,
            });
        }
        return days;
    }, [workoutHistory]);

    // Monthly workout counts for the bar chart
    const monthlyData = useMemo(() => {
        const months: { label: string; count: number }[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = d.getTime();
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
            const count = workoutHistory.filter((w) => w.startedAt >= monthStart && w.startedAt <= monthEnd).length;
            months.push({
                label: d.toLocaleDateString('en-US', { month: 'short' }),
                count,
            });
        }
        return months;
    }, [workoutHistory]);

    const maxMonthly = Math.max(...monthlyData.map((m) => m.count), 1);
    const maxWeeklyVol = Math.max(...weeklyData.map((d) => d.volume), 1);

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
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Statistics</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {statItems.map((item, i) => (
                        <View key={i} style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
                            <MaterialIcons name={item.icon} size={24} color={Colors.primary} />
                            <Text style={[styles.statLabel, { color: c.textSecondary }]}>{item.label}</Text>
                            <Text style={[styles.statValue, { color: c.text }]}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Highlights */}
                <View style={styles.highlights}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Highlights</Text>

                    <View style={styles.streakCard}>
                        <View style={styles.streakIcon}>
                            <MaterialIcons name="local-fire-department" size={28} color="#0f0f0f" />
                        </View>
                        <View>
                            <Text style={[styles.highlightTitle, { color: c.text }]}>Current Streak</Text>
                            <Text style={styles.streakValue}>{streakDays} Day{streakDays !== 1 ? 's' : ''} Consistent</Text>
                        </View>
                    </View>

                    {favoriteExercise && (
                        <View style={[styles.favoriteCard, { backgroundColor: c.card, borderColor: c.border }]}>
                            <View style={[styles.favoriteIcon, { backgroundColor: c.border }]}>
                                <MaterialIcons name="favorite" size={28} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.highlightTitle, { color: c.text }]}>Favorite Exercise</Text>
                                <Text style={[styles.favoriteValue, { color: c.textSecondary }]}>{favoriteExercise.name} ({favoriteId![1]} sessions)</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Weekly Volume Chart */}
                <View style={[styles.chartCard, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Weekly Volume</Text>
                    <View style={styles.chartBars}>
                        {weeklyData.map((day, i) => {
                            const heightPct = day.volume > 0 ? (day.volume / maxWeeklyVol) * 100 : 0;
                            const isActive = activeBar === i;
                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.barWrap}
                                    onPress={() => setActiveBar(isActive ? null : i)}
                                    activeOpacity={0.7}
                                >
                                    {isActive && day.volume > 0 && (
                                        <Text style={styles.barTooltip}>{formatVolume(day.volume)}</Text>
                                    )}
                                    <View style={[
                                        styles.bar,
                                        {
                                            height: `${Math.max(heightPct, 4)}%`,
                                            opacity: day.volume > 0 ? 0.3 + (day.volume / maxWeeklyVol) * 0.7 : 0.1,
                                            backgroundColor: isActive ? Colors.primaryDark : Colors.primary,
                                        }
                                    ]} />
                                    <Text style={[styles.barLabel, { color: c.textTertiary }, isActive && styles.barLabelActive]}>{day.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {weeklyData.every((d) => d.volume === 0) && (
                        <Text style={[styles.chartEmpty, { color: c.textTertiary }]}>Complete a workout to see your weekly volume</Text>
                    )}
                </View>

                {/* Monthly Workouts Chart */}
                <View style={[styles.chartCard, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Monthly Workouts</Text>
                    <View style={styles.chartBars}>
                        {monthlyData.map((m, i) => {
                            const heightPct = m.count > 0 ? (m.count / maxMonthly) * 100 : 0;
                            return (
                                <View key={i} style={styles.barWrap}>
                                    {m.count > 0 && (
                                        <Text style={styles.barCount}>{m.count}</Text>
                                    )}
                                    <View style={[
                                        styles.bar,
                                        {
                                            height: `${Math.max(heightPct, 4)}%`,
                                            opacity: m.count > 0 ? 0.3 + (m.count / maxMonthly) * 0.7 : 0.1,
                                        }
                                    ]} />
                                    <Text style={[styles.barLabel, { color: c.textTertiary }]}>{m.label}</Text>
                                </View>
                            );
                        })}
                    </View>
                    {monthlyData.every((m) => m.count === 0) && (
                        <Text style={[styles.chartEmpty, { color: c.textTertiary }]}>No workouts logged yet</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold' },
    scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.base, marginTop: Spacing.base },
    statCard: {
        width: '47%', gap: Spacing.sm, padding: Spacing.lg,
        borderRadius: BorderRadius.lg, borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    statLabel: { fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium', textTransform: 'uppercase', letterSpacing: 1 },
    statValue: { fontSize: FontSize.xxl, fontFamily: 'Lexend_700Bold' },

    highlights: { marginTop: Spacing.xxl },
    sectionTitle: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', marginBottom: Spacing.base },
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
    highlightTitle: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold' },
    streakValue: { fontSize: FontSize.base, fontFamily: 'Lexend_600SemiBold', color: Colors.primary },
    favoriteCard: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.base,
        padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1,
    },
    favoriteIcon: {
        width: 48, height: 48, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center',
    },
    favoriteValue: { fontSize: FontSize.base, fontFamily: 'Lexend_400Regular' },

    chartCard: {
        marginTop: Spacing.xxl, padding: Spacing.lg,
        borderRadius: BorderRadius.lg, borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    chartBars: { flexDirection: 'row', justifyContent: 'space-between', height: 140, gap: Spacing.sm, alignItems: 'flex-end' },
    barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
    bar: { width: '100%', backgroundColor: Colors.primary, borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 4 },
    barLabel: { fontSize: 10, fontFamily: 'Lexend_500Medium', marginTop: 6, textTransform: 'uppercase' },
    barLabelActive: { color: Colors.primary, fontFamily: 'Lexend_700Bold' },
    barTooltip: {
        fontSize: 10, fontFamily: 'Lexend_700Bold', color: Colors.primary,
        marginBottom: 4, textAlign: 'center',
    },
    barCount: {
        fontSize: 10, fontFamily: 'Lexend_700Bold', color: Colors.primary,
        marginBottom: 2,
    },
    chartEmpty: {
        textAlign: 'center', marginTop: Spacing.base,
        fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular',
    },
});
