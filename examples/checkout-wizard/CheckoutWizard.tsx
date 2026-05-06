/**
 * Example: Checkout Wizard
 * A 3-step e-commerce checkout flow with order summary and conditional shipping.
 *
 * Demonstrates: useFormFlow hook, custom navigation, conditional steps, dark theme.
 */

import React from "react";
import { useFormFlow } from "formflow";
import { ProgressBar, FormStep, NextButton, BackButton, FormFlowContext } from "formflow/react";
import { required, email, pattern } from "formflow/validators";
import type { FormStepConfig, FormValues } from "formflow";

const steps: FormStepConfig[] = [
  {
    id: "shipping",
    title: "Shipping Address",
    fields: [
      {
        id: "fullName",
        type: "text",
        label: "Full Name",
        validators: [required()],
        autoFocus: true,
      },
      {
        id: "addressLine1",
        type: "text",
        label: "Address",
        placeholder: "123 Main Street",
        validators: [required()],
      },
      {
        id: "addressLine2",
        type: "text",
        label: "Apt, Suite, etc. (optional)",
        placeholder: "Apt 4B",
      },
      {
        id: "city",
        type: "text",
        label: "City",
        validators: [required()],
      },
      {
        id: "zipCode",
        type: "text",
        label: "ZIP Code",
        validators: [
          required(),
          pattern(/^\d{5}(-\d{4})?$/, "Enter a valid US ZIP code (e.g. 10001)"),
        ],
      },
      {
        id: "sameAsBilling",
        type: "checkbox",
        label: "Billing address is the same as shipping",
        defaultValue: true,
      },
    ],
  },
  {
    id: "billing",
    title: "Billing Address",
    condition: {
      fn: (values) => values.sameAsBilling !== true,
      watchFields: ["sameAsBilling"],
    },
    fields: [
      {
        id: "billingName",
        type: "text",
        label: "Name on Card",
        validators: [required()],
      },
      {
        id: "billingAddress",
        type: "text",
        label: "Billing Address",
        validators: [required()],
      },
      {
        id: "billingCity",
        type: "text",
        label: "City",
        validators: [required()],
      },
      {
        id: "billingZip",
        type: "text",
        label: "ZIP Code",
        validators: [
          required(),
          pattern(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
        ],
      },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    description: "Your payment is processed securely.",
    fields: [
      {
        id: "email",
        type: "email",
        label: "Email (for receipt)",
        validators: [required(), email()],
      },
      {
        id: "paymentMethod",
        type: "radio",
        label: "Payment Method",
        validators: [required()],
        defaultValue: "card",
        options: [
          { value: "card", label: "Credit / Debit Card" },
          { value: "paypal", label: "PayPal" },
          { value: "apple", label: "Apple Pay" },
        ],
      },
      // Note: In production, card details are handled by Stripe Elements, not plain inputs.
      // This field is for illustration only.
      {
        id: "cardNote",
        type: "hidden",
        label: "Card",
        defaultValue: "handled-by-stripe",
      },
    ],
  },
];

async function handleCheckout(values: FormValues): Promise<void> {
  console.log("Checkout values:", values);
  await new Promise((r) => setTimeout(r, 1500));
  alert("Order placed! You'll receive a confirmation email shortly.");
}

// Custom UI using useFormFlow hook directly
export function CheckoutWizard() {
  const form = useFormFlow({
    steps,
    onSubmit: handleCheckout,
    theme: "dark",
  });

  const {
    state,
    currentStep,
    visibleSteps,
    currentStepIndex,
    totalSteps,
    progress,
    canGoBack,
    isLastStep,
    goNext,
    goBack,
    setValue,
    touchField,
  } = form;

  const contextValue = {
    form,
    theme: { name: "dark" } as never, // simplified for example
    classNames: {},
    validateOnChange: false,
    allowStepJump: false,
    nextLabel: "Continue",
    backLabel: "Back",
    submitLabel: "Place Order",
  };

  return (
    <div style={{ maxWidth: "560px", margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
      <h1>Checkout</h1>

      {/* Order summary sidebar (real app would have this) */}
      <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "8px", marginBottom: "24px" }}>
        <strong>Order Summary</strong>
        <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
          {visibleSteps.length} steps · Step {currentStepIndex + 1} of {totalSteps}
        </p>
      </div>

      <ProgressBar
        current={currentStepIndex + 1}
        total={totalSteps}
        percentage={progress}
      />

      <FormFlowContext.Provider value={contextValue}>
        {state.isSubmitted ? (
          <div style={{ padding: "24px", background: "#f0fdf4", borderRadius: "12px", color: "#16a34a", textAlign: "center" }}>
            ✓ Order confirmed! Check your email for details.
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); void goNext(); }}
            style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px" }}
          >
            {state.submitError && (
              <p style={{ color: "#dc2626", background: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                {state.submitError}
              </p>
            )}

            <FormStep
              step={currentStep}
              values={state.values}
              validation={state.validation}
              onChange={(fieldId, value) => setValue(fieldId, value)}
              onBlur={(fieldId) => touchField(fieldId)}
            />

            <div style={{ display: "flex", justifyContent: canGoBack ? "space-between" : "flex-end", marginTop: "24px" }}>
              {canGoBack && (
                <BackButton
                  onClick={goBack}
                  disabled={state.isSubmitting}
                  backLabel="Back"
                />
              )}
              <NextButton
                onClick={() => void goNext()}
                isLastStep={isLastStep}
                isSubmitting={state.isSubmitting}
                nextLabel="Continue"
                submitLabel="Place Order →"
              />
            </div>
          </form>
        )}
      </FormFlowContext.Provider>
    </div>
  );
}

export default CheckoutWizard;
