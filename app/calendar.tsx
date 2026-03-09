import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useWorkoutStore, CompletedWorkout } from '../store/workoutStore';
import { useThemeColors } from '../hooks/useThemeColors';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarScreen() {
    const router = useRouter();
    const { workoutHistory } = useWorkoutStore();

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const c = useThemeColors();
    const [selectedDate, setSelectedDate] = useState<string | null>(
        `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    );

    // Build a set of dates that have workouts: "YYYY-M-D" → workout[]
    const workoutsByDate = useMemo(() => {
        const map: Record<string, CompletedWorkout[]> = {};
        workoutHistory.forEach((w) => {
            const d = new Date(w.startedAt);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!map[key]) map[key] = [];
            map[key].push(w);
        });
        return map;
    }, [workoutHistory]);

    // Calendar grid for current month
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun

    const calendarCells: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) calendarCells.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i);

    const isToday = (day: number) =>
        viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();

    const dateKey = (day: number) => `${viewYear}-${viewMonth}-${day}`;

    const goToPrevMonth = () => {
        if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
        else setViewMonth(viewMonth - 1);
        setSelectedDate(null);
    };

    const goToNextMonth = () => {
        if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
        else setViewMonth(viewMonth + 1);
        setSelectedDate(null);
    };

    const selectedWorkouts = selectedDate ? (workoutsByDate[selectedDate] || []) : [];
    const selectedDayNum = selectedDate ? parseInt(selectedDate.split('-')[2]) : null;

    const durationStr = (start: number, end: number) => {
        const mins = Math.round((end - start) / 60000);
        if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
        return `${mins}m`;
    };

    const totalVolume = (exercises: CompletedWorkout['exercises']) => {
        let vol = 0;
        exercises.forEach((e) => e.sets.forEach((s) => { if (s.completed) vol += s.weight * s.reps; }));
        if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k kg`;
        return `${vol} kg`;
    };

    const formatTime = (ts: number) =>
        new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // Month summary stats
    const monthWorkouts = useMemo(() => {
        return workoutHistory.filter((w) => {
            const d = new Date(w.startedAt);
            return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
        });
    }, [workoutHistory, viewYear, viewMonth]);

    const monthStats = useMemo(() => {
        let totalDuration = 0;
        let totalSets = 0;
        monthWorkouts.forEach((w) => {
            totalDuration += w.endedAt - w.startedAt;
            w.exercises.forEach((e) => { totalSets += e.sets.filter((s) => s.completed).length; });
        });
        return {
            count: monthWorkouts.length,
            hours: (totalDuration / (1000 * 60 * 60)).toFixed(1),
            sets: totalSets,
        };
    }, [monthWorkouts]);

    return (
        <SafeAreaView style={[s.container, { backgroundColor: c.background }]} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: c.text }]}>Calendar</Text>
                <TouchableOpacity onPress={() => {
                    setViewYear(today.getFullYear()); setViewMonth(today.getMonth());
                    setSelectedDate(`${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`);
                }}>
                    <Text style={s.todayBtn}>Today</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                {/* Calendar Card */}
                <View style={[s.calCard, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={s.monthRow}>
                        <TouchableOpacity onPress={goToPrevMonth}>
                            <MaterialIcons name="chevron-left" size={24} color={c.textSecondary} />
                        </TouchableOpacity>
                        <Text style={[s.monthText, { color: c.text }]}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
                        <TouchableOpacity onPress={goToNextMonth}>
                            <MaterialIcons name="chevron-right" size={24} color={c.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={s.dayHeaders}>
                        {DAY_LABELS.map((d, i) => <Text key={i} style={[s.dayHeader, { color: c.textTertiary }]}>{d}</Text>)}
                    </View>
                    <View style={s.grid}>
                        {calendarCells.map((day, i) => {
                            const key = day ? dateKey(day) : '';
                            const hasWorkout = day ? !!workoutsByDate[key] : false;
                            const isSelected = day ? selectedDate === key : false;
                            const isTodayCell = day ? isToday(day) : false;

                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        s.dayCell,
                                        isSelected && s.dayCellSelected,
                                        isTodayCell && !isSelected && s.dayCellToday,
                                    ]}
                                    onPress={() => day && setSelectedDate(key)}
                                    disabled={!day}
                                >
                                    {day && (
                                        <>
                                            <Text style={[
                                                s.dayNum,
                                                { color: c.text },
                                                isSelected && s.dayNumSelected,
                                                isTodayCell && !isSelected && s.dayNumToday,
                                            ]}>{day}</Text>
                                            {hasWorkout && (
                                                <View style={[s.dot, isSelected && s.dotSelected]} />
                                            )}
                                        </>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Month Summary */}
                <View style={[s.summaryRow, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={s.summaryItem}>
                        <Text style={s.summaryVal}>{monthStats.count}</Text>
                        <Text style={[s.summaryLabel, { color: c.textSecondary }]}>Workouts</Text>
                    </View>
                    <View style={[s.summaryDivider, { backgroundColor: c.border }]} />
                    <View style={s.summaryItem}>
                        <Text style={s.summaryVal}>{monthStats.hours}</Text>
                        <Text style={[s.summaryLabel, { color: c.textSecondary }]}>Hours</Text>
                    </View>
                    <View style={[s.summaryDivider, { backgroundColor: c.border }]} />
                    <View style={s.summaryItem}>
                        <Text style={s.summaryVal}>{monthStats.sets}</Text>
                        <Text style={[s.summaryLabel, { color: c.textSecondary }]}>Sets</Text>
                    </View>
                </View>

                {/* Workouts for selected day */}
                <View style={s.workoutsSection}>
                    <View style={s.workoutsSectionHeader}>
                        <Text style={[s.workoutsTitle, { color: c.text }]}>
                            {selectedDayNum
                                ? `${MONTH_NAMES[viewMonth].slice(0, 3)} ${selectedDayNum}`
                                : 'Select a day'}
                        </Text>
                        {selectedWorkouts.length > 0 && (
                            <View style={s.badge}>
                                <Text style={s.badgeText}>{selectedWorkouts.length} workout{selectedWorkouts.length > 1 ? 's' : ''}</Text>
                            </View>
                        )}
                    </View>
                    {selectedWorkouts.length > 0 ? (
                        <View style={s.workoutCards}>
                            {selectedWorkouts.map((w) => (
                                <TouchableOpacity key={w.id} style={[s.wCard, { backgroundColor: c.card, borderColor: c.border }]} onPress={() => router.push(`/workout-detail?id=${w.id}` as any)}>
                                    <View style={s.wIcon}>
                                        <MaterialIcons name="fitness-center" size={24} color={Colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[s.wName, { color: c.text }]}>{w.routineName}</Text>
                                        <Text style={[s.wMeta, { color: c.textSecondary }]}>
                                            {durationStr(w.startedAt, w.endedAt)} • {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''} • {totalVolume(w.exercises)} vol
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                        <Text style={[s.wTime, { color: c.textTertiary }]}>{formatTime(w.startedAt)}</Text>
                                        <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={s.restDay}>
                            <MaterialIcons name="self-improvement" size={32} color={c.textTertiary} />
                            <Text style={[s.restText, { color: c.textTertiary }]}>{selectedDate ? 'Rest Day' : 'Tap a date to see workouts'}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.lg },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold' },
    todayBtn: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    scroll: { paddingHorizontal: Spacing.base, paddingBottom: 40 },

    calCard: { borderRadius: BorderRadius.lg, padding: Spacing.base, borderWidth: 1 },
    monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg, paddingHorizontal: Spacing.sm },
    monthText: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold' },
    dayHeaders: { flexDirection: 'row', marginBottom: Spacing.sm },
    dayHeader: { flex: 1, textAlign: 'center', fontSize: FontSize.xs, fontFamily: 'Lexend_600SemiBold', textTransform: 'uppercase' },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, position: 'relative' },
    dayCellSelected: { backgroundColor: Colors.primary },
    dayCellToday: { borderWidth: 2, borderColor: Colors.primary },
    dayNum: { fontSize: FontSize.sm, fontFamily: 'Lexend_500Medium' },
    dayNumSelected: { color: '#000', fontFamily: 'Lexend_700Bold' },
    dayNumToday: { color: Colors.primary, fontFamily: 'Lexend_700Bold' },
    dot: { position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.primary },
    dotSelected: { backgroundColor: '#000' },

    summaryRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
        marginTop: Spacing.base, paddingVertical: Spacing.base,
        borderRadius: BorderRadius.lg, borderWidth: 1,
    },
    summaryItem: { alignItems: 'center' },
    summaryVal: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    summaryLabel: { fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium', marginTop: 2 },
    summaryDivider: { width: 1, height: 32 },

    workoutsSection: { marginTop: Spacing.xxl },
    workoutsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
    workoutsTitle: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold' },
    badge: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
    badgeText: { fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium', color: Colors.primary },
    workoutCards: { gap: Spacing.base },
    wCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, padding: Spacing.base, borderRadius: BorderRadius.lg, borderWidth: 1 },
    wIcon: { width: 48, height: 48, borderRadius: BorderRadius.sm, backgroundColor: Colors.primaryMedium, alignItems: 'center', justifyContent: 'center' },
    wName: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold' },
    wMeta: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular' },
    wTime: { fontSize: 10, fontFamily: 'Lexend_700Bold' },
    restDay: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
    restText: { fontSize: FontSize.base, fontFamily: 'Lexend_500Medium' },
});
