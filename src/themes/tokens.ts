/**
 * FormFlow Design Tokens
 * Shared base values used by all built-in themes.
 */

import type {
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeTypography,
  ThemeTransitions,
} from "../types/index.js";

export const baseSpacing: ThemeSpacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
};

export const baseBorderRadius: ThemeBorderRadius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
};

export const baseTypography: ThemeTypography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSizeBase: "16px",
  fontSizeSm: "14px",
  fontSizeLg: "18px",
  fontWeightNormal: "400",
  fontWeightMedium: "500",
  fontWeightBold: "600",
  lineHeight: "1.5",
};

export const baseTransitions: ThemeTransitions = {
  fast: "120ms ease",
  normal: "200ms ease",
  slow: "350ms ease",
};
