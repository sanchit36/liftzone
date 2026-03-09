import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Lexend_300Light, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from '@expo-google-fonts/lexend';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import { initDatabase } from '../db/database';
import { useExerciseStore } from '../store/exerciseStore';
import { useRoutineStore } from '../store/routineStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useMeasureStore } from '../store/measureStore';
import { useSettingsStore } from '../store/settingsStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Lexend_300Light,
        Lexend_400Regular,
        Lexend_500Medium,
        Lexend_600SemiBold,
        Lexend_700Bold,
    });
    const [dbReady, setDbReady] = useState(false);

    useEffect(() => {
        try {
            initDatabase();
            useExerciseStore.getState().loadExercises();
            useRoutineStore.getState().loadRoutines();
            useWorkoutStore.getState().loadWorkoutHistory();
            useMeasureStore.getState().loadMeasurements();
            useSettingsStore.getState().loadSettings();
            setDbReady(true);
        } catch (e) {
            console.error('Database init failed:', e);
            setDbReady(true); // Still proceed to prevent infinite loading
        }
    }, []);

    useEffect(() => {
        if (fontsLoaded && dbReady) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, dbReady]);

    if (!fontsLoaded || !dbReady) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.light.background },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                    name="workout-session"
                    options={{
                        animation: 'slide_from_bottom',
                    }}
                />
                <Stack.Screen name="statistics" />
                <Stack.Screen name="exercises" />
                <Stack.Screen name="measures" />
                <Stack.Screen name="calendar" />
                <Stack.Screen name="create-routine" />
                <Stack.Screen name="add-exercises" />
                <Stack.Screen name="edit-routine" />
            </Stack>
        </>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
});
