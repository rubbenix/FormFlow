/**
 * StateManager
 * Manages the complete reactive state of a FormFlow instance.
 * Framework-agnostic — works with React, vanilla JS, or any other consumer.
 */

import type {
  FormFlowState,
  FormValues,
  FormStep,
  FieldValidationState,
  FormValidationState,
  NavigationDirection,
  PersistenceOptions,
} from "../types/index.js";

type Listener = (state: FormFlowState) => void;

interface PersistenceData {
  values: FormValues;
  currentStepIndex: number;
  timestamp: number;
  version: number;
}

const PERSISTENCE_VERSION = 1;

/** Creates an initial validation state for a field */
function createInitialFieldValidation(): FieldValidationState {
  return {
    valid: true,
    error: null,
    validating: false,
    touched: false,
    dirty: false,
  };
}

/** Resolves visible step IDs based on current form values */
function resolveVisibleSteps(steps: FormStep[], values: FormValues): string[] {
  return steps
    .filter((step) => {
      if (!step.condition) return true;
      try {
        return step.condition.fn(values);
      } catch {
        return true;
      }
    })
    .map((step) => step.id);
}

/** Determines if all touched/submitted fields are valid */
function computeIsValid(validation: FormValidationState): boolean {
  return Object.values(validation).every((v) => v.valid && !v.validating);
}

export class StateManager {
  private state: FormFlowState;
  private listeners: Set<Listener> = new Set();
  private steps: FormStep[];
  private persistence: PersistenceOptions | undefined;
  private persistenceKey: string;
  private initialValues: FormValues;

  constructor(
    steps: FormStep[],
    initialValues: FormValues = {},
    persistence?: PersistenceOptions,
    formId?: string,
  ) {
    this.steps = steps;
    this.persistence = persistence;
    this.persistenceKey = persistence?.key ?? `formflow-${formId ?? "default"}`;
    this.initialValues = initialValues;

    // Compute initial values by merging field defaults with provided initialValues
    const defaultValues = this.computeDefaultValues(steps);
    const mergedValues: FormValues = { ...defaultValues, ...initialValues };

    // Attempt to restore from persistence
    const persisted = this.loadPersisted();
    const values = persisted?.values
      ? { ...mergedValues, ...persisted.values }
      : mergedValues;

    const visibleStepIds = resolveVisibleSteps(steps, values);

    // Build initial validation state for all fields
    const validation: FormValidationState = {};
    for (const step of steps) {
      for (const field of step.fields) {
        validation[field.id] = createInitialFieldValidation();
      }
    }

    this.state = {
      values,
      currentStepIndex: persisted?.currentStepIndex ?? 0,
      visibleStepIds,
      validation,
      isSubmitting: false,
      isSubmitted: false,
      submitError: null,
      direction: "forward",
      isDirty: false,
      isValid: true,
    };
  }

  // ─── Public Getters ─────────────────────────────────────────────────────────

  getState(): FormFlowState {
    return { ...this.state };
  }

  getValues(): FormValues {
    return { ...this.state.values };
  }

  getVisibleSteps(): FormStep[] {
    return this.steps.filter((s) => this.state.visibleStepIds.includes(s.id));
  }

  getCurrentStep(): FormStep | undefined {
    const visible = this.getVisibleSteps();
    return visible[this.state.currentStepIndex];
  }

  // ─── Value Updates ──────────────────────────────────────────────────────────

  setValue(fieldId: string, value: unknown): void {
    const newValues: FormValues = {
      ...this.state.values,
      [fieldId]: value as FormValues[string],
    };

    const visibleStepIds = resolveVisibleSteps(this.steps, newValues);

    // Mark field as dirty
    const validation: FormValidationState = {
      ...this.state.validation,
      [fieldId]: {
        ...(this.state.validation[fieldId] ?? createInitialFieldValidation()),
        dirty: true,
      },
    };

    // Re-clamp step index if visible steps changed
    const currentStepIndex = Math.min(
      this.state.currentStepIndex,
      Math.max(0, visibleStepIds.length - 1),
    );

    const isDirty = this.computeIsDirty(newValues);

    this.setState({
      values: newValues,
      visibleStepIds,
      currentStepIndex,
      validation,
      isDirty,
      isValid: computeIsValid(validation),
    });

    this.persistIfEnabled();
  }

  setValues(partial: Partial<FormValues>): void {
    const newValues: FormValues = { ...this.state.values, ...partial };
    const visibleStepIds = resolveVisibleSteps(this.steps, newValues);

    const validation = { ...this.state.validation };
    for (const fieldId of Object.keys(partial)) {
      validation[fieldId] = {
        ...(validation[fieldId] ?? createInitialFieldValidation()),
        dirty: true,
      };
    }

    const currentStepIndex = Math.min(
      this.state.currentStepIndex,
      Math.max(0, visibleStepIds.length - 1),
    );

    this.setState({
      values: newValues,
      visibleStepIds,
      currentStepIndex,
      validation,
      isDirty: this.computeIsDirty(newValues),
      isValid: computeIsValid(validation),
    });

    this.persistIfEnabled();
  }

  // ─── Validation Updates ─────────────────────────────────────────────────────

  setFieldValidation(
    fieldId: string,
    update: Partial<FieldValidationState>,
  ): void {
    const current =
      this.state.validation[fieldId] ?? createInitialFieldValidation();
    const updated: FormValidationState = {
      ...this.state.validation,
      [fieldId]: { ...current, ...update },
    };

    this.setState({
      validation: updated,
      isValid: computeIsValid(updated),
    });
  }

  touchField(fieldId: string): void {
    this.setFieldValidation(fieldId, { touched: true });
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────

  goNext(): void {
    const visibleCount = this.state.visibleStepIds.length;
    const next = Math.min(this.state.currentStepIndex + 1, visibleCount - 1);

    this.setState({ currentStepIndex: next, direction: "forward" });
    this.persistIfEnabled();
  }

  goBack(): void {
    const prev = Math.max(this.state.currentStepIndex - 1, 0);
    this.setState({ currentStepIndex: prev, direction: "backward" });
    this.persistIfEnabled();
  }

  goToStep(index: number): void {
    const clamped = Math.max(
      0,
      Math.min(index, this.state.visibleStepIds.length - 1),
    );
    const direction: NavigationDirection =
      clamped > this.state.currentStepIndex ? "forward" : "backward";
    this.setState({ currentStepIndex: clamped, direction });
    this.persistIfEnabled();
  }

  // ─── Submit State ───────────────────────────────────────────────────────────

  setSubmitting(isSubmitting: boolean): void {
    this.setState({ isSubmitting });
  }

  setSubmitted(): void {
    this.setState({
      isSubmitting: false,
      isSubmitted: true,
      submitError: null,
    });
    this.clearPersisted();
  }

  setSubmitError(error: string): void {
    this.setState({ isSubmitting: false, submitError: error });
  }

  // ─── Reset ──────────────────────────────────────────────────────────────────

  reset(): void {
    const defaultValues = this.computeDefaultValues(this.steps);
    const values: FormValues = { ...defaultValues, ...this.initialValues };
    const visibleStepIds = resolveVisibleSteps(this.steps, values);

    const validation: FormValidationState = {};
    for (const step of this.steps) {
      for (const field of step.fields) {
        validation[field.id] = createInitialFieldValidation();
      }
    }

    this.setState({
      values,
      visibleStepIds,
      currentStepIndex: 0,
      validation,
      isSubmitting: false,
      isSubmitted: false,
      submitError: null,
      direction: "forward",
      isDirty: false,
      isValid: true,
    });

    this.clearPersisted();
  }

  // ─── Subscriptions ──────────────────────────────────────────────────────────

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private setState(partial: Partial<FormFlowState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  private notify(): void {
    const snapshot = this.getState();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private computeDefaultValues(steps: FormStep[]): FormValues {
    const values: FormValues = {};
    for (const step of steps) {
      for (const field of step.fields) {
        if (field.defaultValue !== undefined) {
          values[field.id] = field.defaultValue;
        } else if (
          field.type === "checkbox" ||
          field.type === "checkbox-group"
        ) {
          values[field.id] = field.type === "checkbox-group" ? [] : false;
        } else {
          values[field.id] = "";
        }
      }
    }
    return values;
  }

  private computeIsDirty(currentValues: FormValues): boolean {
    const defaults = this.computeDefaultValues(this.steps);
    const merged: FormValues = { ...defaults, ...this.initialValues };
    return Object.keys(currentValues).some(
      (key) => currentValues[key] !== merged[key],
    );
  }

  // ─── Persistence ────────────────────────────────────────────────────────────

  private persistIfEnabled(): void {
    if (!this.persistence?.enabled) return;
    try {
      const excludeFields = this.persistence.excludeFields ?? [];
      const valuesToPersist: FormValues = {};
      for (const [key, val] of Object.entries(this.state.values)) {
        if (!excludeFields.includes(key)) {
          valuesToPersist[key] = val;
        }
      }

      const data: PersistenceData = {
        values: valuesToPersist,
        currentStepIndex: this.persistence.includeStepIndex
          ? this.state.currentStepIndex
          : 0,
        timestamp: Date.now(),
        version: PERSISTENCE_VERSION,
      };

      localStorage.setItem(this.persistenceKey, JSON.stringify(data));
    } catch {
      // localStorage may not be available (SSR, private browsing)
    }
  }

  private loadPersisted(): PersistenceData | null {
    if (!this.persistence?.enabled) return null;
    try {
      const raw = localStorage.getItem(this.persistenceKey);
      if (!raw) return null;

      const data = JSON.parse(raw) as PersistenceData;

      if (data.version !== PERSISTENCE_VERSION) return null;

      if (this.persistence.ttl) {
        const age = Date.now() - data.timestamp;
        if (age > this.persistence.ttl) {
          localStorage.removeItem(this.persistenceKey);
          return null;
        }
      }

      return data;
    } catch {
      return null;
    }
  }

  private clearPersisted(): void {
    try {
      localStorage.removeItem(this.persistenceKey);
    } catch {
      // ignore
    }
  }
}
