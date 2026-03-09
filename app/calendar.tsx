import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useWorkoutStore } from '../store/workoutStore';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen() {
    const router = useRouter();
    const { workoutHistory } = useWorkoutStore();
    const [selectedDay, setSelectedDay] = useState(12);

    // Generate workout days from history (mock: days 3,6,10,12,16,20)
    const workoutDays = new Set([3, 6, 10, 12, 16, 20]);

    // Calendar grid: October 2023 starts on Wednesday (index 3)
    const startOffset = 3;
    const daysInMonth = 31;
    const calendarCells: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) calendarCells.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i);

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={Colors.light.textSecondary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Calendar</Text>
                <TouchableOpacity>
                    <MaterialIcons name="more-horiz" size={24} color={Colors.light.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                {/* Calendar Card */}
                <View style={s.calCard}>
                    <View style={s.monthRow}>
                        <TouchableOpacity><MaterialIcons name="chevron-left" size={24} color={Colors.light.textSecondary} /></TouchableOpacity>
                        <Text style={s.monthText}>October 2023</Text>
                        <TouchableOpacity><MaterialIcons name="chevron-right" size={24} color={Colors.light.textSecondary} /></TouchableOpacity>
                    </View>
                    <View style={s.dayHeaders}>
                        {DAYS.map((d, i) => <Text key={i} style={s.dayHeader}>{d}</Text>)}
                    </View>
                    <View style={s.grid}>
                        {calendarCells.map((day, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[s.dayCell, day === selectedDay && s.dayCellSelected]}
                                onPress={() => day && setSelectedDay(day)}
                                disabled={!day}
                            >
                                {day && (
                                    <>
                                        <Text style={[s.dayNum, day === selectedDay && s.dayNumSelected]}>{day}</Text>
                                        {workoutDays.has(day) && (
                                            <View style={[s.dot, day === selectedDay && s.dotSelected]} />
                                        )}
                                    </>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Workouts for selected day */}
                <View style={s.workoutsSection}>
                    <View style={s.workoutsSectionHeader}>
                        <Text style={s.workoutsTitle}>Workouts for Oct {selectedDay}</Text>
                        {workoutDays.has(selectedDay) && (
                            <View style={s.badge}><Text style={s.badgeText}>Completed</Text></View>
                        )}
                    </View>
                    {workoutDays.has(selectedDay) ? (
                        <View style={s.workoutCards}>
                            <View style={s.wCard}>
                                <View style={s.wIcon}><MaterialIcons name="fitness-center" size={24} color={Colors.primary} /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.wName}>Strength Training</Text>
                                    <Text style={s.wMeta}>45 mins • High Intensity</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                    <Text style={s.wTime}>07:30 AM</Text>
                                    <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={s.restDay}>
                            <MaterialIcons name="self-improvement" size={32} color={Colors.light.textTertiary} />
                            <Text style={s.restText}>Rest Day</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.lg },
    backBtn: { padding: Spacing.sm, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.04)' },
    headerTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    scroll: { paddingHorizontal: Spacing.base, paddingBottom: 40 },
    calCard: { backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg, padding: Spacing.base, borderWidth: 1, borderColor: Colors.light.border },
    monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg, paddingHorizontal: Spacing.sm },
    monthText: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    dayHeaders: { flexDirection: 'row', marginBottom: Spacing.sm },
    dayHeader: { flex: 1, textAlign: 'center', fontSize: FontSize.xs, fontFamily: 'Lexend_600SemiBold', color: Colors.light.textTertiary, textTransform: 'uppercase' },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, position: 'relative' },
    dayCellSelected: { backgroundColor: Colors.primary },
    dayNum: { fontSize: FontSize.sm, fontFamily: 'Lexend_500Medium', color: Colors.light.text },
    dayNumSelected: { color: Colors.dark.background, fontFamily: 'Lexend_700Bold' },
    dot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary },
    dotSelected: { backgroundColor: Colors.dark.background },
    workoutsSection: { marginTop: Spacing.xxl },
    workoutsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
    workoutsTitle: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    badge: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
    badgeText: { fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium', color: Colors.primary },
    workoutCards: { gap: Spacing.base },
    wCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, backgroundColor: Colors.light.card, padding: Spacing.base, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.light.border },
    wIcon: { width: 48, height: 48, borderRadius: BorderRadius.sm, backgroundColor: Colors.primaryMedium, alignItems: 'center', justifyContent: 'center' },
    wName: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    wMeta: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary },
    wTime: { fontSize: 10, fontFamily: 'Lexend_700Bold', color: Colors.light.textTertiary },
    restDay: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
    restText: { fontSize: FontSize.base, fontFamily: 'Lexend_500Medium', color: Colors.light.textTertiary },
});
