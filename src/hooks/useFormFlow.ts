/**
 * useFormFlow
 * Primary React hook for managing a FormFlow instance.
 * Creates and owns the FormEngine, wires up subscriptions, and returns
 * a stable API object that components can consume.
 */

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { FormEngine } from "../core/FormEngine.js";
import type {
  FormFlowConfig,
  FormFlowState,
  FormStep,
  FormValues,
  FieldValue,
  UseFormFlowReturn,
} from "../types/index.js";

// Force a re-render whenever the engine fires
function useForceUpdate(): () => void {
  const [, dispatch] = useReducer((n: number) => n + 1, 0);
  return dispatch;
}

/**
 * useFormFlow — the core hook for a FormFlow form.
 *
 * @example
 * const form = useFormFlow({
 *   steps,
 *   onSubmit: async (values) => { await api.submit(values); },
 * });
 *
 * return <FormFlowProvider value={form}>...</FormFlowProvider>;
 */
export function useFormFlow(config: FormFlowConfig): UseFormFlowReturn {
  const forceUpdate = useForceUpdate();

  // Keep a stable reference to the engine across renders.
  // We only create it once — config changes after mount are ignored to
  // match common form-library conventions. Use a key prop to fully re-mount.
  const engineRef = useRef<FormEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new FormEngine(config);
  }
  const engine = engineRef.current;

  // Subscribe to state changes and trigger re-renders
  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      forceUpdate();
    });
    return unsubscribe;
  }, [engine, forceUpdate]);

  // ─── Derived state ────────────────────────────────────────────────────────

  const state: FormFlowState = engine.getState();
  const visibleSteps: FormStep[] = engine.getVisibleSteps();
  const fallbackStep = config.steps[0];
  if (!fallbackStep) {
    throw new Error("FormFlow: at least one step is required");
  }
  const currentStep: FormStep = engine.getCurrentStep() ?? fallbackStep;
  const currentStepIndex = engine.getCurrentStepIndex();
  const totalSteps = engine.getTotalSteps();
  const progress = engine.getProgress();
  const canGoBack = engine.canGoBack();
  const canGoForward = engine.canGoForward();
  const isLastStep = engine.isLastStep();

  // ─── Stable callbacks ─────────────────────────────────────────────────────

  const goNext = useCallback(async () => {
    await engine.goNext();
  }, [engine]);

  const goBack = useCallback(() => {
    engine.goBack();
  }, [engine]);

  const goToStep = useCallback(
    (index: number) => {
      engine.goToStep(index);
    },
    [engine],
  );

  const setValue = useCallback(
    (fieldId: string, value: FieldValue) => {
      engine.setValue(fieldId, value);
    },
    [engine],
  );

  const setValues = useCallback(
    (values: Partial<FormValues>) => {
      engine.setValues(values);
    },
    [engine],
  );

  const touchField = useCallback(
    (fieldId: string) => {
      engine.touchField(fieldId); // via StateManager
    },
    [engine],
  );

  const validateCurrentStep = useCallback(async () => {
    return engine.validateCurrentStep();
  }, [engine]);

  const validateAll = useCallback(async () => {
    return engine.validateAllSteps();
  }, [engine]);

  const submit = useCallback(async () => {
    await engine.submit();
  }, [engine]);

  const reset = useCallback(() => {
    engine.reset();
  }, [engine]);

  // Return a stable object (consumers can destructure freely)
  return useMemo(
    () => ({
      state,
      currentStep,
      visibleSteps,
      currentStepIndex,
      totalSteps,
      progress,
      canGoBack,
      canGoForward,
      isLastStep,
      goNext,
      goBack,
      goToStep,
      setValue,
      setValues,
      touchField,
      validateCurrentStep,
      validateAll,
      submit,
      reset,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      state,
      currentStep,
      visibleSteps,
      currentStepIndex,
      totalSteps,
      progress,
      canGoBack,
      canGoForward,
      isLastStep,
      goNext,
      goBack,
      goToStep,
      setValue,
      setValues,
      touchField,
      validateCurrentStep,
      validateAll,
      submit,
      reset,
    ],
  );
}
