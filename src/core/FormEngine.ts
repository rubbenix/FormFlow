/**
 * FormEngine
 * The central orchestrator for a FormFlow instance.
 * Combines StateManager + ValidationEngine into a single public API
 * that React hooks and the vanilla adapter both consume.
 */

import { StateManager } from "./StateManager.js";
import {
  validateField,
  validateStep,
  validateAll,
  isStepValid,
} from "./ValidationEngine.js";
import type {
  FormFlowConfig,
  FormFlowState,
  FormValues,
  FormStep,
  FieldValue,
  FormValidationState,
} from "../types/index.js";

export class FormEngine {
  private manager: StateManager;
  private config: FormFlowConfig;

  constructor(config: FormFlowConfig) {
    this.config = config;
    this.manager = new StateManager(
      config.steps,
      config.initialValues,
      config.persistence,
      config.id,
    );
  }

  // ─── State Access ────────────────────────────────────────────────────────────

  getState(): FormFlowState {
    return this.manager.getState();
  }

  getValues(): FormValues {
    return this.manager.getValues();
  }

  getVisibleSteps(): FormStep[] {
    return this.manager.getVisibleSteps();
  }

  getCurrentStep(): FormStep | undefined {
    return this.manager.getCurrentStep();
  }

  getCurrentStepIndex(): number {
    return this.manager.getState().currentStepIndex;
  }

  getTotalSteps(): number {
    return this.manager.getState().visibleStepIds.length;
  }

  getProgress(): number {
    const total = this.getTotalSteps();
    if (total === 0) return 0;
    return Math.round(((this.getCurrentStepIndex() + 1) / total) * 100);
  }

  canGoBack(): boolean {
    return this.manager.getState().currentStepIndex > 0;
  }

  canGoForward(): boolean {
    const { currentStepIndex, visibleStepIds } = this.manager.getState();
    return currentStepIndex < visibleStepIds.length - 1;
  }

  isLastStep(): boolean {
    const { currentStepIndex, visibleStepIds } = this.manager.getState();
    return currentStepIndex === visibleStepIds.length - 1;
  }

  // ─── Value Management ────────────────────────────────────────────────────────

  setValue(fieldId: string, value: FieldValue): void {
    this.manager.setValue(fieldId, value);

    const { values, validation } = this.manager.getState();

    // If validateOnChange is enabled, validate the changed field immediately
    if (this.config.validateOnChange) {
      const allFields = this.config.steps.flatMap((s) => s.fields);
      const field = allFields.find((f) => f.id === fieldId);
      if (field) {
        void validateField(field, value, values).then((result) => {
          this.manager.setFieldValidation(fieldId, {
            valid: result.valid,
            error: result.valid ? null : result.message,
            validating: false,
          });
        });
      }
    }

    // Fire onChange callback
    this.config.onChange?.(values, this.manager.getState());

    void this.updateValidationAfterValue(fieldId, value, validation, values);
  }

  setValues(partial: Partial<FormValues>): void {
    this.manager.setValues(partial);
    const { values } = this.manager.getState();
    this.config.onChange?.(values, this.manager.getState());
  }

  touchField(fieldId: string): void {
    this.manager.touchField(fieldId);
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────

  async goNext(): Promise<void> {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return;

    const { values } = this.manager.getState();

    // Validate the current step
    const stepValidation = await validateStep(currentStep, values);

    // Merge validation results into state (mark all as touched)
    const updatedValidation: FormValidationState = {
      ...this.manager.getState().validation,
      ...stepValidation,
    };

    for (const [fieldId, fieldState] of Object.entries(stepValidation)) {
      this.manager.setFieldValidation(fieldId, fieldState);
    }

    if (!isStepValid(currentStep, updatedValidation, values)) {
      return; // Stay on current step — errors are now visible
    }

    // Call onBeforeNext hook
    if (currentStep.onBeforeNext) {
      const stepValues = this.extractStepValues(currentStep, values);
      let canProceed = false;
      try {
        canProceed = await Promise.resolve(
          currentStep.onBeforeNext(stepValues, values),
        );
      } catch {
        canProceed = false;
      }
      if (!canProceed) return;
    }

    // Call onLeave for current step
    currentStep.onLeave?.(this.extractStepValues(currentStep, values), values);

    // Perform navigation
    this.manager.goNext();

    // Call onEnter for new step
    const nextStep = this.getCurrentStep();
    if (nextStep) {
      const nextValues = this.extractStepValues(nextStep, values);
      nextStep.onEnter?.(nextValues, values);
    }

    // Fire onStepChange
    this.config.onStepChange?.(nextStep ?? currentStep, currentStep, "forward");
  }

  goBack(): void {
    const currentStep = this.getCurrentStep();
    if (!currentStep || !this.canGoBack()) return;

    const { values } = this.manager.getState();

    // Call onLeave
    currentStep.onLeave?.(this.extractStepValues(currentStep, values), values);

    this.manager.goBack();

    const prevStep = this.getCurrentStep();
    if (prevStep) {
      prevStep.onEnter?.(this.extractStepValues(prevStep, values), values);
    }

    this.config.onStepChange?.(
      prevStep ?? currentStep,
      currentStep,
      "backward",
    );
  }

  goToStep(index: number): void {
    if (!this.config.allowStepJump) return;
    this.manager.goToStep(index);

    const newStep = this.getCurrentStep();
    if (newStep) {
      const { values } = this.manager.getState();
      newStep.onEnter?.(this.extractStepValues(newStep, values), values);
    }
  }

  // ─── Validation ──────────────────────────────────────────────────────────────

  async validateCurrentStep(): Promise<boolean> {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return true;

    const { values } = this.manager.getState();
    const stepValidation = await validateStep(currentStep, values);

    for (const [fieldId, fieldState] of Object.entries(stepValidation)) {
      this.manager.setFieldValidation(fieldId, fieldState);
    }

    const merged: FormValidationState = {
      ...this.manager.getState().validation,
      ...stepValidation,
    };

    return isStepValid(currentStep, merged, values);
  }

  async validateAllSteps(): Promise<boolean> {
    const { values, visibleStepIds } = this.manager.getState();
    const allValidation = await validateAll(
      this.config.steps,
      visibleStepIds,
      values,
    );

    for (const [fieldId, fieldState] of Object.entries(allValidation)) {
      this.manager.setFieldValidation(fieldId, fieldState);
    }

    return Object.values(allValidation).every((v) => v.valid);
  }

  // ─── Submission ──────────────────────────────────────────────────────────────

  async submit(): Promise<void> {
    const { values } = this.manager.getState();

    // Validate everything first
    const allValid = await this.validateAllSteps();
    if (!allValid) return;

    this.manager.setSubmitting(true);

    try {
      await this.config.onSubmit(values, {
        values,
        steps: this.config.steps,
        visibleStepIds: this.manager.getState().visibleStepIds,
        reset: () => this.reset(),
      });
      this.manager.setSubmitted();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      this.manager.setSubmitError(message);
    }
  }

  // ─── Reset ──────────────────────────────────────────────────────────────────

  reset(): void {
    this.manager.reset();
  }

  // ─── Subscriptions ───────────────────────────────────────────────────────────

  subscribe(listener: (state: FormFlowState) => void): () => void {
    return this.manager.subscribe(listener);
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private extractStepValues(step: FormStep, values: FormValues): FormValues {
    const stepValues: FormValues = {};
    for (const field of step.fields) {
      stepValues[field.id] = values[field.id];
    }
    return stepValues;
  }

  private async updateValidationAfterValue(
    fieldId: string,
    value: FieldValue,
    validation: FormValidationState,
    values: FormValues,
  ): Promise<void> {
    // Only re-validate if the field has already been touched
    const fieldState = validation[fieldId];
    if (!fieldState?.touched && !this.config.validateOnChange) return;

    const allFields = this.config.steps.flatMap((s) => s.fields);
    const field = allFields.find((f) => f.id === fieldId);
    if (!field) return;

    // Mark as validating
    this.manager.setFieldValidation(fieldId, { validating: true });

    const result = await validateField(field, value, values);
    this.manager.setFieldValidation(fieldId, {
      valid: result.valid,
      error: result.valid ? null : result.message,
      validating: false,
    });
  }
}
