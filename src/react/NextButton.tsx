/**
 * NextButton Component
 * The primary navigation / submit button.
 */

import React, { useContext } from "react";
import { FormFlowContext } from "./context.js";
import { getPrimaryButtonStyles } from "./styles.js";
import type { NextButtonProps } from "../types/index.js";

function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ animation: "ff-spin 0.8s linear infinite" }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

const spinnerStyle = `
@keyframes ff-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`;

/**
 * <NextButton />
 * Renders "Next →" on intermediate steps and "Submit" on the last step.
 */
export const NextButton = React.memo(function NextButton({
  onClick,
  isLastStep,
  isSubmitting,
  disabled = false,
  className,
  nextLabel,
  submitLabel,
  theme: propTheme,
}: NextButtonProps) {
  const ctx = useContext(FormFlowContext);
  const theme = propTheme ?? ctx?.theme;
  const resolvedNextLabel = nextLabel ?? ctx?.nextLabel ?? "Next";
  const resolvedSubmitLabel = submitLabel ?? ctx?.submitLabel ?? "Submit";

  if (!theme) return null;

  const isDisabled = disabled || isSubmitting;
  const label = isLastStep ? resolvedSubmitLabel : resolvedNextLabel;

  return (
    <>
      <style>{spinnerStyle}</style>
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={className}
        aria-label={isSubmitting ? "Submitting..." : label}
        aria-busy={isSubmitting}
        style={getPrimaryButtonStyles(theme, isDisabled)}
      >
        {isSubmitting && <SpinnerIcon />}
        {isSubmitting ? "Submitting…" : label}
        {!isSubmitting && !isLastStep && (
          <span aria-hidden="true" style={{ fontSize: "1.1em" }}>
            →
          </span>
        )}
      </button>
    </>
  );
});
