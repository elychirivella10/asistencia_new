import * as React from "react";
import { BiometricSyncContext } from "../components/BiometricSyncProvider";

export function useBiometricSync() {
  const context = React.useContext(BiometricSyncContext);
  
  if (!context) {
    throw new Error("useBiometricSync debe ser usado dentro de un BiometricSyncProvider");
  }
  
  return context;
}
