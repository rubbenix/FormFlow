/**
 * ValidationEngine
 * Runs validators against field values, handling both sync and async validators.
 * Returns consolidated results and coordinates the StateManager updates.
 */

import type {
  FormField,
  FormStep,
  FormValues,
  FieldValidationState,
  FormValidationState,
  ValidationResult,
} from "../types/index.js";

/** Run a single field's validators and return the first failing result, or valid */
export async function validateField(
  field: FormField,
  value: unknown,
  formValues: FormValues,
): Promise<ValidationResult> {
  if (!field.validators || field.validators.length === 0) {
    return { valid: true, message: "" };
  }

  for (const validator of field.validators) {
    let result: ValidationResult;
    try {
      result = await Promise.resolve(
        validator.validate(value as FormValues[string], formValues),
      );
    } catch (err) {
      result = {
        valid: false,
        message: err instanceof Error ? err.message : "Validation error",
      };
    }

    if (!result.valid) {
      return result;
    }
  }

  return { valid: true, message: "" };
}

/**
 * Validate all fields in a single step.
 * Returns a partial FormValidationState covering only the fields in this step.
 */
export async function validateStep(
  step: FormStep,
  values: FormValues,
): Promise<FormValidationState> {
  const results: FormValidationState = {};

  await Promise.all(
    step.fields.map(async (field) => {
      // Skip fields that are conditionally hidden
      if (field.condition) {
        try {
          if (!field.condition.fn(values)) {
            results[field.id] = {
              valid: true,
              error: null,
              validating: false,
              touched: true,
              dirty: false,
            };
            return;
          }
        } catch {
          // If condition throws, treat as visible
        }
      }

      const result = await validateField(field, values[field.id], values);
      results[field.id] = {
        valid: result.valid,
        error: result.valid ? null : result.message,
        validating: false,
        touched: true,
        dirty: true,
      };
    }),
  );

  return results;
}

/**
 * Validate all visible steps.
 * Returns a complete FormValidationState.
 */
export async function validateAll(
  steps: FormStep[],
  visibleStepIds: string[],
  values: FormValues,
): Promise<FormValidationState> {
  const visibleSteps = steps.filter((s) => visibleStepIds.includes(s.id));
  const results: FormValidationState = {};

  await Promise.all(
    visibleSteps.map(async (step) => {
      const stepResults = await validateStep(step, values);
      Object.assign(results, stepResults);
    }),
  );

  return results;
}

/**
 * Given a validation state for a step, return true if all fields are valid.
 */
export function isStepValid(
  step: FormStep,
  validation: FormValidationState,
  values: FormValues,
): boolean {
  return step.fields.every((field) => {
    // Conditionally hidden fields are always considered valid
    if (field.condition) {
      try {
        if (!field.condition.fn(values)) return true;
      } catch {
        // treat as visible
      }
    }

    const state: FieldValidationState | undefined = validation[field.id];
    if (!state) return true;
    return state.valid;
  });
}

/**
 * Return all fields from a step that currently have errors.
 */
export function getStepErrors(
  step: FormStep,
  validation: FormValidationState,
): Array<{ fieldId: string; message: string }> {
  const errors: Array<{ fieldId: string; message: string }> = [];
  for (const field of step.fields) {
    const state = validation[field.id];
    if (state && !state.valid && state.error) {
      errors.push({ fieldId: field.id, message: state.error });
    }
  }
  return errors;
}
