/**
 * FormFlow Type Definitions
 * Complete TypeScript type system for the FormFlow library.
 */

// ─── Primitive Value Types ───────────────────────────────────────────────────

/** All supported field value types */
export type FieldValue = string | number | boolean | string[] | null | undefined;

/** A map of field IDs to their current values */
export type FormValues = Record<string, FieldValue>;

// ─── Validator Types ─────────────────────────────────────────────────────────

/** Result returned by a validator function */
export interface ValidationResult {
  /** Whether the value passed validation */
  valid: boolean;
  /** Error message to display when invalid */
  message: string;
}

/**
 * A validator function that receives a value and the full form values,
 * and returns either a ValidationResult or a Promise of one.
 */
export type ValidatorFn = (
  value: FieldValue,
  formValues: FormValues,
) => ValidationResult | Promise<ValidationResult>;

/** A validator object with a function and optional metadata */
export interface Validator {
  validate: ValidatorFn;
  /** Unique key for this validator (used for deduplication) */
  key?: string;
}

// ─── Field Types ─────────────────────────────────────────────────────────────

/** All supported HTML input types plus custom field types */
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "checkbox-group"
  | "date"
  | "time"
  | "datetime-local"
  | "file"
  | "hidden"
  | "custom";

/** An option for select, radio, or checkbox-group fields */
export interface FieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

/**
 * Condition for showing/hiding a field based on form state.
 * The field is shown when `fn(formValues)` returns true.
 */
export interface FieldCondition {
  /** Returns true when the field should be visible */
  fn: (formValues: FormValues) => boolean;
  /**
   * Field IDs to watch for changes.
   * When specified, only re-evaluates when these fields change.
   */
  watchFields?: string[];
}

/** Complete field definition */
export interface FormField {
  /** Unique identifier for the field within the form */
  id: string;
  /** Input type */
  type: FieldType;
  /** Display label */
  label: string;
  /** Placeholder text */
  placeholder?: string;
  /** Helper / description text shown below the field */
  description?: string;
  /** Default value when the form initializes */
  defaultValue?: FieldValue;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is read-only */
  readonly?: boolean;
  /** Validators to run against this field */
  validators?: Validator[];
  /** Condition controlling field visibility */
  condition?: FieldCondition;
  /** Options for select, radio, and checkbox-group fields */
  options?: FieldOption[];
  /** Extra HTML attributes to spread onto the input element */
  inputProps?: Record<string, unknown>;
  /** CSS class names to apply to the field wrapper */
  className?: string;
  /** ARIA label override (falls back to `label`) */
  ariaLabel?: string;
  /** Auto-focus this field when its step becomes active */
  autoFocus?: boolean;
}

// ─── Step Types ───────────────────────────────────────────────────────────────

/** A condition controlling whether a step is shown */
export interface StepCondition {
  fn: (formValues: FormValues) => boolean;
  watchFields?: string[];
}

/** A single form step definition */
export interface FormStep {
  /** Unique identifier */
  id: string;
  /** Display title shown in the step header and progress indicator */
  title: string;
  /** Optional subtitle / description */
  description?: string;
  /** The fields that belong to this step */
  fields: FormField[];
  /** Condition controlling whether this step appears in the flow */
  condition?: StepCondition;
  /**
   * Called before moving forward from this step.
   * Return false or a rejected promise to prevent navigation.
   */
  onBeforeNext?: (
    stepValues: FormValues,
    allValues: FormValues,
  ) => boolean | Promise<boolean>;
  /**
   * Called when the user arrives at this step.
   */
  onEnter?: (stepValues: FormValues, allValues: FormValues) => void;
  /**
   * Called when the user leaves this step.
   */
  onLeave?: (stepValues: FormValues, allValues: FormValues) => void;
  /** CSS class name for the step container */
  className?: string;
}

// ─── Theme Types ──────────────────────────────────────────────────────────────

/** Color tokens used throughout FormFlow */
export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryForeground: string;
  secondary: string;
  secondaryHover: string;
  secondaryForeground: string;
  background: string;
  surface: string;
  border: string;
  borderFocus: string;
  text: string;
  textMuted: string;
  error: string;
  errorBackground: string;
  success: string;
  successBackground: string;
  progressTrack: string;
  progressFill: string;
}

/** Spacing scale tokens */
export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/** Border radius tokens */
export interface ThemeBorderRadius {
  sm: string;
  md: string;
  lg: string;
  full: string;
}

/** Typography tokens */
export interface ThemeTypography {
  fontFamily: string;
  fontSizeBase: string;
  fontSizeSm: string;
  fontSizeLg: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  lineHeight: string;
}

/** Transition tokens */
export interface ThemeTransitions {
  fast: string;
  normal: string;
  slow: string;
}

/** Complete theme definition */
export interface FormFlowTheme {
  name: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  typography: ThemeTypography;
  transitions: ThemeTransitions;
}

/** Theme names built into FormFlow */
export type BuiltInTheme = "light" | "dark";

// ─── State Types ─────────────────────────────────────────────────────────────

/** Validation state for a single field */
export interface FieldValidationState {
  valid: boolean;
  error: string | null;
  /** True while async validation is in progress */
  validating: boolean;
  /** True once the field has been touched/blurred at least once */
  touched: boolean;
  /** True once the field value has changed */
  dirty: boolean;
}

/** Validation state for all fields (keyed by field ID) */
export type FormValidationState = Record<string, FieldValidationState>;

/** Navigation direction */
export type NavigationDirection = "forward" | "backward";

/** The complete runtime state of a FormFlow instance */
export interface FormFlowState {
  /** All current form values keyed by field ID */
  values: FormValues;
  /** Index of the currently active step (among visible steps) */
  currentStepIndex: number;
  /** IDs of steps that are currently visible (conditions passing) */
  visibleStepIds: string[];
  /** Validation state for every field */
  validation: FormValidationState;
  /** True while the form is submitting */
  isSubmitting: boolean;
  /** True once the form has been successfully submitted */
  isSubmitted: boolean;
  /** Error from the submit handler, if any */
  submitError: string | null;
  /** Direction of the last navigation action */
  direction: NavigationDirection;
  /** True if ANY field value has changed from its default */
  isDirty: boolean;
  /** True if ALL visible required fields are valid */
  isValid: boolean;
}

// ─── Persistence Types ────────────────────────────────────────────────────────

/** Options for localStorage state persistence */
export interface PersistenceOptions {
  /** Enable persistence */
  enabled: boolean;
  /** localStorage key to use (defaults to `formflow-${formId}`) */
  key?: string;
  /** Fields to exclude from persistence */
  excludeFields?: string[];
  /** Persist step index alongside values */
  includeStepIndex?: boolean;
  /** TTL in milliseconds before persisted state is considered stale */
  ttl?: number;
}

// ─── Submission Types ─────────────────────────────────────────────────────────

/** Context passed to the submit handler */
export interface SubmitContext {
  values: FormValues;
  steps: FormStep[];
  visibleStepIds: string[];
  /** Reset the form to its initial state */
  reset: () => void;
}

/** Submit handler — can be async */
export type SubmitHandler = (
  values: FormValues,
  context: SubmitContext,
) => void | Promise<void>;

// ─── Config Types ─────────────────────────────────────────────────────────────

/** Top-level configuration for a FormFlow instance */
export interface FormFlowConfig {
  /** Unique form identifier (used for persistence keys, ARIA labels) */
  id?: string;
  /** The ordered list of form steps */
  steps: FormStep[];
  /** Called when the form is submitted successfully */
  onSubmit: SubmitHandler;
  /** Called whenever any form value changes */
  onChange?: (values: FormValues, state: FormFlowState) => void;
  /** Called whenever the active step changes */
  onStepChange?: (
    currentStep: FormStep,
    previousStep: FormStep | null,
    direction: NavigationDirection,
  ) => void;
  /** Initial values to pre-populate fields */
  initialValues?: FormValues;
  /** Theme — built-in name or custom theme object */
  theme?: BuiltInTheme | FormFlowTheme;
  /** Inject custom CSS class names */
  classNames?: FormFlowClassNames;
  /** Persistence options */
  persistence?: PersistenceOptions;
  /**
   * Validate all fields on every change (eager).
   * Defaults to false — validation runs on blur / submit.
   */
  validateOnChange?: boolean;
  /**
   * Whether to allow jumping directly to any step via the progress bar.
   * Defaults to false.
   */
  allowStepJump?: boolean;
  /**
   * Custom submit button text.
   * Defaults to "Submit".
   */
  submitLabel?: string;
  /**
   * Custom next button text.
   * Defaults to "Next".
   */
  nextLabel?: string;
  /**
   * Custom back button text.
   * Defaults to "Back".
   */
  backLabel?: string;
  /** Whether to show a progress indicator. Defaults to true. */
  showProgress?: boolean;
  /** Whether to show step titles in the form header. Defaults to true. */
  showStepTitle?: boolean;
  /** aria-label for the overall form element */
  ariaLabel?: string;
}

/** CSS class name overrides for all FormFlow elements */
export interface FormFlowClassNames {
  /** The outermost container */
  root?: string;
  /** The progress bar wrapper */
  progressBar?: string;
  /** The progress bar fill */
  progressFill?: string;
  /** The step container */
  step?: string;
  /** The step header (title + description) */
  stepHeader?: string;
  /** The fields area */
  fieldsContainer?: string;
  /** An individual field wrapper */
  field?: string;
  /** The field's <label> */
  fieldLabel?: string;
  /** The field's <input> / <select> / <textarea> */
  fieldInput?: string;
  /** The field's error message */
  fieldError?: string;
  /** The field's description text */
  fieldDescription?: string;
  /** The navigation button row */
  navigation?: string;
  /** The Back button */
  backButton?: string;
  /** The Next / Submit button */
  nextButton?: string;
}

// ─── React Component Prop Types ───────────────────────────────────────────────

/** Props for the top-level <FormFlow /> component */
export interface FormFlowProps extends FormFlowConfig {
  /** Additional class name on the root element */
  className?: string;
  /** Custom render for the progress bar */
  renderProgress?: (progress: number, step: FormStep) => React.ReactNode;
  /** Custom render for the navigation area */
  renderNavigation?: (
    canGoBack: boolean,
    canGoForward: boolean,
    isLastStep: boolean,
    isSubmitting: boolean,
  ) => React.ReactNode;
}

/** Props for <FormStep /> */
export interface FormStepProps {
  step: FormStep;
  values: FormValues;
  validation: FormValidationState;
  onChange: (fieldId: string, value: FieldValue) => void;
  onBlur: (fieldId: string) => void;
  theme?: FormFlowTheme;
  classNames?: FormFlowClassNames;
  validateOnChange?: boolean;
}

/** Props for <FormField /> */
export interface FormFieldProps {
  field: FormField;
  value: FieldValue;
  validation: FieldValidationState | undefined;
  onChange: (value: FieldValue) => void;
  onBlur: () => void;
  theme?: FormFlowTheme;
  classNames?: FormFlowClassNames;
}

/** Props for <ProgressBar /> */
export interface ProgressBarProps {
  current: number;
  total: number;
  /** 0–100 */
  percentage: number;
  steps?: Array<{ id: string; title: string }>;
  onStepClick?: (stepIndex: number) => void;
  allowJump?: boolean;
  className?: string;
  theme?: FormFlowTheme;
  classNames?: FormFlowClassNames;
}

/** Props for <NextButton /> */
export interface NextButtonProps {
  onClick: () => void;
  isLastStep: boolean;
  isSubmitting: boolean;
  disabled?: boolean;
  className?: string;
  nextLabel?: string;
  submitLabel?: string;
  theme?: FormFlowTheme;
}

/** Props for <BackButton /> */
export interface BackButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  backLabel?: string;
  theme?: FormFlowTheme;
}

// ─── Hook Return Types ────────────────────────────────────────────────────────

/** Everything returned by useFormFlow */
export interface UseFormFlowReturn {
  /** Current form state */
  state: FormFlowState;
  /** The currently active step object */
  currentStep: FormStep;
  /** All steps that are currently visible */
  visibleSteps: FormStep[];
  /** 0-based index of current step among visible steps */
  currentStepIndex: number;
  /** Total number of visible steps */
  totalSteps: number;
  /** Progress percentage (0–100) */
  progress: number;
  /** Whether the user can go back */
  canGoBack: boolean;
  /** Whether the user can go forward */
  canGoForward: boolean;
  /** Whether the current step is the last one */
  isLastStep: boolean;
  /** Navigate to the next step (validates current step first) */
  goNext: () => Promise<void>;
  /** Navigate to the previous step */
  goBack: () => void;
  /** Jump to a specific step by index */
  goToStep: (index: number) => void;
  /** Update a single field value */
  setValue: (fieldId: string, value: FieldValue) => void;
  /** Update multiple field values at once */
  setValues: (values: Partial<FormValues>) => void;
  /** Trigger blur/touch on a field */
  touchField: (fieldId: string) => void;
  /** Validate the current step's fields */
  validateCurrentStep: () => Promise<boolean>;
  /** Validate all steps */
  validateAll: () => Promise<boolean>;
  /** Manually trigger form submission */
  submit: () => Promise<void>;
  /** Reset form to initial state */
  reset: () => void;
}

// ─── Vanilla JS Types ─────────────────────────────────────────────────────────

/** Options for the vanilla JS createFormFlow function */
export interface VanillaFormFlowOptions extends FormFlowConfig {
  /** CSS selector or HTMLElement to mount into */
  target: string | HTMLElement;
}

/** Instance returned by createFormFlow */
export interface VanillaFormFlowInstance {
  /** Destroy the form and clean up listeners */
  destroy: () => void;
  /** Get the current form state */
  getState: () => FormFlowState;
  /** Programmatically set a value */
  setValue: (fieldId: string, value: FieldValue) => void;
  /** Programmatically navigate */
  goNext: () => Promise<void>;
  goBack: () => void;
  goToStep: (index: number) => void;
  /** Reset the form */
  reset: () => void;
  /** Subscribe to state changes */
  subscribe: (listener: (state: FormFlowState) => void) => () => void;
}

// Re-export React namespace for prop types that reference React.ReactNode
import type React from "react";
export type { React };
