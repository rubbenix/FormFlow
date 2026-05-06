/**
 * Example: React Contact Form
 * A simple 2-step contact form using FormFlow.
 *
 * Usage:
 *   npm install formflow react react-dom
 *   Then render <ContactForm /> in your React app.
 */

import React from "react";
import { FormFlow } from "formflow";
import { required, email, minLength } from "formflow/validators";
import type { FormStepConfig, FormValues } from "formflow";

const steps: FormStepConfig[] = [
  {
    id: "contact",
    title: "Contact Details",
    description: "Tell us who you are and how to reach you.",
    fields: [
      {
        id: "firstName",
        type: "text",
        label: "First Name",
        placeholder: "Jane",
        validators: [required()],
        autoFocus: true,
      },
      {
        id: "lastName",
        type: "text",
        label: "Last Name",
        placeholder: "Doe",
        validators: [required()],
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        placeholder: "jane@example.com",
        validators: [required(), email()],
      },
      {
        id: "phone",
        type: "tel",
        label: "Phone Number (optional)",
        placeholder: "+1 555 000 0000",
      },
    ],
  },
  {
    id: "message",
    title: "Your Message",
    description: "Let us know how we can help.",
    fields: [
      {
        id: "subject",
        type: "select",
        label: "Subject",
        placeholder: "Select a subject…",
        validators: [required()],
        options: [
          { value: "support", label: "Technical Support" },
          { value: "billing", label: "Billing Inquiry" },
          { value: "partnership", label: "Partnership" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "message",
        type: "textarea",
        label: "Message",
        placeholder: "Describe your question or feedback…",
        validators: [required(), minLength(20)],
        description: "Please provide at least 20 characters.",
      },
      {
        id: "newsletter",
        type: "checkbox",
        label: "Subscribe me to the newsletter",
        defaultValue: false,
      },
    ],
  },
];

async function handleSubmit(values: FormValues): Promise<void> {
  // Simulate API call
  console.log("Contact form submitted:", values);
  await new Promise((r) => setTimeout(r, 1000));
  alert(`Thank you, ${String(values.firstName)}! We'll be in touch.`);
}

export function ContactForm() {
  return (
    <div style={{ maxWidth: "560px", margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontFamily: "system-ui, sans-serif", marginBottom: "24px" }}>
        Contact Us
      </h1>
      <FormFlow
        steps={steps}
        onSubmit={handleSubmit}
        theme="light"
        showProgress
        nextLabel="Continue"
        submitLabel="Send Message"
      />
    </div>
  );
}

export default ContactForm;
