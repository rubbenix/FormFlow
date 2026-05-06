/**
 * useFormField
 * Hook for binding a single field to the FormFlow state.
 * Returns a stable `field` object with `value`, `onChange`, `onBlur`,
 * and validation state — ready to spread onto any input.
 */

import { useCallback, useContext } from "react";
import { FormFlowContext } from "../react/context.js";
import type { FieldValue, FieldValidationState } from "../types/index.js";

export interface UseFormFieldReturn {
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  onBlur: () => void;
  validation: FieldValidationState | undefined;
  /** True if the field has an error AND has been touched */
  hasError: boolean;
  /** The error message, or null */
  error: string | null;
  /** True while async validation is running */
  isValidating: boolean;
}

/**
 * useFormField — bind a single field by its ID.
 * Must be inside a <FormFlow /> component tree.
 *
 * @param fieldId The ID of the field to bind
 *
 * @example
 * function CustomEmailInput({ fieldId }: { fieldId: string }) {
 *   const { value, onChange, onBlur, hasError, error } = useFormField(fieldId);
 *   return (
 *     <div>
 *       <input
 *         value={String(value)}
 *         onChange={e => onChange(e.target.value)}
 *         onBlur={onBlur}
 *       />
 *       {hasError && <span>{error}</span>}
 *     </div>
 *   );
 * }
 */
export function useFormField(fieldId: string): UseFormFieldReturn {
  const ctx = useContext(FormFlowContext);
  if (!ctx) {
    throw new Error(
      "useFormField must be used inside a <FormFlow /> component",
    );
  }

  const { form } = ctx;
  const { state, setValue, touchField } = form;

  const value = state.values[fieldId] ?? "";
  const validation = state.validation[fieldId];

  const onChange = useCallback(
    (newValue: FieldValue) => {
      setValue(fieldId, newValue);
    },
    [fieldId, setValue],
  );

  const onBlur = useCallback(() => {
    touchField(fieldId);
  }, [fieldId, touchField]);

  const hasError = !!(
    validation &&
    !validation.valid &&
    validation.touched &&
    validation.error
  );

  return {
    value,
    onChange,
    onBlur,
    validation,
    hasError,
    error: hasError ? (validation?.error ?? null) : null,
    isValidating: validation?.validating ?? false,
  };
}
