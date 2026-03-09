import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.light.icon,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIconStyle: styles.tabIcon,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIcons name="home" size={26} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIcons name="person" size={26} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.light.tabBar,
        borderTopColor: Colors.light.border,
        borderTopWidth: 1,
        paddingTop: 6,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        height: Platform.OS === 'ios' ? 84 : 64,
        elevation: 0,
        shadowOpacity: 0,
    },
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
