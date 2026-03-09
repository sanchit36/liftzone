import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line, Text as SvgText } from 'react-native-svg';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useMeasureStore, MeasureType, MEASURE_LABELS, MEASURE_LIMITS } from '../store/measureStore';
import { useThemeColors } from '../hooks/useThemeColors';

const ALL_TYPES: MeasureType[] = ['weight', 'bodyFat', 'waist', 'chest', 'arms'];
const UNIT_MAP: Record<MeasureType, string> = { weight: 'kg', bodyFat: '%', waist: 'cm', chest: 'cm', arms: 'cm' };
const CHART_W = 340;
const CHART_H = 160;
const PAD = { top: 20, bottom: 30, left: 40, right: 16 };

export default function MeasuresScreen() {
    const router = useRouter();
    const { addMeasurement, removeMeasurement, getMeasurementsByType, getLatestByType, hasEntryToday } = useMeasureStore();
    const [selectedType, setSelectedType] = useState<MeasureType>('weight');
    const [activePoint, setActivePoint] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const c = useThemeColors();
    const [addType, setAddType] = useState<MeasureType>('weight');
    const [addValue, setAddValue] = useState('');

    const data = getMeasurementsByType(selectedType);
    const latest = getLatestByType(selectedType);
    const unit = UNIT_MAP[selectedType];
    const limits = MEASURE_LIMITS[selectedType];

    // Calculate change
    const first = data[0]?.value || 0;
    const last = data[data.length - 1]?.value || 0;
    const change = data.length >= 2 ? last - first : 0;

    // Build chart points
    const plotW = CHART_W - PAD.left - PAD.right;
    const plotH = CHART_H - PAD.top - PAD.bottom;

    let points: { x: number; y: number; value: number; date: number }[] = [];
    if (data.length > 0) {
        const minVal = Math.min(...data.map((d) => d.value));
        const maxVal = Math.max(...data.map((d) => d.value));
        const range = maxVal - minVal || 1;
        points = data.map((d, i) => ({
            x: PAD.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW),
            y: PAD.top + plotH - ((d.value - minVal) / range) * plotH,
            value: d.value,
            date: d.date,
        }));
    }

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = points.length > 0
        ? `${linePath} L${points[points.length - 1].x},${CHART_H - PAD.bottom} L${points[0].x},${CHART_H - PAD.bottom} Z`
        : '';

    const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const formatDateLong = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const handleAddMeasurement = () => {
        const val = parseFloat(addValue);
        const addLimits = MEASURE_LIMITS[addType];

        // Validation: empty or non-numeric
        if (isNaN(val)) {
            Alert.alert('Invalid Value', 'Please enter a valid number.');
            return;
        }

        // Validation: must be positive
        if (val <= 0) {
            Alert.alert('Invalid Value', 'Value must be greater than zero.');
            return;
        }

        // Validation: within limits
        if (val < addLimits.min || val > addLimits.max) {
            Alert.alert(
                'Out of Range',
                `${MEASURE_LABELS[addType]} should be between ${addLimits.min} and ${addLimits.max} ${addLimits.unit}.`
            );
            return;
        }

        // Validation: one entry per day per type
        if (hasEntryToday(addType)) {
            Alert.alert(
                'Already Recorded',
                `You've already added a ${MEASURE_LABELS[addType]} measurement today. Only one entry per day is allowed.`
            );
            return;
        }

        addMeasurement({
            id: `m-${Date.now()}`, type: addType,
            value: val, unit: UNIT_MAP[addType], date: Date.now(),
        });
        setAddValue('');
        setShowAddModal(false);
        setSelectedType(addType);
    };

    const handleDeleteMeasurement = (id: string, value: number) => {
        Alert.alert(
            'Delete Entry',
            `Remove ${value} ${unit} entry?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: () => {
                        removeMeasurement(id);
                        setActivePoint(null);
                    },
                },
            ]
        );
    };

    const handleTapPoint = (index: number) => {
        setActivePoint(activePoint === index ? null : index);
    };

    return (
        <SafeAreaView style={[s.container, { backgroundColor: c.background }]} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: c.text }]}>Measures</Text>
                <TouchableOpacity onPress={() => { setAddType(selectedType); setShowAddModal(true); }} style={s.backBtn}>
                    <MaterialIcons name="add" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                {/* Type Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
                    {ALL_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[s.tab, selectedType === type && s.tabActive]}
                            onPress={() => { setSelectedType(type); setActivePoint(null); }}
                        >
                            <Text style={[s.tabText, selectedType === type && s.tabTextActive]}>
                                {MEASURE_LABELS[type]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Chart Card */}
                <View style={s.chart}>
                    <View style={s.chartTop}>
                        <View>
                            <Text style={s.chartTitle}>{MEASURE_LABELS[selectedType]}</Text>
                            <Text style={s.chartSub}>
                                {activePoint !== null
                                    ? formatDate(points[activePoint].date)
                                    : data.length > 0 ? `${data.length} entr${data.length === 1 ? 'y' : 'ies'}` : 'No data yet'}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={s.chartVal}>
                                {activePoint !== null
                                    ? `${points[activePoint].value} ${unit}`
                                    : latest ? `${latest.value} ${unit}` : '—'}
                            </Text>
                            {data.length >= 2 && activePoint === null && (
                                <Text style={[s.chartDelta, {
                                    color: selectedType === 'weight' || selectedType === 'bodyFat' || selectedType === 'waist'
                                        ? (change <= 0 ? Colors.primary : '#e74c3c')
                                        : (change >= 0 ? Colors.primary : '#e74c3c')
                                }]}>
                                    {change < 0 ? '' : '+'}{change.toFixed(1)} {unit}
                                </Text>
                            )}
                        </View>
                    </View>

                    {data.length > 0 ? (
                        <Svg width={CHART_W} height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
                            <Defs>
                                <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0%" stopColor={Colors.primary} stopOpacity={0.25} />
                                    <Stop offset="100%" stopColor={Colors.primary} stopOpacity={0} />
                                </LinearGradient>
                            </Defs>
                            {/* Grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                                const y = PAD.top + plotH * (1 - pct);
                                const minVal = Math.min(...data.map((d) => d.value));
                                const maxVal = Math.max(...data.map((d) => d.value));
                                const range = maxVal - minVal || 1;
                                const val = (minVal + range * pct).toFixed(1);
                                return (
                                    <React.Fragment key={i}>
                                        <Line x1={PAD.left} y1={y} x2={CHART_W - PAD.right} y2={y}
                                            stroke={Colors.light.border} strokeWidth={0.5} strokeDasharray="4,4" />
                                        <SvgText x={PAD.left - 4} y={y + 3} fontSize={9} fill={Colors.light.textTertiary}
                                            textAnchor="end" fontFamily="Lexend_400Regular">{val}</SvgText>
                                    </React.Fragment>
                                );
                            })}
                            {/* Area */}
                            <Path d={areaPath} fill="url(#chartGrad)" />
                            {/* Line */}
                            <Path d={linePath} fill="none" stroke={Colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                            {/* Data dots */}
                            {points.map((p, i) => (
                                <React.Fragment key={i}>
                                    <Circle cx={p.x} cy={p.y} r={activePoint === i ? 7 : 4}
                                        fill={activePoint === i ? Colors.primary : '#fff'}
                                        stroke={Colors.primary} strokeWidth={2}
                                        onPress={() => handleTapPoint(i)} />
                                    {(i === 0 || i === points.length - 1) && points.length > 1 && (
                                        <SvgText x={p.x} y={CHART_H - 8} fontSize={9} fill={Colors.light.textTertiary}
                                            textAnchor={i === 0 ? 'start' : 'end'} fontFamily="Lexend_400Regular">
                                            {formatDate(p.date)}
                                        </SvgText>
                                    )}
                                </React.Fragment>
                            ))}
                        </Svg>
                    ) : (
                        <View style={s.emptyChart}>
                            <MaterialIcons name="show-chart" size={40} color={Colors.light.textTertiary} />
                            <Text style={s.emptyChartText}>Add a measurement to see chart</Text>
                        </View>
                    )}
                </View>

                {/* Measurement History */}
                <Text style={s.historyTitle}>History</Text>
                <View style={s.list}>
                    {[...data].reverse().map((m) => (
                        <View key={m.id} style={s.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.rowVal}>{m.value} {m.unit}</Text>
                                <Text style={s.rowDate}>{formatDateLong(m.date)}</Text>
                            </View>
                            <TouchableOpacity
                                style={s.deleteBtn}
                                onPress={() => handleDeleteMeasurement(m.id, m.value)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <MaterialIcons name="delete-outline" size={18} color="#e74c3c" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {data.length === 0 && (
                        <Text style={s.noData}>No entries yet. Tap + to add one.</Text>
                    )}
                </View>

                {/* Quick Add */}
                <TouchableOpacity style={s.addBtn} onPress={() => { setAddType(selectedType); setShowAddModal(true); }}>
                    <MaterialIcons name="add" size={22} color={Colors.dark.background} />
                    <Text style={s.addText}>Add {MEASURE_LABELS[selectedType]}</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Add Measurement Modal */}
            <Modal visible={showAddModal} transparent animationType="fade">
                <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setShowAddModal(false)}>
                    <View style={s.modal} onStartShouldSetResponder={() => true}>
                        <Text style={s.modalTitle}>Add Measurement</Text>

                        {/* Type Picker */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.modalTabs}>
                            {ALL_TYPES.map((type) => (
                                <TouchableOpacity key={type}
                                    style={[s.tab, addType === type && s.tabActive]}
                                    onPress={() => setAddType(type)}>
                                    <Text style={[s.tabText, addType === type && s.tabTextActive]}>
                                        {MEASURE_LABELS[type]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Limits hint */}
                        <Text style={s.limitHint}>
                            Range: {MEASURE_LIMITS[addType].min} – {MEASURE_LIMITS[addType].max} {MEASURE_LIMITS[addType].unit}
                        </Text>

                        {/* Today warning */}
                        {hasEntryToday(addType) && (
                            <View style={s.warningBanner}>
                                <MaterialIcons name="info-outline" size={16} color="#e67e22" />
                                <Text style={s.warningText}>Already recorded today</Text>
                            </View>
                        )}

                        {/* Value Input */}
                        <View style={s.inputRow}>
                            <TextInput
                                style={s.modalInput}
                                placeholder="0"
                                placeholderTextColor={Colors.light.textTertiary}
                                keyboardType="decimal-pad"
                                value={addValue}
                                onChangeText={(t) => {
                                    // Allow only valid decimal numbers — max 1 decimal point, max 5 chars
                                    const cleaned = t.replace(/[^0-9.]/g, '');
                                    const parts = cleaned.split('.');
                                    if (parts.length > 2) return; // more than one dot
                                    if (parts[1] && parts[1].length > 1) return; // max 1 decimal place
                                    if (cleaned.length > 6) return; // max length
                                    setAddValue(cleaned);
                                }}
                                maxLength={6}
                                autoFocus
                            />
                            <Text style={s.inputUnit}>{UNIT_MAP[addType]}</Text>
                        </View>

                        <TouchableOpacity style={s.saveBtn} onPress={handleAddMeasurement}>
                            <Text style={s.saveBtnText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: 'rgba(19,236,106,0.1)' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    scroll: { padding: Spacing.base, paddingBottom: 60 },

    tabs: { gap: Spacing.sm, paddingBottom: Spacing.base },
    tab: {
        paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full, backgroundColor: Colors.light.card,
        borderWidth: 1, borderColor: Colors.light.border,
    },
    tabActive: { backgroundColor: Colors.primaryMedium, borderColor: Colors.primary },
    tabText: { fontSize: FontSize.sm, fontFamily: 'Lexend_500Medium', color: Colors.light.textSecondary },
    tabTextActive: { color: Colors.primary, fontFamily: 'Lexend_700Bold' },

    chart: { backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: 'rgba(19,236,106,0.05)' },
    chartTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.base },
    chartTitle: { fontSize: FontSize.base, fontFamily: 'Lexend_600SemiBold', color: Colors.light.text },
    chartSub: { fontSize: FontSize.sm, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary },
    chartVal: { fontSize: FontSize.xxl, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    chartDelta: { fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium' },
    emptyChart: { height: 120, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
    emptyChartText: { fontFamily: 'Lexend_400Regular', fontSize: FontSize.sm, color: Colors.light.textTertiary },

    historyTitle: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.light.text, marginTop: Spacing.xl, marginBottom: Spacing.sm },
    list: { gap: Spacing.sm },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: Spacing.base, backgroundColor: Colors.light.card, borderRadius: BorderRadius.sm,
        borderWidth: 1, borderColor: Colors.light.border,
    },
    rowVal: { fontSize: FontSize.base, fontFamily: 'Lexend_600SemiBold', color: Colors.light.text },
    rowDate: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary, marginTop: 2 },
    deleteBtn: { padding: 8 },
    noData: { fontSize: FontSize.sm, fontFamily: 'Lexend_400Regular', color: Colors.light.textTertiary, textAlign: 'center', paddingVertical: Spacing.xl },

    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.xxl, paddingVertical: Spacing.base, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary },
    addText: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.dark.background },

    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modal: { width: '85%', backgroundColor: Colors.light.background, borderRadius: BorderRadius.lg, padding: Spacing.xl },
    modalTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.light.text, marginBottom: Spacing.base, textAlign: 'center' },
    modalTabs: { gap: Spacing.sm, marginBottom: Spacing.sm },
    limitHint: { fontSize: FontSize.xs, fontFamily: 'Lexend_400Regular', color: Colors.light.textTertiary, textAlign: 'center', marginBottom: Spacing.sm },
    warningBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        backgroundColor: '#fef3e2', borderRadius: BorderRadius.sm, paddingVertical: 8, marginBottom: Spacing.sm,
    },
    warningText: { fontSize: FontSize.xs, fontFamily: 'Lexend_500Medium', color: '#e67e22' },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
    modalInput: {
        flex: 1, fontSize: FontSize.xxxl, fontFamily: 'Lexend_700Bold', color: Colors.light.text,
        textAlign: 'center', backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.base, borderWidth: 1, borderColor: Colors.light.border,
    },
    inputUnit: { fontSize: FontSize.xl, fontFamily: 'Lexend_600SemiBold', color: Colors.light.textSecondary },
    saveBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: Spacing.base, alignItems: 'center' },
    saveBtnText: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.dark.background },
});
