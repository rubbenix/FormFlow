/**
 * StateManager Tests
 * Tests for form state management: values, navigation, persistence.
 */

import { describe, it, expect, vi } from "vitest";
import { StateManager } from "../src/core/StateManager.js";
import type { FormStep } from "../src/types/index.js";

const STEP_1: FormStep = {
  id: "step1",
  title: "Step 1",
  fields: [
    { id: "name", type: "text", label: "Name", defaultValue: "" },
    { id: "age", type: "number", label: "Age", defaultValue: "" },
  ],
};

const STEP_2: FormStep = {
  id: "step2",
  title: "Step 2",
  fields: [
    { id: "email", type: "email", label: "Email", defaultValue: "" },
  ],
};

const STEP_3: FormStep = {
  id: "step3",
  title: "Step 3",
  fields: [
    { id: "agree", type: "checkbox", label: "Agree", defaultValue: false },
  ],
};

const ALL_STEPS = [STEP_1, STEP_2, STEP_3];

function makeManager(steps = ALL_STEPS, initialValues = {}) {
  return new StateManager(steps, initialValues);
}

// ─── Initial state ────────────────────────────────────────────────────────────

describe("StateManager — initial state", () => {
  it("starts at step 0", () => {
    const m = makeManager();
    expect(m.getState().currentStepIndex).toBe(0);
  });

  it("computes default values from field definitions", () => {
    const m = makeManager();
    const values = m.getValues();
    expect(values.name).toBe("");
    expect(values.age).toBe("");
    expect(values.agree).toBe(false);
  });

  it("merges provided initialValues over defaults", () => {
    const m = makeManager(ALL_STEPS, { name: "Alice" });
    expect(m.getValues().name).toBe("Alice");
  });

  it("all steps are visible when no conditions defined", () => {
    const m = makeManager();
    expect(m.getState().visibleStepIds).toEqual(["step1", "step2", "step3"]);
  });

  it("starts as not dirty", () => {
    const m = makeManager();
    expect(m.getState().isDirty).toBe(false);
  });
});

// ─── Value updates ────────────────────────────────────────────────────────────

describe("StateManager — setValue", () => {
  it("updates a single field value", () => {
    const m = makeManager();
    m.setValue("name", "Bob");
    expect(m.getValues().name).toBe("Bob");
  });

  it("marks the field as dirty", () => {
    const m = makeManager();
    m.setValue("name", "Bob");
    expect(m.getState().validation.name?.dirty).toBe(true);
  });

  it("marks the form as dirty", () => {
    const m = makeManager();
    m.setValue("name", "Bob");
    expect(m.getState().isDirty).toBe(true);
  });

  it("updates multiple fields with setValues", () => {
    const m = makeManager();
    m.setValues({ name: "Carol", age: 30 });
    expect(m.getValues().name).toBe("Carol");
    expect(m.getValues().age).toBe(30);
  });
});

// ─── Navigation ───────────────────────────────────────────────────────────────

describe("StateManager — navigation", () => {
  it("goNext increments step index", () => {
    const m = makeManager();
    m.goNext();
    expect(m.getState().currentStepIndex).toBe(1);
  });

  it("goNext does not exceed last step", () => {
    const m = makeManager();
    m.goNext();
    m.goNext();
    m.goNext(); // attempt beyond last
    expect(m.getState().currentStepIndex).toBe(2);
  });

  it("goBack decrements step index", () => {
    const m = makeManager();
    m.goNext();
    m.goBack();
    expect(m.getState().currentStepIndex).toBe(0);
  });

  it("goBack does not go below 0", () => {
    const m = makeManager();
    m.goBack();
    expect(m.getState().currentStepIndex).toBe(0);
  });

  it("goToStep jumps to a specific index", () => {
    const m = makeManager();
    m.goToStep(2);
    expect(m.getState().currentStepIndex).toBe(2);
  });

  it("goToStep clamps to valid range", () => {
    const m = makeManager();
    m.goToStep(99);
    expect(m.getState().currentStepIndex).toBe(2);
  });

  it("direction is 'forward' after goNext", () => {
    const m = makeManager();
    m.goNext();
    expect(m.getState().direction).toBe("forward");
  });

  it("direction is 'backward' after goBack", () => {
    const m = makeManager();
    m.goNext();
    m.goBack();
    expect(m.getState().direction).toBe("backward");
  });
});

// ─── Conditional steps ────────────────────────────────────────────────────────

describe("StateManager — conditional steps", () => {
  it("hides a step when condition is false", () => {
    const steps: FormStep[] = [
      STEP_1,
      {
        ...STEP_2,
        condition: { fn: (values) => values.name === "show" },
      },
      STEP_3,
    ];
    const m = new StateManager(steps);
    expect(m.getState().visibleStepIds).toEqual(["step1", "step3"]);
  });

  it("shows a conditional step when condition becomes true", () => {
    const steps: FormStep[] = [
      STEP_1,
      {
        ...STEP_2,
        condition: { fn: (values) => values.name === "show" },
      },
      STEP_3,
    ];
    const m = new StateManager(steps);
    m.setValue("name", "show");
    expect(m.getState().visibleStepIds).toContain("step2");
  });
});

// ─── Subscriptions ────────────────────────────────────────────────────────────

describe("StateManager — subscriptions", () => {
  it("calls listener on state change", () => {
    const m = makeManager();
    const listener = vi.fn();
    m.subscribe(listener);
    m.setValue("name", "Test");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("returns an unsubscribe function", () => {
    const m = makeManager();
    const listener = vi.fn();
    const unsub = m.subscribe(listener);
    unsub();
    m.setValue("name", "Test");
    expect(listener).not.toHaveBeenCalled();
  });

  it("can have multiple listeners", () => {
    const m = makeManager();
    const l1 = vi.fn();
    const l2 = vi.fn();
    m.subscribe(l1);
    m.subscribe(l2);
    m.setValue("name", "X");
    expect(l1).toHaveBeenCalledTimes(1);
    expect(l2).toHaveBeenCalledTimes(1);
  });
});

// ─── Reset ────────────────────────────────────────────────────────────────────

describe("StateManager — reset", () => {
  it("resets values to defaults", () => {
    const m = makeManager(ALL_STEPS, { name: "Alice" });
    m.setValue("name", "Bob");
    m.reset();
    expect(m.getValues().name).toBe("Alice"); // back to initialValue
  });

  it("resets step index to 0", () => {
    const m = makeManager();
    m.goNext();
    m.goNext();
    m.reset();
    expect(m.getState().currentStepIndex).toBe(0);
  });

  it("resets dirty state", () => {
    const m = makeManager();
    m.setValue("name", "Bob");
    m.reset();
    expect(m.getState().isDirty).toBe(false);
  });
});

// ─── Validation state ─────────────────────────────────────────────────────────

describe("StateManager — validation", () => {
  it("marks field as touched", () => {
    const m = makeManager();
    m.touchField("name");
    expect(m.getState().validation.name?.touched).toBe(true);
  });

  it("sets field validation state", () => {
    const m = makeManager();
    m.setFieldValidation("name", { valid: false, error: "Required" });
    expect(m.getState().validation.name?.valid).toBe(false);
    expect(m.getState().validation.name?.error).toBe("Required");
  });

  it("updates isValid to false when a field is invalid", () => {
    const m = makeManager();
    m.setFieldValidation("name", { valid: false, error: "Required" });
    expect(m.getState().isValid).toBe(false);
  });
});
