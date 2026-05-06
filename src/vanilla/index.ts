/**
 * FormFlow Vanilla JS Adapter
 * Framework-agnostic DOM-based usage for non-React environments.
 *
 * @example
 * import { createFormFlow } from "formflow/vanilla";
 *
 * const form = createFormFlow({
 *   target: "#app",
 *   steps: [...],
 *   onSubmit: async (values) => { console.log(values); },
 * });
 *
 * // Later:
 * form.destroy();
 */

import { FormEngine } from "../core/FormEngine.js";
import { resolveTheme, themeToCSSVariables } from "../themes/index.js";
import type {
  VanillaFormFlowOptions,
  VanillaFormFlowInstance,
  FormFlowState,
  FormStep,
  FormField,
  FieldValue,
  FormFlowTheme,
} from "../types/index.js";

// ─── DOM Utilities ────────────────────────────────────────────────────────────

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | boolean | undefined> = {},
  ...children: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (val === undefined || val === false) continue;
    if (key === "style" || key === "textContent") {
      if (key === "textContent") element.textContent = String(val);
      else (element as HTMLElement).setAttribute("style", String(val));
    } else if (typeof val === "boolean" && val) {
      element.setAttribute(key, "");
    } else if (typeof val === "string") {
      element.setAttribute(key, val);
    }
  }
  for (const child of children) {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  }
  return element;
}

function injectStyles(theme: FormFlowTheme): void {
  const styleId = "formflow-styles";
  if (document.getElementById(styleId)) return;

  const cssVars = themeToCSSVariables(theme, ".ff-root");
  const baseCSS = `
    ${cssVars}

    .ff-root * { box-sizing: border-box; }
    .ff-root { font-family: var(--ff-font-family); font-size: var(--ff-font-size-base); color: var(--ff-color-text); background: var(--ff-color-background); }
    .ff-form { background: var(--ff-color-surface); border-radius: var(--ff-radius-lg); padding: var(--ff-spacing-xl); border: 1px solid var(--ff-color-border); }
    .ff-field { margin-bottom: var(--ff-spacing-md); }
    .ff-label { display: block; font-size: var(--ff-font-size-sm); font-weight: var(--ff-font-weight-medium); margin-bottom: var(--ff-spacing-xs); }
    .ff-input { width: 100%; padding: var(--ff-spacing-sm) var(--ff-spacing-md); font-size: var(--ff-font-size-base); font-family: var(--ff-font-family); border: 1.5px solid var(--ff-color-border); border-radius: var(--ff-radius-md); outline: none; background: var(--ff-color-background); color: var(--ff-color-text); transition: border-color var(--ff-transition-fast), box-shadow var(--ff-transition-fast); }
    .ff-input:focus { border-color: var(--ff-color-border-focus); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ff-color-border-focus) 20%, transparent); }
    .ff-input.ff-error { border-color: var(--ff-color-error); }
    .ff-error-msg { color: var(--ff-color-error); font-size: var(--ff-font-size-sm); margin-top: var(--ff-spacing-xs); }
    .ff-desc { color: var(--ff-color-text-muted); font-size: var(--ff-font-size-sm); margin-top: var(--ff-spacing-xs); }
    .ff-progress { margin-bottom: var(--ff-spacing-lg); }
    .ff-progress-track { height: 6px; background: var(--ff-color-progress-track); border-radius: var(--ff-radius-full); overflow: hidden; }
    .ff-progress-fill { height: 100%; background: var(--ff-color-progress-fill); border-radius: var(--ff-radius-full); transition: width var(--ff-transition-normal); }
    .ff-progress-text { font-size: var(--ff-font-size-sm); color: var(--ff-color-text-muted); text-align: right; margin-top: var(--ff-spacing-xs); }
    .ff-nav { display: flex; justify-content: flex-end; align-items: center; margin-top: var(--ff-spacing-xl); gap: var(--ff-spacing-md); }
    .ff-nav.ff-has-back { justify-content: space-between; }
    .ff-btn-primary { padding: var(--ff-spacing-sm) var(--ff-spacing-lg); background: var(--ff-color-primary); color: var(--ff-color-primary-foreground); border: none; border-radius: var(--ff-radius-md); font-size: var(--ff-font-size-base); font-weight: var(--ff-font-weight-medium); cursor: pointer; transition: background-color var(--ff-transition-fast); }
    .ff-btn-primary:hover:not(:disabled) { background: var(--ff-color-primary-hover); }
    .ff-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .ff-btn-secondary { padding: var(--ff-spacing-sm) var(--ff-spacing-lg); background: var(--ff-color-secondary); color: var(--ff-color-secondary-foreground); border: 1.5px solid var(--ff-color-border); border-radius: var(--ff-radius-md); font-size: var(--ff-font-size-base); font-weight: var(--ff-font-weight-medium); cursor: pointer; transition: background-color var(--ff-transition-fast); }
    .ff-btn-secondary:hover:not(:disabled) { background: var(--ff-color-secondary-hover); }
    .ff-step-title { font-size: var(--ff-font-size-lg); font-weight: var(--ff-font-weight-bold); margin: 0 0 var(--ff-spacing-lg); color: var(--ff-color-text); }
    .ff-step-desc { color: var(--ff-color-text-muted); margin-bottom: var(--ff-spacing-lg); }
    .ff-success { padding: var(--ff-spacing-lg); background: var(--ff-color-success-background); border-radius: var(--ff-radius-md); color: var(--ff-color-success); text-align: center; font-weight: var(--ff-font-weight-medium); }
    .ff-submit-error { padding: var(--ff-spacing-md); background: var(--ff-color-error-background); border-radius: var(--ff-radius-md); color: var(--ff-color-error); margin-bottom: var(--ff-spacing-md); font-size: var(--ff-font-size-sm); }
    @keyframes ff-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .ff-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: ff-spin 0.8s linear infinite; vertical-align: middle; margin-right: 6px; }
  `;

  const style = el("style", { id: styleId });
  style.textContent = baseCSS;
  document.head.appendChild(style);
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

function renderField(
  field: FormField,
  value: FieldValue,
  hasError: boolean,
  errorMessage: string | null,
  onChange: (value: FieldValue) => void,
  onBlur: () => void,
): HTMLElement {
  const wrapper = el("div", { class: "ff-field" });

  // Label
  if (field.type !== "checkbox" && field.type !== "hidden") {
    const label = el("label", { for: `ff-${field.id}`, class: "ff-label" });
    label.textContent = field.label;
    const isRequired = field.validators?.some((v) => v.key === "required");
    if (isRequired) {
      const req = el("span", {
        "aria-hidden": "true",
        style: "color: var(--ff-color-error); margin-left: 2px;",
      });
      req.textContent = " *";
      label.appendChild(req);
    }
    wrapper.appendChild(label);
  }

  // Description
  if (field.description) {
    const desc = el("p", { class: "ff-desc" });
    desc.textContent = field.description;
    wrapper.appendChild(desc);
  }

  // Input
  let input: HTMLElement;

  if (field.type === "textarea") {
    const ta = el("textarea", {
      id: `ff-${field.id}`,
      name: field.id,
      class: `ff-input${hasError ? " ff-error" : ""}`,
      placeholder: field.placeholder ?? "",
      rows: "4",
    }) as HTMLTextAreaElement;
    ta.value = String(value ?? "");
    ta.addEventListener("input", () => onChange(ta.value));
    ta.addEventListener("blur", onBlur);
    input = ta;
  } else if (field.type === "select") {
    const sel = el("select", {
      id: `ff-${field.id}`,
      name: field.id,
      class: `ff-input${hasError ? " ff-error" : ""}`,
    }) as HTMLSelectElement;
    if (field.placeholder) {
      const ph = el("option", {
        value: "",
        disabled: true,
        selected: true,
      }) as HTMLOptionElement;
      ph.textContent = field.placeholder;
      sel.appendChild(ph);
    }
    field.options?.forEach((opt) => {
      const o = el("option", { value: String(opt.value) }) as HTMLOptionElement;
      o.textContent = opt.label;
      if (opt.disabled) o.disabled = true;
      if (value === opt.value) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => onChange(sel.value));
    sel.addEventListener("blur", onBlur);
    input = sel;
  } else if (field.type === "checkbox") {
    const label = el("label", {
      class: "ff-label",
      style: "display: flex; align-items: center; gap: 8px; cursor: pointer;",
    });
    const cb = el("input", {
      type: "checkbox",
      id: `ff-${field.id}`,
      name: field.id,
    }) as HTMLInputElement;
    cb.checked = Boolean(value);
    cb.addEventListener("change", () => onChange(cb.checked));
    cb.addEventListener("blur", onBlur);
    label.appendChild(cb);
    label.appendChild(document.createTextNode(field.label));
    wrapper.appendChild(label);
    input = wrapper; // already appended
  } else {
    const inp = el("input", {
      type: field.type,
      id: `ff-${field.id}`,
      name: field.id,
      class: `ff-input${hasError ? " ff-error" : ""}`,
      placeholder: field.placeholder ?? "",
    }) as HTMLInputElement;
    if (field.type !== "file") {
      inp.value = String(value ?? "");
    }
    inp.addEventListener("input", () => {
      onChange(
        field.type === "number" && inp.value !== ""
          ? Number(inp.value)
          : inp.value,
      );
    });
    inp.addEventListener("blur", onBlur);
    input = inp;
  }

  if (input !== wrapper) {
    wrapper.appendChild(input);
  }

  // Error message
  if (hasError && errorMessage) {
    const err = el("p", { class: "ff-error-msg", role: "alert" });
    err.textContent = errorMessage;
    wrapper.appendChild(err);
  }

  return wrapper;
}

function renderStep(
  step: FormStep,
  state: FormFlowState,
  onChange: (fieldId: string, value: FieldValue) => void,
  onBlur: (fieldId: string) => void,
): HTMLElement {
  const section = el("section");

  if (step.title) {
    const h = el("h2", { class: "ff-step-title" });
    h.textContent = step.title;
    section.appendChild(h);
  }

  if (step.description) {
    const d = el("p", { class: "ff-step-desc" });
    d.textContent = step.description;
    section.appendChild(d);
  }

  for (const field of step.fields) {
    // Evaluate conditional visibility
    if (field.condition) {
      try {
        if (!field.condition.fn(state.values)) continue;
      } catch {
        // treat as visible
      }
    }

    const v = state.validation[field.id];
    const hasError = !!(v && !v.valid && v.touched);
    const errorMsg = hasError ? (v?.error ?? null) : null;

    const fieldEl = renderField(
      field,
      state.values[field.id] as FieldValue,
      hasError,
      errorMsg,
      (value) => onChange(field.id, value),
      () => onBlur(field.id),
    );

    section.appendChild(fieldEl);
  }

  return section;
}

// ─── createFormFlow ───────────────────────────────────────────────────────────

/**
 * createFormFlow — vanilla JS entry point.
 * Mounts a FormFlow instance into a DOM element.
 *
 * @returns A controller object with destroy(), getState(), setValue(), etc.
 */
export function createFormFlow(
  options: VanillaFormFlowOptions,
): VanillaFormFlowInstance {
  const { target, theme: themeProp = "light", ...config } = options;

  // Resolve mount target
  const container =
    typeof target === "string"
      ? (document.querySelector(target) as HTMLElement | null)
      : target;

  if (!container) {
    throw new Error(
      `[FormFlow] Target "${String(target)}" not found in the document.`,
    );
  }

  const theme = resolveTheme(themeProp);
  injectStyles(theme);

  // Create the engine
  const engine = new FormEngine(config);

  // Root element
  const root = el("div", { class: "ff-root" });
  container.appendChild(root);

  let unmounted = false;

  function render(state: FormFlowState): void {
    if (unmounted) return;

    root.innerHTML = "";

    const currentStep = engine.getCurrentStep();
    const currentIndex = engine.getCurrentStepIndex();
    const total = engine.getTotalSteps();
    const progress = engine.getProgress();
    const isLastStep = engine.isLastStep();
    const canGoBack = engine.canGoBack();

    if (!currentStep) return;

    // Progress bar
    const progressContainer = el("div", { class: "ff-progress" });
    const track = el("div", { class: "ff-progress-track" });
    const fill = el("div", { class: "ff-progress-fill" });
    fill.style.width = `${progress}%`;
    track.appendChild(fill);
    const progressText = el("p", { class: "ff-progress-text" });
    progressText.textContent = `Step ${currentIndex + 1} of ${total}`;
    progressContainer.appendChild(track);
    progressContainer.appendChild(progressText);
    root.appendChild(progressContainer);

    // Form
    const form = el("div", { class: "ff-form" });

    // Success state
    if (state.isSubmitted) {
      const success = el("div", { class: "ff-success", role: "alert" });
      success.textContent = "✓ Form submitted successfully!";
      form.appendChild(success);
      root.appendChild(form);
      return;
    }

    // Submit error
    if (state.submitError) {
      const errEl = el("div", { class: "ff-submit-error", role: "alert" });
      errEl.textContent = state.submitError;
      form.appendChild(errEl);
    }

    // Current step
    const stepEl = renderStep(
      currentStep,
      state,
      (fieldId, value) => engine.setValue(fieldId, value),
      (fieldId) => {
        // Touch and validate
        engine.touchField(fieldId);
      },
    );
    form.appendChild(stepEl);

    // Navigation
    const nav = el("div", {
      class: `ff-nav${canGoBack ? " ff-has-back" : ""}`,
    });

    if (canGoBack) {
      const backBtn = el("button", {
        type: "button",
        class: "ff-btn-secondary",
      });
      backBtn.textContent = `← ${config.backLabel ?? "Back"}`;
      backBtn.addEventListener("click", () => engine.goBack());
      nav.appendChild(backBtn);
    }

    const nextBtn = el("button", {
      type: "button",
      class: "ff-btn-primary",
    });

    if (state.isSubmitting) {
      const spinner = el("span", {
        class: "ff-spinner",
        "aria-hidden": "true",
      });
      nextBtn.appendChild(spinner);
      nextBtn.appendChild(document.createTextNode("Submitting…"));
      nextBtn.setAttribute("disabled", "");
    } else {
      nextBtn.textContent = isLastStep
        ? (config.submitLabel ?? "Submit")
        : `${config.nextLabel ?? "Next"} →`;
    }

    nextBtn.addEventListener("click", () => {
      if (isLastStep) {
        void engine.submit();
      } else {
        void engine.goNext();
      }
    });

    nav.appendChild(nextBtn);
    form.appendChild(nav);
    root.appendChild(form);
  }

  // Initial render + subscribe
  render(engine.getState());
  const unsubscribe = engine.subscribe((state) => render(state));

  // ─── Public instance ────────────────────────────────────────────────────────

  return {
    destroy() {
      unmounted = true;
      unsubscribe();
      root.remove();
    },

    getState(): FormFlowState {
      return engine.getState();
    },

    setValue(fieldId: string, value: FieldValue): void {
      engine.setValue(fieldId, value);
    },

    async goNext(): Promise<void> {
      await engine.goNext();
    },

    goBack(): void {
      engine.goBack();
    },

    goToStep(index: number): void {
      engine.goToStep(index);
    },

    reset(): void {
      engine.reset();
    },

    subscribe(listener: (state: FormFlowState) => void): () => void {
      return engine.subscribe(listener);
    },
  };
}

export { createFormFlow as default };
