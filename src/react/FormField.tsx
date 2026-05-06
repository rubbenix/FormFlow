/**
 * FormField Component
 * Renders a single form field with label, input, description, and error message.
 * Supports all FieldType variants with full accessibility.
 */

import React, { useCallback, useState, useId } from "react";
import type { FormFieldProps, FieldValue } from "../types/index.js";
import {
  getLabelStyles,
  getInputStyles,
  getErrorStyles,
  getDescriptionStyles,
} from "./styles.js";

function CheckmarkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="6" fill="currentColor" opacity="0.15" />
      <path
        d="M3 6l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="6" fill="currentColor" opacity="0.15" />
      <path
        d="M6 3v4M6 8.5v.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * <FormField />
 * Renders a field and handles all input types.
 */
export const FormField = React.memo(function FormField({
  field,
  value,
  validation,
  onChange,
  onBlur,
  theme,
  classNames = {},
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const uid = useId();
  const inputId = `ff-${uid}-${field.id}`;
  const errorId = `${inputId}-error`;
  const descId = `${inputId}-desc`;

  if (!theme) return null;

  // Check visibility condition
  if (field.condition) {
    // Condition is evaluated in the parent; if this renders, it's visible
    // (parent skips hidden fields). But we guard here for standalone use.
  }

  const hasError = !!(
    validation &&
    !validation.valid &&
    validation.touched &&
    validation.error
  );

  const isValid = !!(
    validation &&
    validation.valid &&
    validation.touched &&
    validation.dirty
  );

  const handleFocus = () => setIsFocused(true);
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur();
  }, [onBlur]);

  const sharedInputProps = {
    id: inputId,
    name: field.id,
    disabled: field.disabled,
    readOnly: field.readonly,
    "aria-invalid": hasError,
    "aria-describedby":
      [field.description ? descId : "", hasError ? errorId : ""]
        .filter(Boolean)
        .join(" ") || undefined,
    "aria-label": field.ariaLabel,
    autoFocus: field.autoFocus,
    onFocus: handleFocus,
    onBlur: handleBlur,
    style: getInputStyles(theme, hasError, isFocused),
    className: classNames.fieldInput,
    ...field.inputProps,
  };

  function renderInput() {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            {...sharedInputProps}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            placeholder={field.placeholder}
            style={{
              ...sharedInputProps.style,
              resize: "vertical",
              minHeight: "100px",
            }}
          />
        );

      case "select":
        return (
          <select
            {...sharedInputProps}
            value={typeof value === "string" || typeof value === "number" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            style={{
              ...sharedInputProps.style,
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "36px",
              cursor: field.disabled ? "not-allowed" : "pointer",
            }}
          >
            {field.placeholder && (
              <option value="" disabled>
                {field.placeholder}
              </option>
            )}
            {field.options?.map((opt) => (
              <option
                key={String(opt.value)}
                value={String(opt.value)}
                disabled={opt.disabled}
              >
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div
            role="radiogroup"
            aria-labelledby={inputId}
            style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}
          >
            {field.options?.map((opt) => {
              const radioId = `${inputId}-${String(opt.value)}`;
              return (
                <label
                  key={String(opt.value)}
                  htmlFor={radioId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.sm,
                    cursor: opt.disabled ?? field.disabled ? "not-allowed" : "pointer",
                    fontSize: theme.typography.fontSizeBase,
                    color: theme.colors.text,
                    opacity: opt.disabled ?? field.disabled ? 0.5 : 1,
                  }}
                >
                  <input
                    type="radio"
                    id={radioId}
                    name={field.id}
                    value={String(opt.value)}
                    checked={value === opt.value}
                    onChange={() => onChange(opt.value as FieldValue)}
                    disabled={opt.disabled ?? field.disabled}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{ accentColor: theme.colors.primary }}
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        );

      case "checkbox":
        return (
          <label
            htmlFor={inputId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.sm,
              cursor: field.disabled ? "not-allowed" : "pointer",
              fontSize: theme.typography.fontSizeBase,
              color: theme.colors.text,
            }}
          >
            <input
              type="checkbox"
              id={inputId}
              name={field.id}
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              disabled={field.disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{ accentColor: theme.colors.primary, width: "16px", height: "16px" }}
              aria-invalid={hasError}
              aria-describedby={sharedInputProps["aria-describedby"]}
            />
            {field.label}
          </label>
        );

      case "checkbox-group":
        return (
          <div
            role="group"
            aria-labelledby={inputId}
            style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}
          >
            {field.options?.map((opt) => {
              const cbId = `${inputId}-${String(opt.value)}`;
              const currentValues = Array.isArray(value) ? value : [];
              const isChecked = currentValues.includes(String(opt.value));

              return (
                <label
                  key={String(opt.value)}
                  htmlFor={cbId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.sm,
                    cursor: opt.disabled ?? field.disabled ? "not-allowed" : "pointer",
                    fontSize: theme.typography.fontSizeBase,
                    color: theme.colors.text,
                    opacity: opt.disabled ?? field.disabled ? 0.5 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    id={cbId}
                    value={String(opt.value)}
                    checked={isChecked}
                    disabled={opt.disabled ?? field.disabled}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...currentValues, String(opt.value)]
                        : currentValues.filter((v) => v !== String(opt.value));
                      onChange(next);
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{ accentColor: theme.colors.primary, width: "16px", height: "16px" }}
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        );

      case "hidden":
        return (
          <input
            type="hidden"
            id={inputId}
            name={field.id}
            value={typeof value === "string" ? value : String(value ?? "")}
          />
        );

      default:
        // Covers: text, email, password, number, tel, url, date, time, datetime-local, file
        return (
          <input
            {...sharedInputProps}
            type={field.type}
            value={
              field.type === "file"
                ? undefined
                : typeof value === "string" || typeof value === "number"
                  ? value
                  : ""
            }
            onChange={(e) => {
              if (field.type === "file") {
                onChange(e.target.value); // path string for now
              } else if (field.type === "number") {
                onChange(e.target.value === "" ? "" : Number(e.target.value));
              } else {
                onChange(e.target.value);
              }
            }}
            placeholder={field.placeholder}
          />
        );
    }
  }

  // For checkbox type, label is rendered inside the input itself
  const isCheckbox = field.type === "checkbox";

  return (
    <div
      style={{ marginBottom: theme.spacing.md }}
      className={classNames.field}
    >
      {/* Label (skip for checkbox — rendered inline) */}
      {!isCheckbox && (
        <label
          htmlFor={inputId}
          id={inputId}
          style={getLabelStyles(theme)}
          className={classNames.fieldLabel}
        >
          {field.label}
          {field.validators?.some((v) => v.key === "required") && (
            <span
              style={{ color: theme.colors.error, marginLeft: "2px" }}
              aria-hidden="true"
            >
              *
            </span>
          )}
          {isValid && (
            <span
              style={{ color: theme.colors.success, marginLeft: theme.spacing.xs }}
              aria-hidden="true"
            >
              <CheckmarkIcon />
            </span>
          )}
        </label>
      )}

      {/* Description (above input) */}
      {field.description && (
        <p
          id={descId}
          style={{ ...getDescriptionStyles(theme), marginBottom: theme.spacing.xs }}
          className={classNames.fieldDescription}
        >
          {field.description}
        </p>
      )}

      {/* The input */}
      {renderInput()}

      {/* Error message */}
      {hasError && (
        <p
          id={errorId}
          role="alert"
          style={getErrorStyles(theme)}
          className={classNames.fieldError}
        >
          <ErrorIcon />
          {validation?.error}
        </p>
      )}
    </div>
  );
});
