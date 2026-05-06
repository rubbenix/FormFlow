# FormFlow

**Build smarter forms in minutes.**

[![npm version](https://img.shields.io/npm/v/formflow.svg)](https://www.npmjs.com/package/formflow)
[![CI](https://github.com/formflow-js/formflow/actions/workflows/ci.yml/badge.svg)](https://github.com/formflow-js/formflow/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/formflow)](https://bundlephobia.com/package/formflow)

FormFlow is a production-ready, TypeScript-first multi-step forms library for modern web applications. It ships with a powerful React API, a framework-agnostic vanilla JS adapter, smart validation, conditional logic, progress tracking, state persistence, and full accessibility support — all in a tiny, tree-shakeable package.

---

## Features

- **Multi-step engine** — linear and conditional step flows with full history
- **Smart validation** — built-in validators plus async custom validation
- **Conditional fields & steps** — show/hide anything based on form state
- **Progress tracking** — animated progress bar with step labels
- **State persistence** — optional localStorage save/restore with TTL
- **Async submit** — loading states, error handling, success feedback
- **Themes** — built-in light/dark, custom theme tokens, CSS variable output
- **Accessibility** — ARIA labels, keyboard navigation, focus management, live regions
- **React first** — components + hooks with zero boilerplate
- **Vanilla JS** — DOM adapter for non-React environments
- **TypeScript** — strict typings for every API surface
- **Tree-shakeable** — import only what you use

---

## Installation

```bash
npm install formflow
# or
pnpm add formflow
# or
yarn add formflow
```

React is a peer dependency (optional — only needed for React components):

```bash
npm install react react-dom
```

---

## Quick Start

### React

```tsx
import { FormFlow } from "formflow";
import { required, email } from "formflow/validators";

const steps = [
  {
    id: "contact",
    title: "Contact Info",
    fields: [
      {
        id: "name",
        type: "text",
        label: "Full Name",
        validators: [required()],
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        validators: [required(), email()],
      },
    ],
  },
  {
    id: "message",
    title: "Your Message",
    fields: [
      {
        id: "body",
        type: "textarea",
        label: "Message",
        validators: [required()],
      },
    ],
  },
];

export function ContactForm() {
  return (
    <FormFlow
      steps={steps}
      onSubmit={async (values) => {
        await fetch("/api/contact", {
          method: "POST",
          body: JSON.stringify(values),
        });
      }}
    />
  );
}
```

### Vanilla JavaScript

```js
import { createFormFlow } from "formflow/vanilla";
import { required, email } from "formflow/validators";

const form = createFormFlow({
  target: "#app",
  steps: [
    {
      id: "contact",
      title: "Contact Info",
      fields: [
        { id: "name", type: "text", label: "Name", validators: [required()] },
        { id: "email", type: "email", label: "Email", validators: [required(), email()] },
      ],
    },
  ],
  onSubmit: async (values) => {
    console.log("Submitted:", values);
  },
});

// Later, clean up
form.destroy();
```

---

## React API Reference

### `<FormFlow />`

The top-level component. Renders the complete multi-step form UI.

```tsx
<FormFlow
  steps={steps}                // FormStepConfig[] — required
  onSubmit={handleSubmit}      // async (values, context) => void — required
  initialValues={{ name: "" }} // pre-populate fields
  theme="light"                // "light" | "dark" | custom FormFlowTheme
  showProgress={true}          // show progress bar (default: true)
  allowStepJump={false}        // allow clicking steps in progress bar
  validateOnChange={false}     // validate on every keystroke
  persistence={{               // localStorage persistence
    enabled: true,
    includeStepIndex: true,
    ttl: 1000 * 60 * 30,       // 30 minutes
  }}
  nextLabel="Next"
  backLabel="Back"
  submitLabel="Submit"
  onChange={(values, state) => console.log(values)}
  onStepChange={(step, prev, dir) => console.log(step.title)}
  classNames={{                // CSS class name overrides
    root: "my-form",
    nextButton: "my-btn",
  }}
/>
```

### Hooks

#### `useFormFlow(config)`

The primary hook. Creates and manages a FormEngine. Use this when you want to build a fully custom form UI.

```tsx
import { useFormFlow } from "formflow";

function MyCustomForm() {
  const form = useFormFlow({
    steps,
    onSubmit: handleSubmit,
  });

  const {
    state,           // full FormFlowState
    currentStep,     // active FormStep
    visibleSteps,    // all visible steps
    currentStepIndex,
    totalSteps,
    progress,        // 0–100
    canGoBack,
    canGoForward,
    isLastStep,
    goNext,          // async — validates before advancing
    goBack,
    goToStep,
    setValue,
    setValues,
    touchField,
    validateCurrentStep,
    validateAll,
    submit,
    reset,
  } = form;

  return <div>...</div>;
}
```

#### `useFormStep()`

Access state scoped to the current step. Must be inside a `<FormFlow />` tree or a `FormFlowContext.Provider`.

```tsx
import { useFormStep } from "formflow";

function StepSummary() {
  const { step, stepValues, isStepValid } = useFormStep();
  return <p>{step.title} — {isStepValid ? "✓" : "has errors"}</p>;
}
```

#### `useFormField(fieldId)`

Bind a single field by ID. Returns everything needed to wire up a custom input.

```tsx
import { useFormField } from "formflow";

function CustomInput({ fieldId }: { fieldId: string }) {
  const { value, onChange, onBlur, hasError, error } = useFormField(fieldId);
  return (
    <div>
      <input
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        style={{ borderColor: hasError ? "red" : undefined }}
      />
      {hasError && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
```

### Components

| Component | Description |
|---|---|
| `<FormFlow />` | Full form with built-in UI |
| `<FormStep />` | Renders all fields for one step |
| `<FormField />` | Renders a single field |
| `<ProgressBar />` | Progress indicator |
| `<NextButton />` | Next / Submit button |
| `<BackButton />` | Back navigation button |

---

## Validators

Import validators from `formflow/validators` (or directly from `formflow`):

```ts
import { required, email, minLength, maxLength, number, pattern, url, matches, custom, compose } from "formflow/validators";
```

| Validator | Description |
|---|---|
| `required(message?)` | Field must have a non-empty value |
| `email(message?)` | Must be a valid email address |
| `minLength(n, message?)` | String must be at least `n` characters |
| `maxLength(n, message?)` | String must be at most `n` characters |
| `number(opts?, message?)` | Must be a valid number; optional `min`, `max`, `integer` |
| `pattern(regex, message?)` | Must match the given RegExp |
| `url(protocols?, message?)` | Must be a valid URL |
| `matches(fieldId, message?)` | Must equal the value of another field |
| `custom(fn, key?)` | Wrap any sync or async validation function |
| `compose(...validators)` | Run multiple validators in sequence |

### Custom async validator example

```ts
const usernameAvailable = custom(async (value) => {
  const taken = await api.checkUsername(String(value));
  return taken
    ? { valid: false, message: "Username is already taken" }
    : { valid: true, message: "" };
}, "usernameAvailable");
```

---

## Conditional Logic

### Conditional fields

Fields are hidden/shown based on current form values:

```ts
const fields = [
  {
    id: "accountType",
    type: "select",
    label: "Account Type",
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
      fn: (values) => values.accountType === "business",
      watchFields: ["accountType"], // optional — for optimization
    },
    validators: [required()],
  },
];
```

### Conditional steps

Entire steps can be skipped based on form values:

```ts
const steps = [
  { id: "basics", title: "Basics", fields: [...] },
  {
    id: "business-details",
    title: "Business Details",
    condition: { fn: (values) => values.accountType === "business" },
    fields: [...],
  },
  { id: "review", title: "Review", fields: [...] },
];
```

---

## Themes

### Built-in themes

```tsx
<FormFlow theme="light" ... />
<FormFlow theme="dark" ... />
```

### Custom theme

```ts
import { createTheme } from "formflow";

const myTheme = createTheme("brand", {
  colors: {
    primary: "#7C3AED",
    primaryHover: "#6D28D9",
    borderFocus: "#7C3AED",
    progressFill: "#7C3AED",
  },
});

<FormFlow theme={myTheme} ... />
```

### CSS Variables

Export your theme as CSS custom properties:

```ts
import { themeToCSSVariables, lightTheme } from "formflow";

const css = themeToCSSVariables(lightTheme, ".my-form");
// Inject into a <style> tag or stylesheet
```

---

## State Persistence

Automatically save and restore form progress to localStorage:

```tsx
<FormFlow
  id="signup"
  steps={steps}
  onSubmit={handleSubmit}
  persistence={{
    enabled: true,
    key: "my-signup-form",      // custom localStorage key
    includeStepIndex: true,     // restore the step the user was on
    excludeFields: ["password"],// don't persist sensitive fields
    ttl: 1000 * 60 * 60,        // expire after 1 hour
  }}
/>
```

---

## Step Lifecycle Hooks

```ts
const steps = [
  {
    id: "payment",
    title: "Payment",
    fields: [...],

    // Called when the user arrives at this step
    onEnter: (stepValues, allValues) => {
      analytics.track("payment_step_viewed");
    },

    // Called when the user leaves this step
    onLeave: (stepValues, allValues) => {
      analytics.track("payment_step_completed");
    },

    // Return false to block forward navigation
    onBeforeNext: async (stepValues, allValues) => {
      const valid = await verifyPaymentMethod(stepValues.cardToken);
      return valid;
    },
  },
];
```

---

## Vanilla JS Example

```js
import { createFormFlow } from "formflow/vanilla";
import { required, minLength } from "formflow/validators";

const form = createFormFlow({
  target: "#registration-form",
  theme: "light",
  steps: [
    {
      id: "step1",
      title: "Personal Info",
      fields: [
        { id: "name",  type: "text",  label: "Name",  validators: [required()] },
        { id: "email", type: "email", label: "Email", validators: [required()] },
      ],
    },
    {
      id: "step2",
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
  ],
  onSubmit: async (values) => {
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Registration failed");
  },
});

// Programmatic control
form.setValue("name", "Alice");
form.subscribe((state) => console.log(state.currentStepIndex));

// Clean up when done
form.destroy();
```

---

## TypeScript

FormFlow is built TypeScript-first with strict typings:

```ts
import type {
  FormFlowConfig,
  FormStepConfig,
  FormField,
  Validator,
  FormFlowState,
  FormValues,
  FormFlowTheme,
} from "formflow";

const config: FormFlowConfig = {
  steps: [...],
  onSubmit: async (values: FormValues) => { ... },
};
```

---

## Custom CSS Class Names

Override any part of the UI with your own CSS classes:

```tsx
<FormFlow
  classNames={{
    root: "my-form",
    progressBar: "my-progress",
    progressFill: "my-progress-fill",
    step: "my-step",
    stepHeader: "my-step-header",
    fieldsContainer: "my-fields",
    field: "my-field",
    fieldLabel: "my-label",
    fieldInput: "my-input",
    fieldError: "my-error",
    navigation: "my-nav",
    backButton: "my-back-btn",
    nextButton: "my-next-btn",
  }}
/>
```

---

## Accessibility

FormFlow is built with accessibility as a first-class concern:

- All inputs have associated `<label>` elements
- Error messages use `role="alert"` and `aria-describedby`
- Progress bar uses `role="progressbar"` with `aria-valuenow`
- Step sections use `aria-labelledby` for screen readers
- Submission states announce via `aria-live` regions
- All interactive elements are keyboard-navigable
- Focus is managed when steps change

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

```bash
# Clone the repo
git clone https://github.com/formflow-js/formflow.git
cd formflow

# Install dependencies
npm install

# Run tests in watch mode
npm run test:watch

# Build the library
npm run build

# Run linting
npm run lint
```

**Submitting a PR:**

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to your fork and open a pull request against `main`
5. CI must pass: lint, type check, tests, build

---

## Roadmap

- [ ] React Native support
- [ ] Svelte adapter
- [ ] Vue adapter
- [ ] Form schema import/export (JSON)
- [ ] Field-level autosave
- [ ] Animation presets
- [ ] Storybook component playground
- [ ] FormFlow Studio (visual form builder)

---

## License

MIT © [FormFlow Contributors](LICENSE)

---

<p align="center">
  Made with care for developers who care about form UX.
  <br />
  <a href="https://github.com/formflow-js/formflow">GitHub</a> ·
  <a href="https://www.npmjs.com/package/formflow">npm</a>
</p>
