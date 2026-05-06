/**
 * FormEngine Tests
 * Tests for step navigation with validation, submission, and lifecycle hooks.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { FormEngine } from "../src/core/FormEngine.js";
import { required, email, minLength } from "../src/validators/index.js";
import type { FormFlowConfig, FormStep } from "../src/types/index.js";

const steps: FormStep[] = [
  {
    id: "personal",
    title: "Personal Info",
    fields: [
      {
        id: "name",
        type: "text",
        label: "Name",
        validators: [required()],
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        validators: [required(), email()],
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    fields: [
      {
        id: "password",
        type: "password",
        label: "Password",
        validators: [required(), minLength(8)],
      },
    ],
  },
  {
    id: "confirm",
    title: "Confirmation",
    fields: [
      {
        id: "agree",
        type: "checkbox",
        label: "I agree",
        validators: [
          {
            key: "mustAgree",
            validate: (val) =>
              val === true
                ? { valid: true, message: "" }
                : { valid: false, message: "You must agree to continue" },
          },
        ],
      },
    ],
  },
];

function makeEngine(overrides: Partial<FormFlowConfig> = {}): FormEngine {
  return new FormEngine({
    steps,
    onSubmit: vi.fn(),
    ...overrides,
  });
}

// ─── Navigation with validation ───────────────────────────────────────────────

describe("FormEngine — goNext with validation", () => {
  it("blocks navigation when required field is empty", async () => {
    const engine = makeEngine();
    await engine.goNext();
    expect(engine.getCurrentStepIndex()).toBe(0); // still on step 0
  });

  it("allows navigation when required fields are valid", async () => {
    const engine = makeEngine();
    engine.setValue("name", "Alice");
    engine.setValue("email", "alice@example.com");
    await engine.goNext();
    expect(engine.getCurrentStepIndex()).toBe(1);
  });

  it("sets validation errors on touched fields after failed navigation", async () => {
    const engine = makeEngine();
    await engine.goNext(); // triggers validation
    const state = engine.getState();
    expect(state.validation.name?.valid).toBe(false);
    expect(state.validation.email?.valid).toBe(false);
  });

  it("goes through all steps sequentially", async () => {
    const engine = makeEngine();
    engine.setValue("name", "Alice");
    engine.setValue("email", "alice@example.com");
    await engine.goNext();
    expect(engine.getCurrentStepIndex()).toBe(1);

    engine.setValue("password", "supersecret");
    await engine.goNext();
    expect(engine.getCurrentStepIndex()).toBe(2);
  });
});

// ─── Back navigation ─────────────────────────────────────────────────────────

describe("FormEngine — goBack", () => {
  it("cannot go back from the first step", () => {
    const engine = makeEngine();
    engine.goBack();
    expect(engine.getCurrentStepIndex()).toBe(0);
  });

  it("goes back one step", async () => {
    const engine = makeEngine();
    engine.setValue("name", "Alice");
    engine.setValue("email", "alice@example.com");
    await engine.goNext();
    engine.goBack();
    expect(engine.getCurrentStepIndex()).toBe(0);
  });
});

// ─── onBeforeNext hook ────────────────────────────────────────────────────────

describe("FormEngine — onBeforeNext hook", () => {
  it("blocks navigation when onBeforeNext returns false", async () => {
    const stepsWithHook: FormStep[] = [
      {
        ...steps[0]!,
        onBeforeNext: async () => false,
      },
      steps[1]!,
    ];
    const engine = new FormEngine({
      steps: stepsWithHook,
      onSubmit: vi.fn(),
    });
    engine.setValue("name", "Alice");
    engine.setValue("email", "alice@example.com");
    await engine.goNext();
    expect(engine.getCurrentStepIndex()).toBe(0); // blocked
  });

  it("allows navigation when onBeforeNext returns true", async () => {
    const stepsWithHook: FormStep[] = [
      {
        ...steps[0]!,
        onBeforeNext: async () => true,
      },
      steps[1]!,
    ];
    const engine = new FormEngine({
      steps: stepsWithHook,
      onSubmit: vi.fn(),
    });
    engine.setValue("name", "Alice");
    engine.setValue("email", "alice@example.com");
    await engine.goNext();
    expect(engine.getCurrentStepIndex()).toBe(1);
  });
});

// ─── Step lifecycle hooks ─────────────────────────────────────────────────────

describe("FormEngine — lifecycle hooks", () => {
  it("calls onLeave when leaving a step", async () => {
    const onLeave = vi.fn();
    const stepsWithHooks: FormStep[] = [
      { ...steps[0]!, onLeave },
      steps[1]!,
    ];
    const engine = new FormEngine({
      steps: stepsWithHooks,
      onSubmit: vi.fn(),
    });
    engine.setValue("name", "Alice");
    engine.setValue("email", "alice@example.com");
    await engine.goNext();
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("calls onEnter when arriving at a step", async () => {
    const onEnter = vi.fn();
    const stepsWithHooks: FormStep[] = [
      steps[0]!,
      { ...steps[1]!, onEnter },
    ];
    const engine = new FormEngine({
      steps: stepsWithHooks,
      onSubmit: vi.fn(),
    });
    engine.setValue("name", "Alice");
    engine.setValue("email", "alice@example.com");
    await engine.goNext();
    expect(onEnter).toHaveBeenCalledTimes(1);
  });
});

// ─── Submission ───────────────────────────────────────────────────────────────

describe("FormEngine — submit", () => {
  it("calls onSubmit with form values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const engine = new FormEngine({ steps, onSubmit });

    engine.setValue("name", "Alice");
    engine.setValue("email", "alice@example.com");
    engine.setValue("password", "supersecret");
    engine.setValue("agree", true);

    await engine.submit();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Alice",
        email: "alice@example.com",
        password: "supersecret",
        agree: true,
      }),
      expect.any(Object),
    );
  });

  it("does not call onSubmit when validation fails", async () => {
    const onSubmit = vi.fn();
    const engine = new FormEngine({ steps, onSubmit });
    // name and email not set — will fail required validation
    await engine.submit();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sets isSubmitted after successful submission", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const engine = new FormEngine({ steps, onSubmit });

    engine.setValue("name", "Alice");
    engine.setValue("email", "alice@example.com");
    engine.setValue("password", "supersecret");
    engine.setValue("agree", true);

    await engine.submit();
    expect(engine.getState().isSubmitted).toBe(true);
  });

  it("sets submitError when onSubmit throws", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Server error"));
    const engine = new FormEngine({ steps, onSubmit });

    engine.setValue("name", "Alice");
    engine.setValue("email", "alice@example.com");
    engine.setValue("password", "supersecret");
    engine.setValue("agree", true);

    await engine.submit();
    const state = engine.getState();
    expect(state.isSubmitted).toBe(false);
    expect(state.submitError).toBe("Server error");
  });
});

// ─── onChange callback ────────────────────────────────────────────────────────

describe("FormEngine — onChange callback", () => {
  it("fires onChange when a value is updated", () => {
    const onChange = vi.fn();
    const engine = makeEngine({ onChange });
    engine.setValue("name", "Test");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Test" }),
      expect.any(Object),
    );
  });
});

// ─── Reset ────────────────────────────────────────────────────────────────────

describe("FormEngine — reset", () => {
  it("resets form after submission", async () => {
    const onSubmit = vi.fn().mockImplementation((_values, ctx) => {
      ctx.reset();
    });
    const engine = new FormEngine({ steps, onSubmit });

    engine.setValue("name", "Alice");
    engine.setValue("email", "alice@example.com");
    engine.setValue("password", "supersecret");
    engine.setValue("agree", true);

    await engine.submit();
    expect(engine.getCurrentStepIndex()).toBe(0);
    expect(engine.getValues().name).toBe("");
  });
});
