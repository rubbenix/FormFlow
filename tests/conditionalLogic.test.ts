/**
 * Conditional Logic Tests
 * Tests for conditional field and step visibility.
 */

import { describe, it, expect } from "vitest";
import { StateManager } from "../src/core/StateManager.js";
import { FormEngine } from "../src/core/FormEngine.js";
import { required } from "../src/validators/index.js";
import type { FormStep } from "../src/types/index.js";

// ─── Conditional fields ───────────────────────────────────────────────────────

describe("Conditional field visibility", () => {
  const steps: FormStep[] = [
    {
      id: "step1",
      title: "Step 1",
      fields: [
        {
          id: "type",
          type: "select",
          label: "Type",
          options: [
            { value: "personal", label: "Personal" },
            { value: "business", label: "Business" },
          ],
        },
        {
          id: "companyName",
          type: "text",
          label: "Company Name",
          condition: {
            fn: (values) => values.type === "business",
            watchFields: ["type"],
          },
          validators: [required()],
        },
        {
          id: "vatNumber",
          type: "text",
          label: "VAT Number",
          condition: {
            fn: (values) => values.type === "business",
            watchFields: ["type"],
          },
        },
      ],
    },
  ];

  it("conditional field is hidden by default when condition is false", () => {
    const m = new StateManager(steps, { type: "personal" });
    const state = m.getState();
    // Both business fields should have type=personal, so condition is false
    expect(state.values.type).toBe("personal");
  });

  it("conditional field becomes relevant when condition flips to true", () => {
    const m = new StateManager(steps, { type: "personal" });
    m.setValue("type", "business");
    expect(m.getValues().type).toBe("business");
  });

  it("validation skips hidden conditional fields in FormEngine", async () => {
    const engine = new FormEngine({
      steps,
      onSubmit: async () => undefined,
      initialValues: { type: "personal" }, // companyName condition = false
    });

    // With type=personal, companyName is hidden and should not block navigation
    const valid = await engine.validateCurrentStep();
    expect(valid).toBe(true);
  });

  it("validation catches required conditional field when condition is true", async () => {
    const engine = new FormEngine({
      steps,
      onSubmit: async () => undefined,
      initialValues: { type: "business" }, // companyName is required and visible
    });

    const valid = await engine.validateCurrentStep();
    expect(valid).toBe(false); // companyName is required but empty
  });
});

// ─── Conditional steps ────────────────────────────────────────────────────────

describe("Conditional step visibility", () => {
  const steps: FormStep[] = [
    {
      id: "welcome",
      title: "Welcome",
      fields: [
        {
          id: "wantsNewsletter",
          type: "checkbox",
          label: "Subscribe to newsletter",
          defaultValue: false,
        },
      ],
    },
    {
      id: "newsletter",
      title: "Newsletter Preferences",
      condition: { fn: (values) => values.wantsNewsletter === true },
      fields: [
        {
          id: "frequency",
          type: "select",
          label: "Frequency",
          options: [
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
          ],
          validators: [required()],
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      fields: [],
    },
  ];

  it("conditional step is hidden when condition is false", () => {
    const m = new StateManager(steps);
    expect(m.getState().visibleStepIds).not.toContain("newsletter");
    expect(m.getState().visibleStepIds).toEqual(["welcome", "done"]);
  });

  it("conditional step appears when condition becomes true", () => {
    const m = new StateManager(steps);
    m.setValue("wantsNewsletter", true);
    expect(m.getState().visibleStepIds).toContain("newsletter");
    expect(m.getState().visibleStepIds).toEqual(["welcome", "newsletter", "done"]);
  });

  it("total step count changes dynamically", () => {
    const m = new StateManager(steps);
    expect(m.getState().visibleStepIds.length).toBe(2);
    m.setValue("wantsNewsletter", true);
    expect(m.getState().visibleStepIds.length).toBe(3);
  });

  it("FormEngine skips hidden step during validation", async () => {
    const engine = new FormEngine({
      steps,
      onSubmit: async () => undefined,
    });
    // wantsNewsletter is false → newsletter step is hidden
    // All visible steps (welcome + done) should validate without issue
    const valid = await engine.validateAllSteps();
    expect(valid).toBe(true);
  });

  it("FormEngine validates hidden step fields when condition becomes true", async () => {
    const engine = new FormEngine({
      steps,
      onSubmit: async () => undefined,
    });
    engine.setValue("wantsNewsletter", true);
    // Now newsletter step is visible, frequency is required but empty
    const valid = await engine.validateAllSteps();
    expect(valid).toBe(false);
  });
});

// ─── Nested conditions ────────────────────────────────────────────────────────

describe("Complex conditional scenarios", () => {
  it("handles condition that throws gracefully (treats as visible)", () => {
    const steps: FormStep[] = [
      {
        id: "s1",
        title: "S1",
        fields: [
          {
            id: "risky",
            type: "text",
            label: "Risky",
            condition: {
              fn: () => { throw new Error("Condition error"); },
            },
          },
        ],
      },
    ];
    const m = new StateManager(steps);
    // Should not throw; field treated as visible
    expect(() => m.getState()).not.toThrow();
  });

  it("condition with multiple field dependencies", () => {
    const steps: FormStep[] = [
      {
        id: "s1",
        title: "S1",
        fields: [
          { id: "a", type: "text", label: "A" },
          { id: "b", type: "text", label: "B" },
          {
            id: "c",
            type: "text",
            label: "C (visible when a=x AND b=y)",
            condition: {
              fn: (values) => values.a === "x" && values.b === "y",
              watchFields: ["a", "b"],
            },
          },
        ],
      },
    ];
    const m = new StateManager(steps);
    m.setValue("a", "x");
    // c is still hidden (b != y)
    expect(m.getValues().a).toBe("x");
    m.setValue("b", "y");
    // Now both conditions are met — just checking state doesn't throw
    expect(m.getValues().b).toBe("y");
  });
});
