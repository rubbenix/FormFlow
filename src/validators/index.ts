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
export function required(
  message = "This field is required",
): Validator {
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
export function minLength(
  min: number,
  message?: string,
): Validator {
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
export function maxLength(
  max: number,
  message?: string,
): Validator {
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
export function pattern(
  regex: RegExp,
  message = "Invalid format",
): Validator {
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
export function matches(
  fieldId: string,
  message?: string,
): Validator {
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
} as const;

export default validators;
