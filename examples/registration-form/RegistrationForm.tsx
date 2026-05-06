/**
 * Example: Multi-Step Registration Form
 * A comprehensive 4-step user registration with progress labels,
 * validateOnChange, and custom theming.
 *
 * Demonstrates: custom theme, validateOnChange, step jump, all field types.
 */

import React from "react";
import { FormFlow, createTheme } from "formflow";
import { required, email, minLength, number, url, matches } from "formflow/validators";
import type { FormStepConfig, FormValues } from "formflow";

// Custom brand theme
const brandTheme = createTheme("brand", {
  colors: {
    primary: "#7C3AED",
    primaryHover: "#6D28D9",
    primaryForeground: "#FFFFFF",
    borderFocus: "#7C3AED",
    progressFill: "#7C3AED",
  },
});

const steps: FormStepConfig[] = [
  {
    id: "basics",
    title: "Basic Info",
    description: "Let's start with the essentials.",
    fields: [
      {
        id: "firstName",
        type: "text",
        label: "First Name",
        placeholder: "Jane",
        validators: [required(), minLength(2)],
        autoFocus: true,
      },
      {
        id: "lastName",
        type: "text",
        label: "Last Name",
        placeholder: "Doe",
        validators: [required(), minLength(2)],
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        placeholder: "jane@example.com",
        validators: [required(), email()],
        description: "We'll send a verification link to this address.",
      },
      {
        id: "birthYear",
        type: "number",
        label: "Year of Birth",
        placeholder: "1990",
        validators: [
          required(),
          number(
            { min: 1900, max: new Date().getFullYear() - 13, integer: true },
            "Please enter a valid year (you must be 13+)",
          ),
        ],
      },
    ],
  },
  {
    id: "credentials",
    title: "Set Password",
    description: "Choose a strong password to protect your account.",
    fields: [
      {
        id: "password",
        type: "password",
        label: "Password",
        placeholder: "At least 8 characters",
        description: "Use a mix of letters, numbers, and symbols.",
        validators: [required(), minLength(8)],
      },
      {
        id: "confirmPassword",
        type: "password",
        label: "Confirm Password",
        validators: [
          required(),
          matches("password", "Passwords do not match"),
        ],
      },
    ],
  },
  {
    id: "profile",
    title: "Your Profile",
    description: "Help others learn about you.",
    fields: [
      {
        id: "avatar",
        type: "select",
        label: "Avatar Style",
        placeholder: "Pick a style…",
        options: [
          { value: "initials", label: "Initials" },
          { value: "geometric", label: "Geometric" },
          { value: "pixel", label: "Pixel Art" },
          { value: "gradient", label: "Gradient" },
        ],
      },
      {
        id: "website",
        type: "url",
        label: "Website or Portfolio (optional)",
        placeholder: "https://yoursite.com",
        validators: [url()],
      },
      {
        id: "interests",
        type: "checkbox-group",
        label: "Interests",
        description: "Select all that apply.",
        options: [
          { value: "frontend", label: "Frontend Development" },
          { value: "backend", label: "Backend Development" },
          { value: "design", label: "UI/UX Design" },
          { value: "devops", label: "DevOps & Infrastructure" },
          { value: "data", label: "Data & Analytics" },
          { value: "mobile", label: "Mobile Development" },
        ],
        defaultValue: [],
      },
      {
        id: "bio",
        type: "textarea",
        label: "Short Bio (optional)",
        placeholder: "Tell the community about yourself…",
        validators: [minLength(10)],
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Control how we communicate with you.",
    fields: [
      {
        id: "emailNotifications",
        type: "radio",
        label: "Email Notifications",
        defaultValue: "important",
        options: [
          { value: "all", label: "All activity" },
          { value: "important", label: "Important updates only" },
          { value: "none", label: "None" },
        ],
      },
      {
        id: "weeklyDigest",
        type: "checkbox",
        label: "Send me a weekly community digest",
        defaultValue: true,
      },
      {
        id: "acceptTerms",
        type: "checkbox",
        label: "I accept the Terms of Service and Privacy Policy",
        validators: [
          {
            key: "mustAccept",
            validate: (val) =>
              val === true
                ? { valid: true, message: "" }
                : { valid: false, message: "You must accept the terms to register" },
          },
        ],
      },
    ],
  },
];

async function handleRegistration(values: FormValues): Promise<void> {
  console.log("Registration data:", values);
  await new Promise((r) => setTimeout(r, 1000));
  alert(`Welcome to the community, ${String(values.firstName)}! 🎉`);
}

export function RegistrationForm() {
  return (
    <div style={{ maxWidth: "560px", margin: "40px auto", padding: "0 16px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#7C3AED", margin: "0 0 8px" }}>
          Join FormFlow
        </h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Create your account in 4 easy steps.
        </p>
      </div>

      <FormFlow
        id="registration"
        steps={steps}
        onSubmit={handleRegistration}
        theme={brandTheme}
        showProgress
        allowStepJump={false}
        validateOnChange={false}
        submitLabel="Create Account"
        nextLabel="Next Step"
        backLabel="Go Back"
        persistence={{
          enabled: true,
          includeStepIndex: true,
          ttl: 30 * 60 * 1000, // 30 minutes
        }}
      />
    </div>
  );
}

export default RegistrationForm;
