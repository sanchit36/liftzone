import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { useWorkoutStore } from '../../store/workoutStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function ProfileScreen() {
    const router = useRouter();
    const { workoutHistory, streakDays } = useWorkoutStore();
    const { weightUnit } = useSettingsStore();
    const c = useThemeColors();

    const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });

    const recentHistory = [...workoutHistory].sort((a, b) => b.startedAt - a.startedAt).slice(0, 3);

    const menuItems = [
        { icon: 'bar-chart' as const, label: 'Statistics', route: '/statistics' },
        { icon: 'fitness-center' as const, label: 'Exercises', route: '/exercises' },
        { icon: 'straighten' as const, label: 'Measures', route: '/measures' },
        { icon: 'calendar-month' as const, label: 'Calendar', route: '/calendar' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={styles.logoContainer}>
                    <MaterialIcons name="fitness-center" size={22} color={Colors.primary} />
                </View>
                <Text style={[styles.logoText, { color: c.text }]}>Liftzeno</Text>
            </View>
            <View style={styles.streakBadge}>
                <MaterialIcons name="local-fire-department" size={16} color={Colors.primaryDark} />
                <Text style={[styles.streakText, { color: c.text }]}>
                    {streakDays} Day Streak
                </Text>
            </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Menu Grid */}
            <View style={styles.menuGrid}>
                {menuItems.map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.menuItem, { backgroundColor: c.card, borderColor: c.border }]}
                        activeOpacity={0.7}
                        onPress={() => router.push(item.route as any)}
                    >
                        <MaterialIcons name={item.icon} size={24} color={Colors.primary} />
                        <Text style={[styles.menuLabel, { color: c.text }]}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Workout History */}
            <View style={[styles.section, { paddingHorizontal: Spacing.base, marginBottom: Spacing.xxl }]}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: c.text }]}>Recent History</Text>
                    {workoutHistory.length > 0 && (
                        <TouchableOpacity onPress={() => router.push('/history')}>
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.historyList}>
                    {recentHistory.length === 0 ? (
                        <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }]}>
                            <MaterialIcons name="history" size={32} color={c.textTertiary} style={{ marginBottom: 8 }} />
                            <Text style={[styles.emptyCardTitle, { color: c.textSecondary }]}>No Workouts Yet</Text>
                            <Text style={[styles.emptyCardSubtitle, { color: c.textTertiary }]}>Start a workout up top and it will appear here!</Text>
                        </View>
                    ) : (
                        recentHistory.map((workout) => {
                            const durationMins = Math.round((workout.endedAt - workout.startedAt) / 60000);
                            const durationStr = durationMins >= 60 ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m` : `${durationMins}m`;
                            let totalVolume = 0;
                            workout.exercises.forEach((e) => e.sets.forEach((set) => { if (set.completed) totalVolume += set.weight * set.reps; }));

                            const formatVolume = (vol: number) => {
                                if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
                                if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
                                return `${vol}`;
                            };

                            return (
                                <TouchableOpacity
                                    key={workout.id}
                                    style={[styles.historyCard, { backgroundColor: c.card, borderColor: c.border }]}
                                    activeOpacity={0.7}
                                    onPress={() => router.push(`/workout-detail?id=${workout.id}`)}
                                >
                                    <View style={styles.historyHeader}>
                                        <Text style={[styles.historyName, { color: c.text }]}>{workout.routineName}</Text>
                                        <Text style={[styles.historyDate, { color: c.textSecondary }]}>{formatDate(workout.startedAt)}</Text>
                                    </View>
                                    <View style={styles.historyStatsRow}>
                                        <View style={styles.historyStat}>
                                            <MaterialIcons name="timer" size={14} color={Colors.primary} />
                                            <Text style={[styles.historyStatText, { color: c.textSecondary }]}>{durationStr}</Text>
                                        </View>
                                        <View style={[styles.statDot, { backgroundColor: c.textTertiary }]} />
                                        <View style={styles.historyStat}>
                                            <MaterialIcons name="monitor-weight" size={14} color={Colors.primary} />
                                            <Text style={[styles.historyStatText, { color: c.textSecondary }]}>{formatVolume(totalVolume)} {weightUnit}</Text>
                                        </View>
                                        <View style={[styles.statDot, { backgroundColor: c.textTertiary }]} />
                                        <View style={styles.historyStat}>
                                            <MaterialIcons name="fitness-center" size={14} color={Colors.primary} />
                                            <Text style={[styles.historyStatText, { color: c.textSecondary }]}>{workout.exercises.length}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </View>
        </ScrollView>
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    logoContainer: { padding: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.sm },
    logoText: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold' },
    streakBadge: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.primaryMedium, paddingHorizontal: Spacing.md, paddingVertical: 6,
        borderRadius: BorderRadius.full, borderWidth: 1, borderColor: 'rgba(19, 236, 106, 0.3)',
    },
    streakText: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold' },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, padding: Spacing.base },
    menuItem: {
        width: '47%', flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        paddingVertical: Spacing.base, paddingHorizontal: Spacing.base,
        borderRadius: BorderRadius.lg, borderWidth: 1,
    },
    menuLabel: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold' },
    section: { marginTop: Spacing.xl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
    sectionTitle: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold' },
    viewAll: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    historyList: { gap: Spacing.base },

    emptyCard: { alignItems: 'center', padding: Spacing.xl, borderRadius: BorderRadius.lg, borderWidth: 1, borderStyle: 'dashed' },
    emptyCardTitle: { fontSize: FontSize.base, fontFamily: 'Lexend_600SemiBold', marginBottom: 4 },
    emptyCardSubtitle: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', textAlign: 'center' },

    historyCard: { padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1 },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
    historyName: { fontSize: FontSize.base, fontFamily: 'Lexend_600SemiBold', flex: 1, marginRight: Spacing.sm },
    historyDate: { fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium' },
    historyStatsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
    historyStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    historyStatText: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular' },
    statDot: { width: 3, height: 3, borderRadius: 1.5 },
});
