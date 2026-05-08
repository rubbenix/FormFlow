/**
 * FormFlow Built-in Validators
 *
 * Each factory returns a Validator object.
 * Validators are composable — pass multiple to a field's `validators` array.
 *
 * @example
 * import { required, email, minLength } from "formflow/validators";
 *
 * const field = {
 *   id: "email",
 *   type: "email",
 *   label: "Email",
 *   validators: [required(), email()],
 * };
 */

import type { Validator, FieldValue, FormValues } from "../types/index.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isEmpty(value: FieldValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function toString(value: FieldValue): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toNumber(value: FieldValue): number {
  return Number(value);
}

// ─── required ────────────────────────────────────────────────────────────────

/**
 * Ensures the field has a non-empty value.
 *
 * @param message Custom error message
 */
export function required(message = "This field is required"): Validator {
  return {
    key: "required",
    validate(value) {
      return isEmpty(value)
        ? { valid: false, message }
        : { valid: true, message: "" };
    },
  };
}

// ─── email ────────────────────────────────────────────────────────────────────

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

/**
 * Validates that the value is a valid email address.
 * Empty values pass — combine with `required()` if the field is mandatory.
 *
 * @param message Custom error message
 */
export function email(
  message = "Please enter a valid email address",
): Validator {
  return {
    key: "email",
    validate(value) {
      if (isEmpty(value)) return { valid: true, message: "" };
      return EMAIL_REGEX.test(toString(value))
        ? { valid: true, message: "" }
        : { valid: false, message };
    },
  };
}

// ─── minLength ────────────────────────────────────────────────────────────────

/**
 * Validates that a string value meets a minimum length.
 *
 * @param min Minimum number of characters
 * @param message Custom error message (receives `min` as a token)
 */
export function minLength(min: number, message?: string): Validator {
  return {
    key: `minLength:${min}`,
    validate(value) {
      if (isEmpty(value)) return { valid: true, message: "" };
      const str = toString(value);
      return str.length >= min
        ? { valid: true, message: "" }
        : {
            valid: false,
            message: message ?? `Must be at least ${min} characters`,
          };
    },
  };
}

// ─── maxLength ────────────────────────────────────────────────────────────────

/**
 * Validates that a string value does not exceed a maximum length.
 *
 * @param max Maximum number of characters
 * @param message Custom error message
 */
export function maxLength(max: number, message?: string): Validator {
  return {
    key: `maxLength:${max}`,
    validate(value) {
      if (isEmpty(value)) return { valid: true, message: "" };
      const str = toString(value);
      return str.length <= max
        ? { valid: true, message: "" }
        : {
            valid: false,
            message: message ?? `Must be no more than ${max} characters`,
          };
    },
  };
}

// ─── number ───────────────────────────────────────────────────────────────────

/**
 * Validates that the value is a valid number.
 * Optionally enforces min and max bounds.
 *
 * @param options.min Minimum value
 * @param options.max Maximum value
 * @param options.integer Require an integer
 * @param message Custom error message
 */
export function number(
  options: { min?: number; max?: number; integer?: boolean } = {},
  message?: string,
): Validator {
  return {
    key: "number",
    validate(value) {
      if (isEmpty(value)) return { valid: true, message: "" };

      const n = toNumber(value);
      if (isNaN(n)) {
        return { valid: false, message: message ?? "Must be a valid number" };
      }

      if (options.integer && !Number.isInteger(n)) {
        return { valid: false, message: message ?? "Must be a whole number" };
      }

      if (options.min !== undefined && n < options.min) {
        return {
          valid: false,
          message: message ?? `Must be at least ${options.min}`,
        };
      }

      if (options.max !== undefined && n > options.max) {
        return {
          valid: false,
          message: message ?? `Must be no more than ${options.max}`,
        };
      }

      return { valid: true, message: "" };
    },
  };
}

// ─── pattern ─────────────────────────────────────────────────────────────────

/**
 * Validates the value against a regular expression.
 *
 * @param regex The regex to test against
 * @param message Error message shown when the pattern does not match
 */
export function pattern(regex: RegExp, message = "Invalid format"): Validator {
  return {
    key: `pattern:${regex.source}`,
    validate(value) {
      if (isEmpty(value)) return { valid: true, message: "" };
      return regex.test(toString(value))
        ? { valid: true, message: "" }
        : { valid: false, message };
    },
  };
}

// ─── url ─────────────────────────────────────────────────────────────────────

/**
 * Validates that the value is a valid URL.
 *
 * @param protocols Allowed protocols (defaults to ["http", "https"])
 * @param message Custom error message
 */
export function url(
  protocols: string[] = ["http", "https"],
  message = "Please enter a valid URL",
): Validator {
  return {
    key: "url",
    validate(value) {
      if (isEmpty(value)) return { valid: true, message: "" };
      try {
        const parsed = new URL(toString(value));
        const proto = parsed.protocol.replace(":", "");
        return protocols.includes(proto)
          ? { valid: true, message: "" }
          : { valid: false, message };
      } catch {
        return { valid: false, message };
      }
    },
  };
}

// ─── matches ─────────────────────────────────────────────────────────────────

/**
 * Validates that the value matches another field's value.
 * Useful for password confirmation fields.
 *
 * @param fieldId The ID of the field to match against
 * @param message Custom error message
 */
export function matches(fieldId: string, message?: string): Validator {
  return {
    key: `matches:${fieldId}`,
    validate(value: FieldValue, formValues: FormValues) {
      if (isEmpty(value)) return { valid: true, message: "" };
      return value === formValues[fieldId]
        ? { valid: true, message: "" }
        : {
            valid: false,
            message: message ?? `Must match the ${fieldId} field`,
          };
    },
  };
}

// ─── custom ──────────────────────────────────────────────────────────────────

/**
 * Wraps a custom validation function into a Validator.
 *
 * @param fn Sync or async function: (value, formValues) => { valid, message }
 *
 * @example
 * custom(async (value) => {
 *   const taken = await checkUsernameTaken(value);
 *   return taken
 *     ? { valid: false, message: "Username is already taken" }
 *     : { valid: true, message: "" };
 * })
 */
export function custom(
  fn: (
    value: FieldValue,
    formValues: FormValues,
  ) =>
    | { valid: boolean; message: string }
    | Promise<{ valid: boolean; message: string }>,
  key?: string,
): Validator {
  return {
    key: key ?? "custom",
    validate: fn,
  };
}

// ─── compose ─────────────────────────────────────────────────────────────────

/**
 * Compose multiple validators into a single Validator.
 * Validators run in order and stop at the first failure.
 *
 * @example
 * const passwordValidator = compose(
 *   required(),
 *   minLength(8),
 *   pattern(/[A-Z]/, "Must contain an uppercase letter"),
 * );
 */
export function compose(...validators: Validator[]): Validator {
  return {
    key: "composed",
    async validate(value, formValues) {
      for (const v of validators) {
        const result = await Promise.resolve(v.validate(value, formValues));
        if (!result.valid) return result;
      }
      return { valid: true, message: "" };
    },
  };
}

// ─── phone ───────────────────────────────────────────────────────────────────

const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,}$/;

/**
 * Validates that the value is a plausible international phone number.
 * Accepts digits, spaces, dashes, dots, parentheses and an optional leading `+`.
 *
 * @param message Custom error message
 */
export function phone(
  message = "Please enter a valid phone number",
): Validator {
  return {
    key: "phone",
    validate(value) {
      if (isEmpty(value)) return { valid: true, message: "" };
      const cleaned = toString(value).replace(/\s+/g, "");
      return PHONE_REGEX.test(cleaned)
        ? { valid: true, message: "" }
        : { valid: false, message };
    },
  };
}

// ─── postalCode ──────────────────────────────────────────────────────────────

const POSTAL_CODE_PATTERNS: Record<string, RegExp> = {
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  UK: /^([A-Za-z][A-Ha-hJ-Yj-y]?\d[A-Za-z\d]?\s?\d[A-Za-z]{2}|GIR\s?0AA)$/,
  ES: /^\d{5}$/,
  FR: /^\d{5}$/,
  DE: /^\d{5}$/,
  IT: /^\d{5}$/,
  MX: /^\d{5}$/,
  AU: /^\d{4}$/,
  BR: /^\d{5}-?\d{3}$/,
  JP: /^\d{3}-?\d{4}$/,
  IN: /^\d{6}$/,
  // Generic fallback: 3–10 chars of letters/digits/dashes/spaces
  ANY: /^[A-Za-z0-9 -]{3,10}$/,
};

/**
 * Validates a postal/zip code.
 * Accepts a country code (e.g. "US", "ES", "UK") or "ANY" for permissive matching.
 *
 * @param country Country code key from POSTAL_CODE_PATTERNS (defaults to "ANY")
 * @param message Custom error message
 */
export function postalCode(
  country: keyof typeof POSTAL_CODE_PATTERNS = "ANY",
  message = "Please enter a valid postal code",
): Validator {
  const regex =
    POSTAL_CODE_PATTERNS[country] ??
    POSTAL_CODE_PATTERNS.ANY ??
    /^[A-Za-z0-9 -]{3,10}$/;
  return {
    key: `postalCode:${country}`,
    validate(value) {
      if (isEmpty(value)) return { valid: true, message: "" };
      return regex.test(toString(value).trim())
        ? { valid: true, message: "" }
        : { valid: false, message };
    },
  };
}

// ─── oneOf ───────────────────────────────────────────────────────────────────

/**
 * Validates that the value is one of an allowed list.
 *
 * @param allowed Allowed values
 * @param message Custom error message
 */
export function oneOf(
  allowed: ReadonlyArray<string | number>,
  message?: string,
): Validator {
  return {
    key: `oneOf:${allowed.join(",")}`,
    validate(value) {
      if (isEmpty(value)) return { valid: true, message: "" };
      return allowed.includes(value as string | number)
        ? { valid: true, message: "" }
        : {
            valid: false,
            message:
              message ?? `Must be one of: ${allowed.map(String).join(", ")}`,
          };
    },
  };
}

// ─── between ─────────────────────────────────────────────────────────────────

/**
 * Validates that a numeric value falls within an inclusive range.
 *
 * @param min Minimum allowed
 * @param max Maximum allowed
 * @param message Custom error message
 */
export function between(min: number, max: number, message?: string): Validator {
  return {
    key: `between:${min}:${max}`,
    validate(value) {
      if (isEmpty(value)) return { valid: true, message: "" };
      const n = toNumber(value);
      if (isNaN(n)) {
        return { valid: false, message: message ?? "Must be a valid number" };
      }
      return n >= min && n <= max
        ? { valid: true, message: "" }
        : {
            valid: false,
            message: message ?? `Must be between ${min} and ${max}`,
          };
    },
  };
}

// ─── alphanumeric ────────────────────────────────────────────────────────────

const ALPHANUMERIC_REGEX = /^[A-Za-z0-9]+$/;

/**
 * Validates that the value contains only letters and numbers.
 *
 * @param message Custom error message
 */
export function alphanumeric(
  message = "Only letters and numbers are allowed",
): Validator {
  return {
    key: "alphanumeric",
    validate(value) {
      if (isEmpty(value)) return { valid: true, message: "" };
      return ALPHANUMERIC_REGEX.test(toString(value))
        ? { valid: true, message: "" }
        : { valid: false, message };
    },
  };
}

// ─── strongPassword ──────────────────────────────────────────────────────────

/**
 * Validates a strong password.
 * By default requires: 8+ chars, 1 uppercase, 1 lowercase, 1 digit.
 *
 * @param options Customize requirements
 * @param message Custom error message
 */
export function strongPassword(
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireDigit?: boolean;
    requireSymbol?: boolean;
  } = {},
  message?: string,
): Validator {
  const {
    minLength: min = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireDigit = true,
    requireSymbol = false,
  } = options;

  return {
    key: "strongPassword",
    validate(value) {
      if (isEmpty(value)) return { valid: true, message: "" };
      const str = toString(value);
      const reasons: string[] = [];
      if (str.length < min) reasons.push(`${min}+ chars`);
      if (requireUppercase && !/[A-Z]/.test(str))
        reasons.push("an uppercase letter");
      if (requireLowercase && !/[a-z]/.test(str))
        reasons.push("a lowercase letter");
      if (requireDigit && !/\d/.test(str)) reasons.push("a digit");
      if (requireSymbol && !/[^A-Za-z0-9]/.test(str)) reasons.push("a symbol");

      if (reasons.length === 0) return { valid: true, message: "" };
      return {
        valid: false,
        message: message ?? `Password must include ${reasons.join(", ")}`,
      };
    },
  };
}

// ─── i18n configuration ──────────────────────────────────────────────────────

/** Default error messages shown by built-in validators. Override with `setLocale`. */
export interface ValidatorMessages {
  required: string;
  email: string;
  minLength: (min: number) => string;
  maxLength: (max: number) => string;
  number: string;
  numberInteger: string;
  numberMin: (min: number) => string;
  numberMax: (max: number) => string;
  pattern: string;
  url: string;
  matches: (fieldId: string) => string;
  phone: string;
  postalCode: string;
  oneOf: (allowed: ReadonlyArray<string | number>) => string;
  between: (min: number, max: number) => string;
  alphanumeric: string;
  strongPassword: (reasons: string[]) => string;
}

/** Locale registry. Pre-loaded with English. Add more via `setLocale`. */
export const messages: ValidatorMessages = {
  required: "This field is required",
  email: "Please enter a valid email address",
  minLength: (min) => `Must be at least ${min} characters`,
  maxLength: (max) => `Must be no more than ${max} characters`,
  number: "Must be a valid number",
  numberInteger: "Must be a whole number",
  numberMin: (min) => `Must be at least ${min}`,
  numberMax: (max) => `Must be no more than ${max}`,
  pattern: "Invalid format",
  url: "Please enter a valid URL",
  matches: (fieldId) => `Must match the ${fieldId} field`,
  phone: "Please enter a valid phone number",
  postalCode: "Please enter a valid postal code",
  oneOf: (allowed) => `Must be one of: ${allowed.map(String).join(", ")}`,
  between: (min, max) => `Must be between ${min} and ${max}`,
  alphanumeric: "Only letters and numbers are allowed",
  strongPassword: (reasons) => `Password must include ${reasons.join(", ")}`,
};

/**
 * Override the default validator messages — useful for i18n.
 *
 * @example
 * setLocale({
 *   required: "Este campo es obligatorio",
 *   email: "Email no válido",
 * });
 */
export function setLocale(overrides: Partial<ValidatorMessages>): void {
  Object.assign(messages, overrides);
}

// ─── Convenience re-exports as a namespace ────────────────────────────────────

export const validators = {
  required,
  email,
  minLength,
  maxLength,
  number,
  pattern,
  url,
  matches,
  custom,
  compose,
  phone,
  postalCode,
  oneOf,
  between,
  alphanumeric,
  strongPassword,
} as const;

export default validators;
