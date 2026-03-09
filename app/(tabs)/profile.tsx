import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { useWorkoutStore } from '../../store/workoutStore';

export default function ProfileScreen() {
    const router = useRouter();
    const { workoutHistory } = useWorkoutStore();

    const weeklyData = [40, 100, 65, 80];
    const maxVal = Math.max(...weeklyData);

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
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerBtn}>
                        <MaterialIcons name="settings" size={24} color={Colors.light.textSecondary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>User Name</Text>
                    <TouchableOpacity style={styles.headerBtn}>
                        <MaterialIcons name="notifications" size={24} color={Colors.light.textSecondary} />
                        <View style={styles.notifDot} />
                    </TouchableOpacity>
                </View>

                {/* Profile Avatar */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarRing}>
                            <View style={styles.avatar}>
                                <MaterialIcons name="person" size={48} color={Colors.primary} />
                            </View>
                        </View>
                        <View style={styles.editBadge}>
                            <MaterialIcons name="edit" size={14} color={Colors.dark.background} />
                        </View>
                    </View>
                    <Text style={styles.profileName}>Alex Johnson</Text>
                    <View style={styles.profileMeta}>
                        <Text style={styles.memberLabel}>Gold Member</Text>
                        <View style={styles.dot} />
                        <Text style={styles.joinDate}>Joined Jan 2023</Text>
                    </View>
                </View>

                {/* Weekly Chart */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <View>
                            <Text style={styles.chartLabel}>Weekly Workout Hours</Text>
                            <Text style={styles.chartValue}>12.5 <Text style={styles.chartUnit}>hrs</Text></Text>
                        </View>
                        <View style={styles.trendBadge}>
                            <MaterialIcons name="trending-up" size={16} color={Colors.primary} />
                            <Text style={styles.trendText}>+15%</Text>
                        </View>
                    </View>
                    <View style={styles.barChart}>
                        {weeklyData.map((val, i) => (
                            <View key={i} style={styles.barCol}>
                                <View style={styles.barTrack}>
                                    <View
                                        style={[
                                            styles.barFill,
                                            {
                                                height: `${(val / maxVal) * 100}%`,
                                                backgroundColor: i === 1 ? Colors.primary : Colors.light.border,
                                            },
                                            i === 1 && styles.barActive,
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.barLabel, i === 1 && styles.barLabelActive]}>Wk {i + 1}</Text>
                            </View>
                        ))}
                    </View>
                </View>

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
                            <TouchableOpacity key={w.id} style={styles.historyCard} activeOpacity={0.7}>
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
        padding: Spacing.base,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.borderDark,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    notifDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
    profileSection: { alignItems: 'center', paddingVertical: Spacing.lg },
    avatarContainer: { position: 'relative', marginBottom: Spacing.base },
    avatarRing: {
        padding: 4,
        borderRadius: 56,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryMedium,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: Colors.light.background,
    },
    profileName: { fontSize: FontSize.xxl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    profileMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
    memberLabel: { fontSize: FontSize.sm, fontFamily: 'Lexend_500Medium', color: Colors.primary },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.light.textTertiary },
    joinDate: { fontSize: FontSize.sm, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary },
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
