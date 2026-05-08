/**
 * FormFlow — Build smarter forms in minutes.
 *
 * Main entry point. Exports everything you need from a single import.
 * For React-specific components, also available via "formflow/react".
 * For validators, also available via "formflow/validators".
 * For vanilla JS, also available via "formflow/vanilla".
 *
 * @example
 * // React
 * import { FormFlow, useFormFlow, required, email } from "formflow";
 *
 * // Vanilla JS
 * import { createFormFlow } from "formflow/vanilla";
 *
 * @see https://github.com/formflow-js/formflow
 * @license MIT
 */

// ─── Core ─────────────────────────────────────────────────────────────────────

export { FormEngine } from "./core/FormEngine.js";
export { StateManager } from "./core/StateManager.js";
export {
  validateField,
  validateStep,
  validateAll,
  isStepValid,
  getStepErrors,
} from "./core/ValidationEngine.js";

// ─── React Components ─────────────────────────────────────────────────────────

export { FormFlow } from "./react/FormFlow.js";
export { FormStep } from "./react/FormStep.js";
export { FormField } from "./react/FormField.js";
export { ProgressBar } from "./react/ProgressBar.js";
export { NextButton } from "./react/NextButton.js";
export { BackButton } from "./react/BackButton.js";
export { FormFlowContext } from "./react/context.js";

// ─── Hooks ────────────────────────────────────────────────────────────────────

export { useFormFlow } from "./hooks/useFormFlow.js";
export { useFormStep } from "./hooks/useFormStep.js";
export { useFormField } from "./hooks/useFormField.js";

// ─── Validators ───────────────────────────────────────────────────────────────

export {
  required,
  email,
  minLength,
  maxLength,
  number,
  pattern,
  url,
  matches,
  custom,
  compose,
  phone,
  postalCode,
  oneOf,
  between,
  alphanumeric,
  strongPassword,
  setLocale,
  messages,
  validators,
} from "./validators/index.js";

export type { ValidatorMessages } from "./validators/index.js";

// ─── Themes ───────────────────────────────────────────────────────────────────

export {
  lightTheme,
  darkTheme,
  resolveTheme,
  createTheme,
  themeToCSSVariables,
} from "./themes/index.js";

// ─── Vanilla JS ───────────────────────────────────────────────────────────────

export { createFormFlow } from "./vanilla/index.js";

// ─── Types (named re-exports for tree-shaking) ────────────────────────────────

export type {
  // Value types
  FieldValue,
  FormValues,

  // Field types
  FieldType,
  FieldOption,
  FieldCondition,
  FormField as FormFieldConfig,

  // Step types
  StepCondition,
  FormStep as FormStepConfig,

  // Theme types
  FormFlowTheme,
  BuiltInTheme,
  ThemeColors,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeTypography,
  ThemeTransitions,

  // Validator types
  ValidationResult,
  ValidatorFn,
  Validator,

  // State types
  FieldValidationState,
  FormValidationState,
  FormFlowState,
  NavigationDirection,

  // Config types
  FormFlowConfig,
  FormFlowClassNames,
  PersistenceOptions,
  SubmitHandler,
  SubmitContext,

  // Component prop types
  FormFlowProps,
  FormStepProps,
  FormFieldProps,
  ProgressBarProps,
  NextButtonProps,
  BackButtonProps,

  // Hook return types
  UseFormFlowReturn,

  // Vanilla types
  VanillaFormFlowOptions,
  VanillaFormFlowInstance,
} from "./types/index.js";
