import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useWorkoutStore } from '../store/workoutStore';
import { useSettingsStore } from '../store/settingsStore';
import { useThemeColors } from '../hooks/useThemeColors';

export default function HistoryScreen() {
    const router = useRouter();
    const { workoutHistory, removeWorkoutFromHistory } = useWorkoutStore();
    const { weightUnit } = useSettingsStore();
    const c = useThemeColors();

    const handleDeleteWorkout = (id: string, name: string) => {
        Alert.alert('Delete Workout', `Are you sure you want to delete "${name}" from your history? This will also affect your statistics.`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => removeWorkoutFromHistory(id) },
        ]);
    };

    const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

    const sortedHistory = [...workoutHistory].sort((a, b) => b.startedAt - a.startedAt);

    return (
        <SafeAreaView style={[s.container, { backgroundColor: c.background }]} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: c.text }]}>Workout History</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                {sortedHistory.length === 0 ? (
                    <View style={s.empty}>
                        <View style={[s.emptyIcon, { backgroundColor: c.border }]}>
                            <MaterialIcons name="history" size={48} color={c.textTertiary} />
                        </View>
                        <Text style={[s.emptyTitle, { color: c.textSecondary }]}>No history yet</Text>
                        <Text style={[s.emptySubtitle, { color: c.textTertiary }]}>Complete a workout to see it here.</Text>
                    </View>
                ) : (
                    sortedHistory.map((workout) => {
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
                            <View key={workout.id} style={[s.historyCard, { backgroundColor: c.card, borderColor: c.border }]}>
                                <TouchableOpacity 
                                    style={s.historyCardContent} 
                                    onPress={() => router.push(`/workout-detail?id=${workout.id}`)}
                                >
                                    <View style={s.historyHeader}>
                                        <Text style={[s.historyName, { color: c.text }]}>{workout.routineName}</Text>
                                        <Text style={[s.historyDate, { color: c.textSecondary }]}>{formatDate(workout.startedAt)}</Text>
                                    </View>
                                    
                                    <View style={s.historyStatsRow}>
                                        <View style={s.historyStat}>
                                            <MaterialIcons name="timer" size={14} color={Colors.primary} />
                                            <Text style={[s.historyStatText, { color: c.textSecondary }]}>{durationStr}</Text>
                                        </View>
                                        <View style={[s.statDot, { backgroundColor: c.textTertiary }]} />
                                        <View style={s.historyStat}>
                                            <MaterialIcons name="monitor-weight" size={14} color={Colors.primary} />
                                            <Text style={[s.historyStatText, { color: c.textSecondary }]}>{formatVolume(totalVolume)} {weightUnit}</Text>
                                        </View>
                                        <View style={[s.statDot, { backgroundColor: c.textTertiary }]} />
                                        <View style={s.historyStat}>
                                            <MaterialIcons name="fitness-center" size={14} color={Colors.primary} />
                                            <Text style={[s.historyStatText, { color: c.textSecondary }]}>{workout.exercises.length} exercises</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={s.deleteBtn} 
                                    onPress={() => handleDeleteWorkout(workout.id, workout.routineName)}
                                >
                                    <MaterialIcons name="delete-outline" size={20} color="#e74c3c" />
                                </TouchableOpacity>
                            </View>
                        );
                    })
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
    scroll: { padding: Spacing.base, paddingBottom: 60 },
    
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyIcon: {
        width: 88, height: 88, borderRadius: 44,
        alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
    },
    emptyTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', marginBottom: Spacing.sm },
    emptySubtitle: { fontSize: FontSize.md, fontFamily: 'Lexend_400Regular' },

    historyCard: {
        flexDirection: 'row', alignItems: 'center',
        padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.base,
    },
    historyCardContent: { flex: 1 },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
    historyName: { fontSize: FontSize.base, fontFamily: 'Lexend_600SemiBold', flex: 1, marginRight: Spacing.sm },
    historyDate: { fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium' },
    
    historyStatsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
    historyStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    historyStatText: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular' },
    statDot: { width: 3, height: 3, borderRadius: 1.5 },
    
    deleteBtn: { padding: Spacing.sm, marginLeft: Spacing.sm, backgroundColor: 'rgba(231,76,60,0.1)', borderRadius: BorderRadius.sm },
});
