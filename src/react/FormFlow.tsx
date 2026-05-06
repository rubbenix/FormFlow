/**
 * FormFlow Component
 * The top-level React component. Orchestrates the full multi-step form UI.
 *
 * @example
 * <FormFlow
 *   steps={steps}
 *   onSubmit={async (values) => { await api.post('/submit', values); }}
 * />
 */

import React, { useCallback, useId } from "react";
import { FormFlowContext } from "./context.js";
import { FormStep } from "./FormStep.js";
import { ProgressBar } from "./ProgressBar.js";
import { NextButton } from "./NextButton.js";
import { BackButton } from "./BackButton.js";
import { useFormFlow } from "../hooks/useFormFlow.js";
import { resolveTheme } from "../themes/index.js";
import { getRootStyles } from "./styles.js";
import type { FormFlowProps, FieldValue } from "../types/index.js";

/**
 * <FormFlow />
 * Drop-in multi-step form with built-in state, validation, and UI.
 *
 * @example
 * const steps = [
 *   {
 *     id: "personal",
 *     title: "Personal Info",
 *     fields: [
 *       { id: "name", type: "text", label: "Full Name", validators: [required()] },
 *       { id: "email", type: "email", label: "Email", validators: [required(), email()] },
 *     ],
 *   },
 *   {
 *     id: "confirm",
 *     title: "Confirmation",
 *     fields: [
 *       { id: "agree", type: "checkbox", label: "I agree to the terms", validators: [required()] },
 *     ],
 *   },
 * ];
 *
 * <FormFlow steps={steps} onSubmit={data => console.log(data)} />
 */
export function FormFlow({
  className,
  theme: themeProp = "light",
  classNames = {},
  validateOnChange = false,
  allowStepJump = false,
  showProgress = true,
  showStepTitle = false,
  nextLabel = "Next",
  backLabel = "Back",
  submitLabel = "Submit",
  ariaLabel,
  renderProgress,
  renderNavigation,
  ...config
}: FormFlowProps) {
  const formId = useId();
  const theme = resolveTheme(themeProp);

  // Wire up the engine
  const form = useFormFlow({
    ...config,
    id: config.id ?? formId,
    validateOnChange,
    allowStepJump,
    nextLabel,
    backLabel,
    submitLabel,
  });

  const {
    state,
    currentStep,
    visibleSteps,
    currentStepIndex,
    totalSteps,
    progress,
    canGoBack,
    isLastStep,
    goNext,
    goBack,
    goToStep,
    setValue,
    touchField,
  } = form;

  const handleChange = useCallback(
    (fieldId: string, value: FieldValue) => {
      setValue(fieldId, value);
    },
    [setValue],
  );

  const handleBlur = useCallback(
    (fieldId: string) => {
      touchField(fieldId);
    },
    [touchField],
  );

  const handleNext = useCallback(async () => {
    if (isLastStep) {
      await form.submit();
    } else {
      await goNext();
    }
  }, [isLastStep, form, goNext]);

  const contextValue = {
    form,
    theme,
    classNames,
    validateOnChange,
    allowStepJump,
    nextLabel,
    backLabel,
    submitLabel,
  };

  const stepLabels = visibleSteps.map((s) => ({ id: s.id, title: s.title }));

  return (
    <FormFlowContext.Provider value={contextValue}>
      <div
        className={className ?? classNames.root}
        style={getRootStyles(theme)}
        role="main"
        aria-label={ariaLabel ?? `${currentStep.title} form`}
      >
        {/* Progress indicator */}
        {showProgress && (
          <>
            {renderProgress ? (
              renderProgress(progress, currentStep)
            ) : (
              <ProgressBar
                current={currentStepIndex + 1}
                total={totalSteps}
                percentage={progress}
                steps={stepLabels}
                onStepClick={allowStepJump ? goToStep : undefined}
                allowJump={allowStepJump}
                theme={theme}
                classNames={classNames}
              />
            )}
          </>
        )}

        {/* Form */}
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void handleNext();
          }}
          aria-label={currentStep.title}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.xl,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          {/* Success state */}
          {state.isSubmitted && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                padding: theme.spacing.lg,
                backgroundColor: theme.colors.successBackground,
                borderRadius: theme.borderRadius.md,
                color: theme.colors.success,
                textAlign: "center",
                fontWeight: theme.typography.fontWeightMedium,
              }}
            >
              ✓ Form submitted successfully!
            </div>
          )}

          {/* Error state */}
          {state.submitError && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.errorBackground,
                borderRadius: theme.borderRadius.md,
                color: theme.colors.error,
                marginBottom: theme.spacing.md,
                fontSize: theme.typography.fontSizeSm,
              }}
            >
              {state.submitError}
            </div>
          )}

          {/* Current step */}
          {!state.isSubmitted && (
            <FormStep
              step={currentStep}
              values={state.values}
              validation={state.validation}
              onChange={handleChange}
              onBlur={handleBlur}
              theme={theme}
              classNames={classNames}
            />
          )}

          {/* Navigation */}
          {!state.isSubmitted && (
            <div
              className={classNames.navigation}
              style={{
                display: "flex",
                justifyContent: canGoBack ? "space-between" : "flex-end",
                alignItems: "center",
                marginTop: theme.spacing.xl,
                gap: theme.spacing.md,
              }}
            >
              {renderNavigation ? (
                renderNavigation(
                  canGoBack,
                  !isLastStep,
                  isLastStep,
                  state.isSubmitting,
                )
              ) : (
                <>
                  {canGoBack && (
                    <BackButton
                      onClick={goBack}
                      disabled={state.isSubmitting}
                      backLabel={backLabel}
                      theme={theme}
                      className={classNames.backButton}
                    />
                  )}
                  <NextButton
                    onClick={() => void handleNext()}
                    isLastStep={isLastStep}
                    isSubmitting={state.isSubmitting}
                    nextLabel={nextLabel}
                    submitLabel={submitLabel}
                    theme={theme}
                    className={classNames.nextButton}
                  />
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </FormFlowContext.Provider>
  );
}
