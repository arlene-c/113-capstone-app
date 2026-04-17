/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * ASL Translation App - Pastel color palette with EB Garamond typography
 */

import { Platform } from 'react-native';

// Pastel green, white, black color scheme
const pastelGreen = '#A8D5BA';
const darkGreen = '#6B9E7A';
const white = '#FFFFFF';
const black = '#000000';
const lightGray = '#F5F5F5';

export const Colors = {
  light: {
    text: black,
    background: white,
    tint: darkGreen,
    icon: pastelGreen,
    tabIconDefault: pastelGreen,
    tabIconSelected: darkGreen,
  },
  dark: {
    text: white,
    background: '#1a1a1a',
    tint: pastelGreen,
    icon: pastelGreen,
    tabIconDefault: pastelGreen,
    tabIconSelected: pastelGreen,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** EB Garamond - primary elegant font */
    sans: 'EB Garamond',
    /** EB Garamond serif style */
    serif: 'EB Garamond',
    /** System rounded for icons */
    rounded: 'ui-rounded',
    /** System monospace */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'EB Garamond',
    serif: 'EB Garamond',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'EB Garamond', Georgia, 'Times New Roman', serif",
    serif: "'EB Garamond', Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
