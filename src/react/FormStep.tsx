/**
 * FormStep Component
 * Renders the fields for the currently active step.
 * Handles conditional field visibility.
 */

import React, { useContext } from "react";
import { FormField } from "./FormField.js";
import { FormFlowContext } from "./context.js";
import type { FormStepProps, FieldValue } from "../types/index.js";

/**
 * <FormStep />
 * Renders the fields for a single form step.
 * Filters out conditionally hidden fields automatically.
 */
export const FormStep = React.memo(function FormStep({
  step,
  values,
  validation,
  onChange,
  onBlur,
  theme: propTheme,
  classNames: propClassNames,
}: FormStepProps) {
  const ctx = useContext(FormFlowContext);
  const theme = propTheme ?? ctx?.theme;
  const classNames = propClassNames ?? ctx?.classNames ?? {};

  if (!theme) return null;

  return (
    <section
      className={step.className ?? classNames.step}
      aria-labelledby={`ff-step-title-${step.id}`}
      style={{ width: "100%" }}
    >
      {/* Step header */}
      {(step.title || step.description) && (
        <header
          style={{ marginBottom: theme.spacing.lg }}
          className={classNames.stepHeader}
        >
          {step.title && (
            <h2
              id={`ff-step-title-${step.id}`}
              style={{
                fontSize: theme.typography.fontSizeLg,
                fontWeight: theme.typography.fontWeightBold,
                color: theme.colors.text,
                margin: 0,
                marginBottom: step.description ? theme.spacing.xs : 0,
              }}
            >
              {step.title}
            </h2>
          )}
          {step.description && (
            <p
              style={{
                fontSize: theme.typography.fontSizeBase,
                color: theme.colors.textMuted,
                margin: 0,
              }}
            >
              {step.description}
            </p>
          )}
        </header>
      )}

      {/* Fields */}
      <div className={classNames.fieldsContainer}>
        {step.fields.map((field) => {
          // Evaluate conditional visibility
          if (field.condition) {
            try {
              if (!field.condition.fn(values)) return null;
            } catch {
              // On error, treat as visible
            }
          }

          return (
            <FormField
              key={field.id}
              field={field}
              value={values[field.id] as FieldValue}
              validation={validation[field.id]}
              onChange={(val) => onChange(field.id, val)}
              onBlur={() => onBlur(field.id)}
              theme={theme}
              classNames={classNames}
            />
          );
        })}
      </div>
    </section>
  );
});
