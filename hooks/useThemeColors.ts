import { Colors } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

export type ThemeColors = typeof Colors.light;

export function useThemeColors(): ThemeColors {
    const darkMode = useSettingsStore((s) => s.darkMode);
    return darkMode ? Colors.dark : Colors.light;
}
