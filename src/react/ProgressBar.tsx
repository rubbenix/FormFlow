/**
 * ProgressBar Component
 * Renders a visual progress indicator for the multi-step form.
 * Supports both a simple bar and a step-label navigation mode.
 */

import React, { useContext } from "react";
import { FormFlowContext } from "./context.js";
import { getProgressTrackStyles, getProgressFillStyles } from "./styles.js";
import type { ProgressBarProps } from "../types/index.js";

/**
 * <ProgressBar />
 * Renders the form's progress. Can be used standalone or inside <FormFlow />.
 *
 * @example
 * <ProgressBar current={2} total={5} percentage={40} />
 */
export const ProgressBar = React.memo(function ProgressBar({
  current,
  total,
  percentage,
  steps,
  onStepClick,
  allowJump = false,
  className,
  theme: propTheme,
  classNames: propClassNames,
}: ProgressBarProps) {
  const ctx = useContext(FormFlowContext);
  const theme = propTheme ?? ctx?.theme;
  const classNames = propClassNames ?? ctx?.classNames ?? {};

  if (!theme) return null;

  const clampedPct = Math.min(100, Math.max(0, percentage));

  return (
    <div
      className={className ?? classNames.progressBar}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedPct}
      aria-label={`Step ${current} of ${total}`}
      style={{
        marginBottom: theme.spacing.lg,
      }}
    >
      {/* Step labels row */}
      {steps && steps.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: theme.spacing.sm,
          }}
        >
          {steps.map((step, index) => {
            const isActive = index === current - 1;
            const isCompleted = index < current - 1;
            const canClick = allowJump && onStepClick;

            return (
              <button
                key={step.id}
                type="button"
                disabled={!canClick}
                onClick={canClick ? () => onStepClick(index) : undefined}
                aria-current={isActive ? "step" : undefined}
                style={{
                  background: "none",
                  border: "none",
                  padding: `${theme.spacing.xs} 0`,
                  fontSize: theme.typography.fontSizeSm,
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: isActive
                    ? theme.typography.fontWeightBold
                    : theme.typography.fontWeightNormal,
                  color: isActive
                    ? theme.colors.primary
                    : isCompleted
                      ? theme.colors.success
                      : theme.colors.textMuted,
                  cursor: canClick ? "pointer" : "default",
                  transition: `color ${theme.transitions.fast}`,
                  textAlign: "center",
                  flex: 1,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: theme.spacing.xs,
                  }}
                >
                  {/* Step circle indicator */}
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: isCompleted
                        ? theme.colors.success
                        : isActive
                          ? theme.colors.primary
                          : theme.colors.progressTrack,
                      color:
                        isCompleted || isActive
                          ? "#fff"
                          : theme.colors.textMuted,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: theme.typography.fontWeightBold,
                      transition: `background-color ${theme.transitions.normal}`,
                    }}
                    aria-hidden="true"
                  >
                    {isCompleted ? "✓" : index + 1}
                  </span>
                  <span>{step.title}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Progress track */}
      <div
        style={getProgressTrackStyles(theme)}
        className={classNames.progressBar}
      >
        <div
          style={getProgressFillStyles(theme, clampedPct)}
          className={classNames.progressFill}
        />
      </div>

      {/* Textual fallback */}
      <p
        style={{
          fontSize: theme.typography.fontSizeSm,
          color: theme.colors.textMuted,
          margin: `${theme.spacing.xs} 0 0`,
          textAlign: "right",
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        Step {current} of {total}
      </p>
    </div>
  );
});
