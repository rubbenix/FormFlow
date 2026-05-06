/**
 * Validator Tests
 * Tests for all built-in FormFlow validators.
 */

import { describe, it, expect } from "vitest";
import {
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
} from "../src/validators/index.js";

const EMPTY_VALUES = {};

// ─── required ─────────────────────────────────────────────────────────────────

describe("required()", () => {
  const validator = required();

  it("fails for empty string", async () => {
    const result = await validator.validate("", EMPTY_VALUES);
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it("fails for null", async () => {
    const result = await validator.validate(null, EMPTY_VALUES);
    expect(result.valid).toBe(false);
  });

  it("fails for undefined", async () => {
    const result = await validator.validate(undefined, EMPTY_VALUES);
    expect(result.valid).toBe(false);
  });

  it("fails for whitespace-only string", async () => {
    const result = await validator.validate("   ", EMPTY_VALUES);
    expect(result.valid).toBe(false);
  });

  it("fails for empty array", async () => {
    const result = await validator.validate([], EMPTY_VALUES);
    expect(result.valid).toBe(false);
  });

  it("passes for non-empty string", async () => {
    const result = await validator.validate("hello", EMPTY_VALUES);
    expect(result.valid).toBe(true);
  });

  it("passes for false (explicit boolean)", async () => {
    // false is a valid value for checkboxes when not required
    const result = await validator.validate("false", EMPTY_VALUES);
    expect(result.valid).toBe(true);
  });

  it("passes for number 0", async () => {
    const result = await validator.validate(0, EMPTY_VALUES);
    expect(result.valid).toBe(true);
  });

  it("uses custom message", async () => {
    const v = required("Field is mandatory");
    const result = await v.validate("", EMPTY_VALUES);
    expect(result.message).toBe("Field is mandatory");
  });
});

// ─── email ────────────────────────────────────────────────────────────────────

describe("email()", () => {
  const validator = email();

  it("passes for valid email", async () => {
    const result = await validator.validate("test@example.com", EMPTY_VALUES);
    expect(result.valid).toBe(true);
  });

  it("passes for empty (optional by default)", async () => {
    const result = await validator.validate("", EMPTY_VALUES);
    expect(result.valid).toBe(true);
  });

  it("fails for missing @", async () => {
    const result = await validator.validate("notanemail", EMPTY_VALUES);
    expect(result.valid).toBe(false);
  });

  it("fails for missing TLD", async () => {
    const result = await validator.validate("test@example", EMPTY_VALUES);
    expect(result.valid).toBe(false);
  });

  it("passes for subdomain email", async () => {
    const result = await validator.validate(
      "user@mail.company.co.uk",
      EMPTY_VALUES,
    );
    expect(result.valid).toBe(true);
  });

  it("uses custom message", async () => {
    const v = email("Bad email");
    const result = await v.validate("nope", EMPTY_VALUES);
    expect(result.message).toBe("Bad email");
  });
});

// ─── minLength ────────────────────────────────────────────────────────────────

describe("minLength()", () => {
  it("passes when value meets minimum", async () => {
    const v = minLength(3);
    expect((await v.validate("abc", EMPTY_VALUES)).valid).toBe(true);
  });

  it("fails when value is below minimum", async () => {
    const v = minLength(5);
    expect((await v.validate("hi", EMPTY_VALUES)).valid).toBe(false);
  });

  it("passes for empty (optional — not required)", async () => {
    const v = minLength(3);
    expect((await v.validate("", EMPTY_VALUES)).valid).toBe(true);
  });

  it("error message includes minimum", async () => {
    const v = minLength(8);
    const result = await v.validate("short", EMPTY_VALUES);
    expect(result.message).toContain("8");
  });
});

// ─── maxLength ────────────────────────────────────────────────────────────────

describe("maxLength()", () => {
  it("passes when value is within maximum", async () => {
    const v = maxLength(10);
    expect((await v.validate("hello", EMPTY_VALUES)).valid).toBe(true);
  });

  it("fails when value exceeds maximum", async () => {
    const v = maxLength(3);
    expect((await v.validate("toolong", EMPTY_VALUES)).valid).toBe(false);
  });

  it("passes at exactly maximum length", async () => {
    const v = maxLength(5);
    expect((await v.validate("hello", EMPTY_VALUES)).valid).toBe(true);
  });
});

// ─── number ───────────────────────────────────────────────────────────────────

describe("number()", () => {
  it("passes for a valid number", async () => {
    const v = number();
    expect((await v.validate("42", EMPTY_VALUES)).valid).toBe(true);
  });

  it("fails for non-numeric string", async () => {
    const v = number();
    expect((await v.validate("abc", EMPTY_VALUES)).valid).toBe(false);
  });

  it("enforces minimum value", async () => {
    const v = number({ min: 10 });
    expect((await v.validate("5", EMPTY_VALUES)).valid).toBe(false);
    expect((await v.validate("15", EMPTY_VALUES)).valid).toBe(true);
  });

  it("enforces maximum value", async () => {
    const v = number({ max: 100 });
    expect((await v.validate("150", EMPTY_VALUES)).valid).toBe(false);
    expect((await v.validate("50", EMPTY_VALUES)).valid).toBe(true);
  });

  it("enforces integer constraint", async () => {
    const v = number({ integer: true });
    expect((await v.validate("3.14", EMPTY_VALUES)).valid).toBe(false);
    expect((await v.validate("42", EMPTY_VALUES)).valid).toBe(true);
  });

  it("passes for empty (optional)", async () => {
    const v = number();
    expect((await v.validate("", EMPTY_VALUES)).valid).toBe(true);
  });
});

// ─── pattern ─────────────────────────────────────────────────────────────────

describe("pattern()", () => {
  it("passes when pattern matches", async () => {
    const v = pattern(/^[A-Z]{3}$/);
    expect((await v.validate("ABC", EMPTY_VALUES)).valid).toBe(true);
  });

  it("fails when pattern does not match", async () => {
    const v = pattern(/^[A-Z]{3}$/);
    expect((await v.validate("abc", EMPTY_VALUES)).valid).toBe(false);
  });

  it("passes for empty (optional)", async () => {
    const v = pattern(/^[A-Z]+$/);
    expect((await v.validate("", EMPTY_VALUES)).valid).toBe(true);
  });
});

// ─── url ─────────────────────────────────────────────────────────────────────

describe("url()", () => {
  it("passes for valid https URL", async () => {
    const v = url();
    expect((await v.validate("https://example.com", EMPTY_VALUES)).valid).toBe(
      true,
    );
  });

  it("passes for valid http URL", async () => {
    const v = url();
    expect(
      (await v.validate("http://example.com/path?q=1", EMPTY_VALUES)).valid,
    ).toBe(true);
  });

  it("fails for invalid URL", async () => {
    const v = url();
    expect((await v.validate("not-a-url", EMPTY_VALUES)).valid).toBe(false);
  });

  it("fails for disallowed protocol", async () => {
    const v = url(["https"]); // only https
    expect((await v.validate("http://example.com", EMPTY_VALUES)).valid).toBe(
      false,
    );
  });
});

// ─── matches ─────────────────────────────────────────────────────────────────

describe("matches()", () => {
  it("passes when values match", async () => {
    const v = matches("password");
    const result = await v.validate("secret123", { password: "secret123" });
    expect(result.valid).toBe(true);
  });

  it("fails when values do not match", async () => {
    const v = matches("password");
    const result = await v.validate("different", { password: "secret123" });
    expect(result.valid).toBe(false);
  });

  it("passes for empty (optional)", async () => {
    const v = matches("password");
    const result = await v.validate("", { password: "anything" });
    expect(result.valid).toBe(true);
  });
});

// ─── custom ───────────────────────────────────────────────────────────────────

describe("custom()", () => {
  it("passes when custom function returns valid", async () => {
    const v = custom((val) => ({
      valid: val === "magic",
      message: "Not magic",
    }));
    expect((await v.validate("magic", EMPTY_VALUES)).valid).toBe(true);
  });

  it("fails when custom function returns invalid", async () => {
    const v = custom(() => ({ valid: false, message: "Always fails" }));
    expect((await v.validate("anything", EMPTY_VALUES)).valid).toBe(false);
  });

  it("supports async validators", async () => {
    const v = custom(async (val) => {
      await new Promise((r) => setTimeout(r, 10));
      return { valid: String(val).length > 3, message: "Too short" };
    });
    expect((await v.validate("hi", EMPTY_VALUES)).valid).toBe(false);
    expect((await v.validate("hello", EMPTY_VALUES)).valid).toBe(true);
  });
});

// ─── compose ─────────────────────────────────────────────────────────────────

describe("compose()", () => {
  it("runs all validators and stops at first failure", async () => {
    const v = compose(required(), email(), minLength(10));
    // Fails required first
    const r1 = await v.validate("", EMPTY_VALUES);
    expect(r1.valid).toBe(false);

    // Fails email next
    const r2 = await v.validate("notanemail", EMPTY_VALUES);
    expect(r2.valid).toBe(false);

    // Passes all
    const r3 = await v.validate("valid@example.com", EMPTY_VALUES);
    expect(r3.valid).toBe(true);
  });
});
