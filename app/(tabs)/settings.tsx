import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function SettingsScreen() {
    const {
        weightUnit, toggleWeightUnit,
        restTimerEnabled, setRestTimerEnabled,
        restTimerDuration, setRestTimerDuration,
        darkMode, toggleDarkMode,
    } = useSettingsStore();
    const c = useThemeColors();

    const timerOptions = [30, 60, 90, 120, 180];

    return (
        <SafeAreaView style={[s.container, { backgroundColor: c.background }]} edges={['top']}>
            <View style={s.header}>
                <Text style={[s.headerTitle, { color: c.text }]}>Settings</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                {/* Appearance */}
                <Text style={[s.sectionTitle, { color: c.textSecondary }]}>Appearance</Text>
                <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={s.row}>
                        <View style={s.rowLeft}>
                            <View style={[s.iconWrap, { backgroundColor: darkMode ? 'rgba(19,236,106,0.2)' : Colors.primaryLight }]}>
                                <MaterialIcons name={darkMode ? 'dark-mode' : 'light-mode'} size={20} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={[s.rowTitle, { color: c.text }]}>Dark Mode</Text>
                                <Text style={[s.rowSub, { color: c.textTertiary }]}>{darkMode ? 'Dark theme active' : 'Light theme active'}</Text>
                            </View>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={toggleDarkMode}
                            trackColor={{ false: c.border, true: Colors.primaryMedium }}
                            thumbColor={darkMode ? Colors.primary : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Units */}
                <Text style={[s.sectionTitle, { color: c.textSecondary }]}>Units</Text>
                <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={s.row}>
                        <View style={s.rowLeft}>
                            <View style={[s.iconWrap, { backgroundColor: Colors.primaryLight }]}>
                                <MaterialIcons name="monitor-weight" size={20} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={[s.rowTitle, { color: c.text }]}>Weight Unit</Text>
                                <Text style={[s.rowSub, { color: c.textTertiary }]}>{weightUnit === 'kg' ? 'Kilograms (kg)' : 'Pounds (lbs)'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={[s.unitToggle, { borderColor: Colors.primary }]} onPress={toggleWeightUnit}>
                            <Text style={s.unitToggleText}>{weightUnit.toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Rest Timer */}
                <Text style={[s.sectionTitle, { color: c.textSecondary }]}>Rest Timer</Text>
                <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={s.row}>
                        <View style={s.rowLeft}>
                            <View style={[s.iconWrap, { backgroundColor: Colors.primaryLight }]}>
                                <MaterialIcons name="timer" size={20} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={[s.rowTitle, { color: c.text }]}>Auto Rest Timer</Text>
                                <Text style={[s.rowSub, { color: c.textTertiary }]}>Start timer after completing a set</Text>
                            </View>
                        </View>
                        <Switch
                            value={restTimerEnabled}
                            onValueChange={setRestTimerEnabled}
                            trackColor={{ false: c.border, true: Colors.primaryMedium }}
                            thumbColor={restTimerEnabled ? Colors.primary : '#f4f3f4'}
                        />
                    </View>

                    {restTimerEnabled && (
                        <>
                            <View style={[s.divider, { backgroundColor: c.border }]} />
                            <Text style={[s.timerLabel, { color: c.textSecondary }]}>Default Duration</Text>
                            <View style={s.timerRow}>
                                {timerOptions.map((secs) => (
                                    <TouchableOpacity
                                        key={secs}
                                        style={[
                                            s.timerChip,
                                            { borderColor: restTimerDuration === secs ? Colors.primary : c.border },
                                            restTimerDuration === secs && { backgroundColor: Colors.primaryMedium },
                                        ]}
                                        onPress={() => setRestTimerDuration(secs)}
                                    >
                                        <Text style={[
                                            s.timerChipText,
                                            { color: restTimerDuration === secs ? Colors.primary : c.textSecondary },
                                            restTimerDuration === secs && { fontFamily: 'Lexend_700Bold' },
                                        ]}>
                                            {secs >= 60 ? `${secs / 60}m` : `${secs}s`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}
                </View>

                {/* About */}
                <Text style={[s.sectionTitle, { color: c.textSecondary }]}>About</Text>
                <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <View style={s.row}>
                        <View style={s.rowLeft}>
                            <View style={[s.iconWrap, { backgroundColor: Colors.primaryLight }]}>
                                <MaterialIcons name="info-outline" size={20} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={[s.rowTitle, { color: c.text }]}>Liftzeno</Text>
                                <Text style={[s.rowSub, { color: c.textTertiary }]}>Version 1.0.0</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.lg },
    headerTitle: { fontSize: FontSize.xxl, fontFamily: 'Lexend_700Bold' },
    scroll: { paddingHorizontal: Spacing.base, paddingBottom: 40 },

    sectionTitle: {
        fontSize: FontSize.xs, fontFamily: 'Lexend_600SemiBold',
        textTransform: 'uppercase', letterSpacing: 1, marginTop: Spacing.lg, marginBottom: Spacing.sm,
    },

    card: {
        borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden',
    },

    row: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, flex: 1 },
    iconWrap: {
        width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    },
    rowTitle: { fontSize: FontSize.base, fontFamily: 'Lexend_600SemiBold' },
    rowSub: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', marginTop: 2 },

    unitToggle: {
        paddingHorizontal: Spacing.base, paddingVertical: 6,
        borderRadius: BorderRadius.full, borderWidth: 1.5,
    },
    unitToggleText: { fontSize: FontSize.sm, fontFamily: 'Lexend_700Bold', color: Colors.primary },

    divider: { height: 1, marginHorizontal: Spacing.base },
    timerLabel: {
        fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium',
        paddingHorizontal: Spacing.base, paddingTop: Spacing.sm,
    },
    timerRow: {
        flexDirection: 'row', gap: Spacing.sm,
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    },
    timerChip: {
        flex: 1, alignItems: 'center', paddingVertical: 8,
        borderRadius: BorderRadius.sm, borderWidth: 1,
    },
    timerChipText: { fontSize: FontSize.sm, fontFamily: 'Lexend_500Medium' },
});
