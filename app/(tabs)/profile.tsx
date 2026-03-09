import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { useWorkoutStore } from '../../store/workoutStore';

export default function ProfileScreen() {
    const router = useRouter();
    const { workoutHistory, streakDays } = useWorkoutStore();

    const timeAgo = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    const durationStr = (start: number, end: number) => {
        const mins = Math.round((end - start) / 60000);
        if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
        return `${mins}m`;
    };

    const totalVolume = (exercises: typeof workoutHistory[0]['exercises']) => {
        let vol = 0;
        exercises.forEach((e) => e.sets.forEach((s) => { if (s.completed) vol += s.weight * s.reps; }));
        if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
        return `${vol}`;
    };

    const menuItems = [
        { icon: 'bar-chart' as const, label: 'Statistics', route: '/statistics' },
        { icon: 'fitness-center' as const, label: 'Exercises', route: '/exercises' },
        { icon: 'straighten' as const, label: 'Measures', route: '/measures' },
        { icon: 'calendar-month' as const, label: 'Calendar', route: '/calendar' },
    ];

    const getWorkoutIcon = (index: number): keyof typeof MaterialIcons.glyphMap => {
        const icons: Array<keyof typeof MaterialIcons.glyphMap> = ['flash-on', 'sports-martial-arts', 'restart-alt', 'fitness-center'];
        return icons[index % icons.length];
    };

    return (

        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoContainer}>
                        <MaterialIcons name="fitness-center" size={22} color={Colors.primary} />
                    </View>
                    <Text style={styles.logoText}>Liftzeno</Text>
                </View>
                <View style={styles.streakBadge}>
                    <MaterialIcons name="local-fire-department" size={16} color={Colors.primaryDark} />
                    <Text style={styles.streakText}>
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
                            style={styles.menuItem}
                            activeOpacity={0.7}
                            onPress={() => router.push(item.route as any)}
                        >
                            <MaterialIcons name={item.icon} size={24} color={Colors.primary} />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Workout History */}
                <View style={styles.historySection}>
                    <View style={styles.historySectionHeader}>
                        <Text style={styles.historyTitle}>Workout History</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.historyList}>
                        {workoutHistory.slice(0, 3).map((w, i) => (
                            <TouchableOpacity key={w.id} style={styles.historyCard} activeOpacity={0.7} onPress={() => router.push(`/workout-detail?id=${w.id}` as any)}>
                                <View style={styles.historyIcon}>
                                    <MaterialIcons name={getWorkoutIcon(i)} size={24} color={Colors.primary} />
                                </View>
                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyName}>{w.routineName}</Text>
                                    <Text style={styles.historyMeta}>
                                        {timeAgo(w.startedAt)} • {durationStr(w.startedAt, w.endedAt)} • {totalVolume(w.exercises)}kg vol.
                                    </Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color={Colors.light.borderDark} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    scrollContent: { paddingBottom: 40 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    logoContainer: {
        padding: Spacing.sm,
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.sm,
    },
    logoText: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.primaryMedium,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(19, 236, 106, 0.3)',
    },
    streakText: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    chartCard: {
        marginHorizontal: Spacing.base,
        padding: Spacing.lg,
        backgroundColor: Colors.light.card,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    chartHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.xl },
    chartLabel: { fontSize: FontSize.sm, fontFamily: 'Lexend_500Medium', color: Colors.light.textSecondary },
    chartValue: { fontSize: FontSize.xxxl, fontFamily: 'Lexend_700Bold', color: Colors.light.text, marginTop: 4 },
    chartUnit: { fontSize: FontSize.sm, fontFamily: 'Lexend_400Regular', color: Colors.light.textTertiary },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    trendText: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    barChart: { flexDirection: 'row', height: 128, gap: Spacing.base, paddingHorizontal: Spacing.sm },
    barCol: { flex: 1, alignItems: 'center', gap: Spacing.sm },
    barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end', borderRadius: 4, overflow: 'hidden' },
    barFill: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
    barActive: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    barLabel: { fontSize: 10, fontFamily: 'Lexend_700Bold', color: Colors.light.textTertiary, textTransform: 'uppercase', letterSpacing: 1 },
    barLabelActive: { color: Colors.primary },
    chartEmpty: { textAlign: 'center', marginTop: Spacing.base, fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', color: Colors.light.textTertiary },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        padding: Spacing.base,
    },
    menuItem: {
        width: '47%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.base,
        paddingHorizontal: Spacing.base,
        backgroundColor: Colors.light.card,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    menuLabel: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    historySection: { paddingHorizontal: Spacing.base, marginBottom: Spacing.xxl },
    historySectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
    historyTitle: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    viewAll: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    historyList: { gap: Spacing.md },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.base,
        padding: Spacing.base,
        backgroundColor: Colors.light.card,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    historyIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyInfo: { flex: 1 },
    historyName: { fontFamily: 'Lexend_700Bold', fontSize: FontSize.base, color: Colors.light.text },
    historyMeta: { fontFamily: 'Lexend_400Regular', fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 2 },
});
