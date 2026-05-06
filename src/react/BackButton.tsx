/**
 * BackButton Component
 * Secondary navigation button for going to the previous step.
 */

import React, { useContext } from "react";
import { FormFlowContext } from "./context.js";
import { getSecondaryButtonStyles } from "./styles.js";
import type { BackButtonProps } from "../types/index.js";

/**
 * <BackButton />
 * Renders the "← Back" navigation button.
 */
export const BackButton = React.memo(function BackButton({
  onClick,
  disabled = false,
  className,
  backLabel,
  theme: propTheme,
}: BackButtonProps) {
  const ctx = useContext(FormFlowContext);
  const theme = propTheme ?? ctx?.theme;
  const resolvedLabel = backLabel ?? ctx?.backLabel ?? "Back";

  if (!theme) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={resolvedLabel}
      style={getSecondaryButtonStyles(theme, disabled)}
    >
      <span aria-hidden="true" style={{ fontSize: "1.1em" }}>
        ←
      </span>
      {resolvedLabel}
    </button>
  );
});
