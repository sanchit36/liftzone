import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';

export default function TabLayout() {
    const darkMode = useSettingsStore((s) => s.darkMode);
    const c = darkMode ? Colors.dark : Colors.light;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: c.tabBar,
                    borderTopColor: c.border,
                    borderTopWidth: 1,
                    paddingTop: 6,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
                    height: Platform.OS === 'ios' ? 84 : 64,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: c.icon,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIconStyle: styles.tabIcon,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Workouts',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="fitness-center" size={26} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="person" size={26} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="settings" size={26} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabLabel: {
        fontFamily: 'Lexend_700Bold',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    tabIcon: {
        marginBottom: -2,
    },
});
