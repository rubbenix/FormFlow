/**
 * useFormStep
 * Hook that provides access to a specific step's state and field operations.
 * Useful when building custom step components that don't want to deal with
 * the full form context.
 */

import { useContext } from "react";
import { FormFlowContext } from "../react/context.js";
import type {
  FormStep,
  FormValues,
  FormValidationState,
  FieldValue,
} from "../types/index.js";

export interface UseFormStepReturn {
  step: FormStep;
  /** Values of only the fields in this step */
  stepValues: FormValues;
  /** Validation state of only the fields in this step */
  stepValidation: FormValidationState;
  /** Whether all fields in this step are currently valid */
  isStepValid: boolean;
  /** Update a field value */
  setValue: (fieldId: string, value: FieldValue) => void;
  /** Trigger touch/blur on a field */
  touchField: (fieldId: string) => void;
}

/**
 * useFormStep — access state scoped to the current step.
 * Must be used inside a <FormFlow /> component tree.
 *
 * @example
 * function MyCustomStep() {
 *   const { step, stepValues, isStepValid } = useFormStep();
 *   return <div>...</div>;
 * }
 */
export function useFormStep(): UseFormStepReturn {
  const ctx = useContext(FormFlowContext);
  if (!ctx) {
    throw new Error("useFormStep must be used inside a <FormFlow /> component");
  }

  const { form } = ctx;
  const { currentStep, state } = form;

  // Extract only this step's values
  const stepValues: FormValues = {};
  for (const field of currentStep.fields) {
    stepValues[field.id] = state.values[field.id];
  }

  // Extract only this step's validation
  const stepValidation: FormValidationState = {};
  for (const field of currentStep.fields) {
    if (state.validation[field.id]) {
      stepValidation[field.id] = state.validation[field.id]!;
    }
  }

  // Check step validity
  const isStepValid = currentStep.fields.every((field) => {
    const v = state.validation[field.id];
    return !v || v.valid;
  });

  return {
    step: currentStep,
    stepValues,
    stepValidation,
    isStepValid,
    setValue: form.setValue,
    touchField: form.touchField,
  };
}
