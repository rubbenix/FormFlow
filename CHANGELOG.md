# Changelog

All notable changes to FormFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
