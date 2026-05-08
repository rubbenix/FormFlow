# Changelog

All notable changes to FormFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New validators: `phone`, `postalCode` (US/ES/UK/FR/DE/JP/BR/MX/…), `oneOf`,
  `between`, `alphanumeric`, `strongPassword`.
- i18n support: `setLocale()` and `messages` registry let consumers override
  default validator messages in any language.
- Tests for every new validator.

### Changed

- CI now uses **pnpm** (matches the project's `pnpm-lock.yaml`) for fast,
  reproducible installs across Node 18 / 20 / 22.
- Hardened `useFormFlow` and `useFormStep`: removed non-null assertions in
  favor of explicit guards.
- Build job now verifies all sub-export entry points (`react`, `validators`,
  `vanilla`).

### Fixed

- Eliminated all ESLint warnings (non-null assertions) in production code.
- `tsconfig` already targeting ES2018+ so `flatMap` and modern lib calls work
  across CI Node versions.

## [1.0.0] - 2024-01-01

### Added

- Initial release of FormFlow
- Multi-step form engine with full step navigation (next, back, jump)
- Built-in validators: `required`, `email`, `minLength`, `maxLength`, `number`, `pattern`, `url`, `custom`
- Conditional field logic based on form state
- Progress tracking with `ProgressBar` component
- State persistence via `localStorage`
- Async submit handlers with loading and error states
- Theme support: `light`, `dark`, and custom themes
- Full accessibility: ARIA labels, keyboard navigation, focus management
- React components: `FormFlow`, `FormStep`, `FormField`, `ProgressBar`, `NextButton`, `BackButton`
- React hooks: `useFormFlow`, `useFormStep`, `useFormField`
- Vanilla JS adapter: `createFormFlow`
- TypeScript-first with complete type definitions
- ESM and CommonJS output
- Tree-shakeable architecture
- Zero runtime dependencies

### Developer Experience

- Simple API — minimal boilerplate
- Full TypeScript inference on config, steps, and field values
- Pluggable validation system
- Composable hooks for custom UIs
- Comprehensive test suite with Vitest
- GitHub Actions CI/CD pipeline
