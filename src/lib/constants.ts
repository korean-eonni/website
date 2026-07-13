// ============================================
// FIGMA DESIGN TOKENS - Korean Eonni
// ============================================

// Brand Colors from Figma
export const COLORS = {
  // Primary brand color (Lavender/Periwinkle)
  primary: '#B8B5D8',
  primaryLight: '#C2BFE3',
  primaryDark: '#9D9AC4',
  
  // Secondary colors
  secondary: '#F5F4F8',
  
  // Accent color
  accent: '#000000',
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#F8F7FB',
  },
  
  // Text colors
  text: {
    primary: '#000000',
    secondary: '#666666',
    muted: '#999999',
  },
  
  // Border colors
  border: {
    light: '#E5E5E5',
    dark: '#CCCCCC',
  },
  
  // Status colors
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
} as const;

// Typography from Figma
export const TYPOGRAPHY = {
  fontFamily: {
    primary: 'sans-serif', // UPDATE with your font
    secondary: 'sans-serif', // UPDATE with your font
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

// Spacing from Figma (in pixels)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Container max widths
export const CONTAINER = {
  maxWidth: 1280,
  padding: 16,
} as const;
