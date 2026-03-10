import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useWorkoutStore } from '../store/workoutStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ActiveWorkoutBar() {
    const router = useRouter();
    const pathname = usePathname();
    const { activeWorkout, cancelWorkout } = useWorkoutStore();
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!activeWorkout) return;
        setElapsed(Date.now() - activeWorkout.startedAt);
        const interval = setInterval(() => {
            setElapsed(Date.now() - activeWorkout.startedAt);
        }, 1000);
        return () => clearInterval(interval);
    }, [activeWorkout]);

    if (!activeWorkout || pathname === '/workout-session') return null;

    const formatTime = (ms: number) => {
        const totalSecs = Math.floor(ms / 1000);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleDiscard = () => {
        Alert.alert('Discard Workout', 'Are you sure you want to discard this session?', [
            { text: 'Keep Tracking', style: 'cancel' },
            { text: 'Discard', style: 'destructive', onPress: () => cancelWorkout() },
        ]);
    };

    // Calculate bottom position based on if we are in tabs or not.
    // We check common tab paths. If it's a tab screen, we float above the tab bar.
    // If it's a normal screen, we float right above the bottom safe area.
    const isTabScreen = pathname === '/' || pathname === '/profile' || pathname === '/settings';
    const bottomPos = isTabScreen ? (Platform.OS === 'ios' ? 94 : 74) : (insets.bottom + 24);

    return (
        <View style={[s.container, { bottom: bottomPos, backgroundColor: c.card, borderColor: Colors.primary }]}>
            <TouchableOpacity style={s.content} onPress={() => router.push('/workout-session')} activeOpacity={0.8}>
                <View style={s.iconWrap}>
                    <MaterialIcons name="fitness-center" size={20} color="#000" />
                </View>
                <View style={s.textWrap}>
                    <Text style={[s.title, { color: c.text }]} numberOfLines={1}>{activeWorkout.routineName || 'Active Workout'}</Text>
                    <View style={s.timerRow}>
                        <View style={s.pulseDot} />
                        <Text style={[s.timer, { color: Colors.primary }]}>{formatTime(elapsed)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={s.closeBtn} onPress={handleDiscard} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                <MaterialIcons name="close" size={24} color={c.textTertiary} />
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        position: 'absolute',
        left: Spacing.base,
        right: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
        paddingRight: Spacing.sm,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
    },
    iconWrap: {
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    textWrap: {
        flex: 1,
    },
    title: {
        fontFamily: 'Lexend_700Bold',
        fontSize: FontSize.sm,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginRight: 6,
    },
    timer: {
        fontFamily: 'Lexend_600SemiBold',
        fontSize: FontSize.xs,
    },
    closeBtn: {
        padding: Spacing.sm,
    }
});
