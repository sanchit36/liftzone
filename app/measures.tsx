import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useMeasureStore, MeasureType, MEASURE_LABELS } from '../store/measureStore';

export default function MeasuresScreen() {
    const router = useRouter();
    const { getLatestByType, getMeasurementsByType } = useMeasureStore();
    const weightHistory = getMeasurementsByType('weight');
    const latestWeight = getLatestByType('weight');
    const firstWeight = weightHistory[0]?.value || 0;
    const lastWeight = weightHistory[weightHistory.length - 1]?.value || 0;
    const weightChange = lastWeight - firstWeight;
    const measureTypes: MeasureType[] = ['bodyFat', 'waist', 'chest', 'arms'];

    const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Measures</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                <View style={s.chart}>
                    <View style={s.chartTop}>
                        <View>
                            <Text style={s.chartTitle}>Body Weight</Text>
                            <Text style={s.chartSub}>Last 30 days</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={s.chartVal}>{latestWeight?.value || '—'} kg</Text>
                            <Text style={s.chartDelta}>{weightChange < 0 ? '' : '+'}{weightChange.toFixed(1)} kg</Text>
                        </View>
                    </View>
                    <Svg width="100%" height={120} viewBox="0 0 400 120" preserveAspectRatio="none">
                        <Defs>
                            <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0%" stopColor={Colors.primary} stopOpacity={0.3} />
                                <Stop offset="100%" stopColor={Colors.primary} stopOpacity={0} />
                            </LinearGradient>
                        </Defs>
                        <Path d="M0,100 Q50,80 100,85 T200,60 T300,40 T400,20 V120 H0 Z" fill="url(#g)" />
                        <Path d="M0,100 Q50,80 100,85 T200,60 T300,40 T400,20" fill="none" stroke={Colors.primary} strokeWidth={3} strokeLinecap="round" />
                    </Svg>
                </View>
                <View style={s.list}>
                    {measureTypes.map((type) => {
                        const latest = getLatestByType(type);
                        return (
                            <TouchableOpacity key={type} style={s.row}>
                                <View>
                                    <Text style={s.rowName}>{MEASURE_LABELS[type]}</Text>
                                    <Text style={s.rowDate}>{latest ? formatDate(latest.date) : 'No data'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Text style={s.rowVal}>{latest ? `${latest.value}${latest.unit}` : '—'}</Text>
                                    <MaterialIcons name="chevron-right" size={18} color={Colors.light.textTertiary} />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <TouchableOpacity style={s.addBtn}>
                    <MaterialIcons name="add" size={22} color={Colors.dark.background} />
                    <Text style={s.addText}>Add Measurement</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: 'rgba(19,236,106,0.1)' },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    scroll: { padding: Spacing.base, paddingBottom: 40 },
    chart: { backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: 'rgba(19,236,106,0.05)' },
    chartTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
    chartTitle: { fontSize: FontSize.base, fontFamily: 'Lexend_600SemiBold', color: Colors.light.text },
    chartSub: { fontSize: FontSize.sm, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary },
    chartVal: { fontSize: FontSize.xxl, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    chartDelta: { fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium', color: Colors.primary },
    list: { marginTop: Spacing.base, gap: Spacing.sm },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, backgroundColor: Colors.light.card, borderRadius: BorderRadius.sm },
    rowName: { fontSize: FontSize.base, fontFamily: 'Lexend_500Medium', color: Colors.light.text },
    rowDate: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary, marginTop: 2 },
    rowVal: { fontSize: FontSize.base, fontFamily: 'Lexend_600SemiBold', color: Colors.light.text },
    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.xxl, paddingVertical: Spacing.base, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary },
    addText: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.dark.background },
});
