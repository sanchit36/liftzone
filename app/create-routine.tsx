import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useExerciseStore } from '../store/exerciseStore';
import { useRoutineStore } from '../store/routineStore';
import { MUSCLE_GROUP_LABELS } from '../data/exercises';

export default function CreateRoutineScreen() {
    const router = useRouter();
    const { exercises } = useExerciseStore();
    const { addRoutine } = useRoutineStore();
    const [name, setName] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleExercise = (id: string) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const handleSave = () => {
        if (!name.trim()) { Alert.alert('Name Required', 'Please enter a routine name.'); return; }
        if (selectedIds.length === 0) { Alert.alert('No Exercises', 'Select at least one exercise.'); return; }
        addRoutine({
            id: `rt-${Date.now()}`,
            name: name.trim(),
            exerciseIds: selectedIds,
            createdAt: Date.now(),
        });
        router.back();
    };

    const grouped: Record<string, typeof exercises> = {};
    exercises.forEach((e) => { if (!grouped[e.muscleGroup]) grouped[e.muscleGroup] = []; grouped[e.muscleGroup].push(e); });

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="close" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>New Routine</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={s.saveBtn}>Save</Text>
                </TouchableOpacity>
            </View>

            <View style={s.nameWrap}>
                <TextInput style={s.nameInput} placeholder="Routine Name" placeholderTextColor={Colors.light.textTertiary} value={name} onChangeText={setName} />
            </View>

            <Text style={s.subtitle}>{selectedIds.length} exercises selected</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                {Object.entries(grouped).map(([group, exs]) => (
                    <View key={group} style={s.group}>
                        <Text style={s.groupLabel}>{MUSCLE_GROUP_LABELS[group as keyof typeof MUSCLE_GROUP_LABELS]}</Text>
                        {exs.map((ex) => {
                            const isSelected = selectedIds.includes(ex.id);
                            return (
                                <TouchableOpacity key={ex.id} style={[s.exItem, isSelected && s.exItemSelected]} onPress={() => toggleExercise(ex.id)}>
                                    <View style={[s.checkbox, isSelected && s.checkboxSelected]}>
                                        {isSelected && <MaterialIcons name="check" size={16} color={Colors.dark.background} />}
                                    </View>
                                    <Text style={s.exName}>{ex.name}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base },
    headerTitle: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    saveBtn: { fontSize: FontSize.base, fontFamily: 'Lexend_700Bold', color: Colors.primary },
    nameWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
    nameInput: { backgroundColor: Colors.light.card, borderRadius: BorderRadius.lg, padding: Spacing.base, fontSize: FontSize.lg, fontFamily: 'Lexend_600SemiBold', color: Colors.light.text, borderWidth: 1, borderColor: Colors.light.border },
    subtitle: { paddingHorizontal: Spacing.base, fontFamily: 'Lexend_500Medium', fontSize: FontSize.sm, color: Colors.primary, marginBottom: Spacing.base },
    scroll: { paddingHorizontal: Spacing.base, paddingBottom: 40 },
    group: { marginBottom: Spacing.xl },
    groupLabel: { fontSize: FontSize.xs, fontFamily: 'Lexend_600SemiBold', color: Colors.light.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm },
    exItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm, marginBottom: 4 },
    exItemSelected: { backgroundColor: Colors.primaryLight },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.light.borderDark, alignItems: 'center', justifyContent: 'center' },
    checkboxSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    exName: { fontSize: FontSize.base, fontFamily: 'Lexend_500Medium', color: Colors.light.text },
});
