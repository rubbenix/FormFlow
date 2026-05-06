/**
 * FormFlow inline style utilities
 * Generates React CSSProperties from a theme object.
 * Keeps the library dependency-free while allowing full theming.
 */

import type { FormFlowTheme } from "../types/index.js";
import type { CSSProperties } from "react";

export function getRootStyles(theme: FormFlowTheme): CSSProperties {
  return {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizeBase,
    lineHeight: theme.typography.lineHeight,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    boxSizing: "border-box",
  };
}

export function getInputStyles(
  theme: FormFlowTheme,
  hasError: boolean,
  isFocused: boolean,
): CSSProperties {
  return {
    width: "100%",
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.typography.fontSizeBase,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    border: `1.5px solid ${hasError ? theme.colors.error : isFocused ? theme.colors.borderFocus : theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    outline: "none",
    transition: `border-color ${theme.transitions.fast}, box-shadow ${theme.transitions.fast}`,
    boxSizing: "border-box",
    boxShadow: isFocused
      ? `0 0 0 3px ${theme.colors.borderFocus}22`
      : "none",
  };
}

export function getLabelStyles(theme: FormFlowTheme): CSSProperties {
  return {
    display: "block",
    fontSize: theme.typography.fontSizeSm,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  };
}

export function getErrorStyles(theme: FormFlowTheme): CSSProperties {
  return {
    fontSize: theme.typography.fontSizeSm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.xs,
  };
}

export function getDescriptionStyles(theme: FormFlowTheme): CSSProperties {
  return {
    fontSize: theme.typography.fontSizeSm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  };
}

export function getPrimaryButtonStyles(
  theme: FormFlowTheme,
  disabled: boolean,
): CSSProperties {
  return {
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    backgroundColor: disabled ? theme.colors.border : theme.colors.primary,
    color: theme.colors.primaryForeground,
    border: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSizeBase,
    fontWeight: theme.typography.fontWeightMedium,
    fontFamily: theme.typography.fontFamily,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: `background-color ${theme.transitions.fast}`,
    opacity: disabled ? 0.6 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing.sm,
  };
}

export function getSecondaryButtonStyles(
  theme: FormFlowTheme,
  disabled: boolean,
): CSSProperties {
  return {
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    backgroundColor: theme.colors.secondary,
    color: theme.colors.secondaryForeground,
    border: `1.5px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSizeBase,
    fontWeight: theme.typography.fontWeightMedium,
    fontFamily: theme.typography.fontFamily,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: `background-color ${theme.transitions.fast}`,
    opacity: disabled ? 0.6 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing.sm,
  };
}

export function getProgressTrackStyles(theme: FormFlowTheme): CSSProperties {
  return {
    width: "100%",
    height: "6px",
    backgroundColor: theme.colors.progressTrack,
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
  };
}

export function getProgressFillStyles(
  theme: FormFlowTheme,
  percentage: number,
): CSSProperties {
  return {
    height: "100%",
    width: `${percentage}%`,
    backgroundColor: theme.colors.progressFill,
    borderRadius: theme.borderRadius.full,
    transition: `width ${theme.transitions.normal}`,
  };
}
