import { AUTH_CONFIG } from "./auth.constants";

const { FORM } = AUTH_CONFIG.UI.LABELS;

export const loginFormConfig = [
  { 
    name: 'cedula', 
    label: FORM.CEDULA, 
    placeholder: FORM.CEDULA_PLACEHOLDER, 
    type: 'text' 
  },
  { 
    name: 'password', 
    label: FORM.PASSWORD, 
    placeholder: FORM.PASSWORD_PLACEHOLDER, 
    type: 'password' 
  }
];
