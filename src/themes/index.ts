/**
 * FormFlow Themes
 * Built-in light and dark themes, plus utilities for creating custom themes.
 */

import {
  baseSpacing,
  baseBorderRadius,
  baseTypography,
  baseTransitions,
} from "./tokens.js";
import type {
  FormFlowTheme,
  BuiltInTheme,
  ThemeColors,
} from "../types/index.js";

// ─── Light Theme ──────────────────────────────────────────────────────────────

const lightColors: ThemeColors = {
  primary: "#4F46E5",
  primaryHover: "#4338CA",
  primaryForeground: "#FFFFFF",
  secondary: "#F3F4F6",
  secondaryHover: "#E5E7EB",
  secondaryForeground: "#374151",
  background: "#FFFFFF",
  surface: "#F9FAFB",
  border: "#D1D5DB",
  borderFocus: "#4F46E5",
  text: "#111827",
  textMuted: "#6B7280",
  error: "#DC2626",
  errorBackground: "#FEF2F2",
  success: "#16A34A",
  successBackground: "#F0FDF4",
  progressTrack: "#E5E7EB",
  progressFill: "#4F46E5",
};

export const lightTheme: FormFlowTheme = {
  name: "light",
  colors: lightColors,
  spacing: baseSpacing,
  borderRadius: baseBorderRadius,
  typography: baseTypography,
  transitions: baseTransitions,
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────

const darkColors: ThemeColors = {
  primary: "#818CF8",
  primaryHover: "#6366F1",
  primaryForeground: "#FFFFFF",
  secondary: "#374151",
  secondaryHover: "#4B5563",
  secondaryForeground: "#E5E7EB",
  background: "#111827",
  surface: "#1F2937",
  border: "#374151",
  borderFocus: "#818CF8",
  text: "#F9FAFB",
  textMuted: "#9CA3AF",
  error: "#F87171",
  errorBackground: "#1C0A0A",
  success: "#4ADE80",
  successBackground: "#052E16",
  progressTrack: "#374151",
  progressFill: "#818CF8",
};

export const darkTheme: FormFlowTheme = {
  name: "dark",
  colors: darkColors,
  spacing: baseSpacing,
  borderRadius: baseBorderRadius,
  typography: baseTypography,
  transitions: baseTransitions,
};

// ─── Theme Registry ───────────────────────────────────────────────────────────

const themes: Record<BuiltInTheme, FormFlowTheme> = {
  light: lightTheme,
  dark: darkTheme,
};

/**
 * Resolve a theme by name or return a custom theme object as-is.
 */
export function resolveTheme(
  theme: BuiltInTheme | FormFlowTheme = "light",
): FormFlowTheme {
  if (typeof theme === "string") {
    return themes[theme] ?? lightTheme;
  }
  return theme;
}

/**
 * Create a custom theme by deeply merging overrides onto the light theme base.
 *
 * @example
 * const myTheme = createTheme("brand", {
 *   colors: { primary: "#FF6B00", primaryHover: "#E55A00" },
 * });
 */
export function createTheme(
  name: string,
  overrides: Partial<Omit<FormFlowTheme, "name">>,
): FormFlowTheme {
  return {
    ...lightTheme,
    ...overrides,
    name,
    colors: { ...lightTheme.colors, ...(overrides.colors ?? {}) },
    spacing: { ...lightTheme.spacing, ...(overrides.spacing ?? {}) },
    borderRadius: {
      ...lightTheme.borderRadius,
      ...(overrides.borderRadius ?? {}),
    },
    typography: {
      ...lightTheme.typography,
      ...(overrides.typography ?? {}),
    },
    transitions: {
      ...lightTheme.transitions,
      ...(overrides.transitions ?? {}),
    },
  };
}

/**
 * Generate a CSS string from a theme object that can be injected into a
 * <style> tag or a CSS-in-JS solution.
 *
 * All tokens are emitted as CSS custom properties under a given selector.
 */
export function themeToCSSVariables(
  theme: FormFlowTheme,
  selector = ":root",
): string {
  const { colors, spacing, borderRadius, typography, transitions } = theme;

  const lines: string[] = [`${selector} {`];

  // Colors
  for (const [key, val] of Object.entries(colors)) {
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    lines.push(`  --ff-color-${cssKey}: ${val};`);
  }

  // Spacing
  for (const [key, val] of Object.entries(spacing)) {
    lines.push(`  --ff-spacing-${key}: ${val};`);
  }

  // Border radius
  for (const [key, val] of Object.entries(borderRadius)) {
    lines.push(`  --ff-radius-${key}: ${val};`);
  }

  // Typography
  const typoMap: Record<string, string> = {
    fontFamily: "font-family",
    fontSizeBase: "font-size-base",
    fontSizeSm: "font-size-sm",
    fontSizeLg: "font-size-lg",
    fontWeightNormal: "font-weight-normal",
    fontWeightMedium: "font-weight-medium",
    fontWeightBold: "font-weight-bold",
    lineHeight: "line-height",
  };
  for (const [key, cssKey] of Object.entries(typoMap)) {
    lines.push(
      `  --ff-${cssKey}: ${(typography as unknown as Record<string, string>)[key]};`,
    );
  }

  // Transitions
  for (const [key, val] of Object.entries(transitions)) {
    lines.push(`  --ff-transition-${key}: ${val};`);
  }

  lines.push("}");
  return lines.join("\n");
}

export { baseSpacing, baseBorderRadius, baseTypography, baseTransitions };
