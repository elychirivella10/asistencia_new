"use client";

import * as React from "react";
import { toast } from "sonner";
import { 
  syncAllClockTemplatesAction, 
  pushAllUsersToClockAction, 
  runTotalSyncAction 
} from "../actions/user-biometric.action";
import { USER_CONFIG } from "../config/user.constants";

export const BiometricSyncContext = React.createContext({
  isSyncing: false,
  handleSyncAllBiometrics: async () => {},
});

export function BiometricSyncProvider({ children }) {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const { UI: { LABELS: { BIOMETRICS: { MESSAGES } } } } = USER_CONFIG;

  React.useEffect(() => {
    // Si se recarga la página en medio de un sync, leemos el estado.
    // Ojo: Si el server action crasheó, esto se podría quedar pegado hasta
    // que cierren la pestaña (sessionStorage). Para evitarlo, ponemos un timeout
    // de seguridad de 60 segundos si detecta que estaba sincronizando al cargar.
    const saved = sessionStorage.getItem('biometric_is_syncing');
    if (saved === 'true') {
      setIsSyncing(true);
      const timer = setTimeout(() => {
        setIsSyncing(false);
        sessionStorage.removeItem('biometric_is_syncing');
      }, 60000); // 60 segundos máximo de bloqueo en recarga
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSyncAllBiometrics = async (mode = "total") => {
    if (isSyncing) return;
    
    let toastId;
    try {
      setIsSyncing(true);
      sessionStorage.setItem('biometric_is_syncing', 'true');
      
      toastId = toast.loading(
        mode === "push" ? MESSAGES.PUSHING : 
        mode === "pull" ? MESSAGES.PULLING : 
        MESSAGES.SYNCING_TOTAL
      );

      let result;
      if (mode === "pull") {
        result = await syncAllClockTemplatesAction();
      } else if (mode === "push") {
        result = await pushAllUsersToClockAction();
      } else {
        result = await runTotalSyncAction();
      }

      if (result.success) {
        toast.success(
          mode === "push" ? MESSAGES.PUSH_SUCCESS : 
          mode === "pull" ? MESSAGES.PULL_SUCCESS : 
          MESSAGES.SYNC_SUCCESS,
          { id: toastId }
        );
      } else {
        toast.error(`${MESSAGES.SYNC_ERROR}${result.error}`, { id: toastId });
      }
    } catch (error) {
      toast.error(MESSAGES.SERVER_ERROR, { id: toastId });
    } finally {
      setIsSyncing(false);
      sessionStorage.removeItem('biometric_is_syncing');
    }
  };

  return (
    <BiometricSyncContext.Provider value={{ isSyncing, handleSyncAllBiometrics }}>
      {children}
    </BiometricSyncContext.Provider>
  );
}
