import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { useWorkoutStore } from '../../store/workoutStore';

export default function WorkoutTab() {
    const router = useRouter();
    const { activeWorkout } = useWorkoutStore();

    const handleStartEmpty = () => {
        const { startWorkout } = useWorkoutStore.getState();
        startWorkout(undefined, 'Empty Workout', []);
        router.push('/workout-session');
    };

    if (activeWorkout) {
        router.replace('/workout-session');
        return null;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <View style={styles.iconWrap}>
                    <MaterialIcons name="fitness-center" size={48} color={Colors.primary} />
                </View>
                <Text style={styles.title}>No Active Workout</Text>
                <Text style={styles.subtitle}>Start a new workout or pick a routine from the Home tab.</Text>

                <TouchableOpacity style={styles.startButton} activeOpacity={0.8} onPress={handleStartEmpty}>
                    <MaterialIcons name="play-arrow" size={24} color={Colors.dark.background} />
                    <Text style={styles.startButtonText}>Start Empty Workout</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.homeButton} activeOpacity={0.8} onPress={() => router.replace('/(tabs)')}>
                    <Text style={styles.homeButtonText}>Browse Routines</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl },
    iconWrap: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    title: { fontSize: FontSize.xxl, fontFamily: 'Lexend_700Bold', color: Colors.light.text, marginBottom: Spacing.sm },
    subtitle: {
        fontSize: FontSize.md,
        fontFamily: 'Lexend_400Regular',
        color: Colors.light.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xxl,
        lineHeight: 22,
    },
    startButton: {
        backgroundColor: Colors.primary,
        height: 56,
        borderRadius: BorderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        width: '100%',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: Spacing.md,
    },
    startButtonText: { fontSize: FontSize.lg, fontFamily: 'Lexend_700Bold', color: Colors.dark.background },
    homeButton: {
        height: 56,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    homeButtonText: { fontSize: FontSize.base, fontFamily: 'Lexend_600SemiBold', color: Colors.primary },
});
