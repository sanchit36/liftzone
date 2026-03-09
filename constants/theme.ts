export const Colors = {
    primary: '#13ec6a',
    primaryDark: '#0fc95a',
    primaryLight: 'rgba(19, 236, 106, 0.1)',
    primaryMedium: 'rgba(19, 236, 106, 0.2)',

    light: {
        background: '#f6f8f7',
        card: '#ffffff',
        text: '#0f172a',
        textSecondary: '#64748b',
        textTertiary: '#94a3b8',
        border: '#f1f5f9',
        borderDark: '#e2e8f0',
        inputBg: '#f6f8f7',
        tabBar: 'rgba(255, 255, 255, 0.95)',
        icon: '#94a3b8',
    },

    dark: {
        background: '#0f0f0f',
        card: '#1a1a1a',
        text: '#f1f5f9',
        textSecondary: '#9ca3af',
        textTertiary: '#6b7280',
        border: '#2a2a2a',
        borderDark: '#3a3a3a',
        inputBg: '#1a1a1a',
        tabBar: 'rgba(15, 15, 15, 0.97)',
        icon: '#6b7280',
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const FontSize = {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
};

export const FontWeight = {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};
