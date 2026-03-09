import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { useWorkoutStore } from '../../store/workoutStore';
import { useRoutineStore } from '../../store/routineStore';

export default function HomeScreen() {
    const router = useRouter();
    const { streakDays } = useWorkoutStore();
    const { routines, removeRoutine } = useRoutineStore();

    const handleDeleteRoutine = (id: string, name: string) => {
        Alert.alert('Delete Routine', `Are you sure you want to delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => removeRoutine(id) },
        ]);
    };

    const handleStartWorkout = () => {
        router.push('/workout-session');
    };

    const handleStartFromRoutine = (routineId: string) => {
        const routine = routines.find((r) => r.id === routineId);
        if (!routine) return;
        const { startWorkout } = useWorkoutStore.getState();
        startWorkout(routineId, routine.name, routine.exerciseIds);
        router.push('/workout-session');
    };

    const getRoutineIcon = (icon?: string): keyof typeof MaterialIcons.glyphMap => {
        switch (icon) {
            case 'flash-on': return 'flash-on';
            case 'layers': return 'layers';
            case 'swap-vert': return 'swap-vert';
            default: return 'fitness-center';
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
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

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>Ready to train?</Text>
                    <Text style={styles.heroSubtitle}>Consistency is the key to progress.</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.startButton} activeOpacity={0.8} onPress={handleStartWorkout}>
                        <MaterialIcons name="play-arrow" size={24} color={Colors.dark.background} />
                        <Text style={styles.startButtonText}>Start Workout</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.routineButton} activeOpacity={0.8} onPress={() => router.push('/create-routine')}>
                        <MaterialIcons name="add-circle" size={24} color={Colors.light.text} />
                        <Text style={styles.routineButtonText}>New Routine</Text>
                    </TouchableOpacity>
                </View>

                {/* Your Routines */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Routines</Text>
                    </View>
                    <View style={styles.routineList}>
                        {routines.map((item) => (
                            <View key={item.id} style={styles.routineCard}>
                                <TouchableOpacity style={styles.routineMain} activeOpacity={0.7} onPress={() => handleStartFromRoutine(item.id)}>
                                    <View style={styles.routineIconContainer}>
                                        <MaterialIcons name={getRoutineIcon(item.icon)} size={22} color={Colors.primary} />
                                    </View>
                                    <View style={styles.routineTextContainer}>
                                        <Text style={styles.routineName}>{item.name}</Text>
                                        <Text style={styles.routineCount}>{item.exerciseIds.length} Exercises</Text>
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.routineActions}>
                                    <TouchableOpacity style={styles.routineActionBtn} onPress={() => router.push(`/edit-routine?id=${item.id}`)}>
                                        <MaterialIcons name="edit" size={18} color={Colors.light.textSecondary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.routineActionBtn} onPress={() => handleDeleteRoutine(item.id, item.name)}>
                                        <MaterialIcons name="delete-outline" size={18} color="#e74c3c" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
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
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: Spacing.base },
    hero: { paddingTop: Spacing.xl, paddingBottom: Spacing.base },
    heroTitle: { fontSize: FontSize.xxxl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    heroSubtitle: { fontSize: FontSize.md, fontFamily: 'Lexend_400Regular', color: Colors.light.textSecondary, marginTop: 4 },
    quickActions: { gap: Spacing.md, paddingVertical: Spacing.base },
    startButton: {
        backgroundColor: Colors.primary,
        height: 56,
        borderRadius: BorderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    startButtonText: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.dark.background },
    routineButton: {
        backgroundColor: Colors.light.borderDark,
        height: 56,
        borderRadius: BorderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    routineButtonText: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    section: { marginTop: Spacing.xxl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.base },
    sectionTitle: { fontSize: FontSize.xl, fontFamily: 'Lexend_700Bold', color: Colors.light.text },
    viewAll: { fontSize: FontSize.sm, fontFamily: 'Lexend_600SemiBold', color: Colors.primary },
    routineList: { gap: Spacing.base },
    routineCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.card,
        padding: Spacing.base,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    routineMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    routineTextContainer: { flex: 1 },
    routineIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    routineName: { fontFamily: 'Lexend_700Bold', fontSize: FontSize.base, color: Colors.light.text },
    routineCount: { fontFamily: 'Lexend_400Regular', fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 4 },
    routineActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    routineActionBtn: { padding: Spacing.sm, borderRadius: BorderRadius.sm },
});
