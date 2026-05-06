/**
 * Example: Next.js Onboarding Flow
 * A 4-step user onboarding wizard with conditional steps,
 * persistence, and async validation.
 *
 * Works in both App Router (as a Client Component) and Pages Router.
 *
 * Usage:
 *   npm install formflow
 *   Copy this file into your Next.js app and import it.
 */

"use client"; // Required for App Router

import React from "react";
import { FormFlow } from "formflow";
import { required, email, minLength, matches, custom } from "formflow/validators";
import type { FormStepConfig, FormValues } from "formflow";

// Simulate async username availability check
async function checkUsername(value: unknown): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 400));
  const taken = ["admin", "root", "formflow", "test"];
  return !taken.includes(String(value).toLowerCase());
}

const steps: FormStepConfig[] = [
  {
    id: "account",
    title: "Create your account",
    description: "Start with your basic credentials.",
    fields: [
      {
        id: "email",
        type: "email",
        label: "Work Email",
        placeholder: "you@company.com",
        validators: [required(), email()],
        autoFocus: true,
      },
      {
        id: "username",
        type: "text",
        label: "Username",
        placeholder: "cool_developer",
        description: "3–20 characters. Letters, numbers, and underscores only.",
        validators: [
          required(),
          minLength(3),
          custom(async (val) => {
            const available = await checkUsername(val);
            return available
              ? { valid: true, message: "" }
              : { valid: false, message: "This username is already taken" };
          }, "usernameAvailable"),
        ],
      },
      {
        id: "password",
        type: "password",
        label: "Password",
        placeholder: "At least 8 characters",
        validators: [required(), minLength(8)],
      },
      {
        id: "confirmPassword",
        type: "password",
        label: "Confirm Password",
        validators: [required(), matches("password", "Passwords do not match")],
      },
    ],
  },
  {
    id: "profile",
    title: "Set up your profile",
    description: "Tell us a bit about yourself.",
    fields: [
      {
        id: "firstName",
        type: "text",
        label: "First Name",
        validators: [required()],
      },
      {
        id: "lastName",
        type: "text",
        label: "Last Name",
        validators: [required()],
      },
      {
        id: "role",
        type: "select",
        label: "Your Role",
        placeholder: "Select your role…",
        validators: [required()],
        options: [
          { value: "developer", label: "Developer" },
          { value: "designer", label: "Designer" },
          { value: "product", label: "Product Manager" },
          { value: "marketing", label: "Marketing" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "bio",
        type: "textarea",
        label: "Short Bio (optional)",
        placeholder: "Tell us what you build…",
      },
    ],
  },
  {
    id: "team",
    title: "Join or create a team",
    description: "How are you planning to use FormFlow?",
    fields: [
      {
        id: "useCase",
        type: "radio",
        label: "I want to…",
        validators: [required()],
        options: [
          { value: "personal", label: "Use it for personal projects" },
          { value: "join", label: "Join an existing team" },
          { value: "create", label: "Create a new team" },
        ],
      },
      {
        id: "teamCode",
        type: "text",
        label: "Team Invite Code",
        placeholder: "XXXX-XXXX",
        description: "Ask your team admin for the invite code.",
        condition: {
          fn: (values) => values.useCase === "join",
          watchFields: ["useCase"],
        },
        validators: [required()],
      },
      {
        id: "teamName",
        type: "text",
        label: "Team Name",
        placeholder: "Acme Engineering",
        condition: {
          fn: (values) => values.useCase === "create",
          watchFields: ["useCase"],
        },
        validators: [required()],
      },
    ],
  },
  {
    id: "agreement",
    title: "Almost there!",
    description: "Review and accept our terms to get started.",
    fields: [
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
                : { valid: false, message: "You must accept the terms to continue" },
          },
        ],
      },
      {
        id: "marketingEmails",
        type: "checkbox",
        label: "Send me product updates and tips (optional)",
        defaultValue: true,
      },
    ],
  },
];

async function handleOnboardingSubmit(values: FormValues): Promise<void> {
  console.log("Onboarding complete:", values);
  // Simulate API call
  await new Promise((r) => setTimeout(r, 1200));
  // In a real app: redirect to dashboard
  alert(`Welcome, ${String(values.firstName)}! Your account is ready.`);
}

export function OnboardingFlow() {
  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 16px" }}>
      <FormFlow
        id="onboarding"
        steps={steps}
        onSubmit={handleOnboardingSubmit}
        theme="light"
        showProgress
        allowStepJump={false}
        persistence={{
          enabled: true,
          includeStepIndex: true,
          ttl: 1000 * 60 * 60, // 1 hour
        }}
        submitLabel="Complete Setup"
        validateOnChange={false}
      />
    </div>
  );
}

export default OnboardingFlow;
