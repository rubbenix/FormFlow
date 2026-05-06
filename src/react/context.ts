/**
 * FormFlow React Context
 * Provides the form instance to all child components.
 */

import { createContext } from "react";
import type { UseFormFlowReturn } from "../hooks/useFormFlow.js";
import type { FormFlowTheme, FormFlowClassNames } from "../types/index.js";

export interface FormFlowContextValue {
  form: UseFormFlowReturn;
  theme: FormFlowTheme;
  classNames: FormFlowClassNames;
  validateOnChange: boolean;
  allowStepJump: boolean;
  nextLabel: string;
  backLabel: string;
  submitLabel: string;
}

export const FormFlowContext = createContext<FormFlowContextValue | null>(null);
FormFlowContext.displayName = "FormFlowContext";
