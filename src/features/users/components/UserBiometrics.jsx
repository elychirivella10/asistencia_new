"use client";

import { useState, useEffect, useTransition } from "react";
import { Fingerprint, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { USER_CONFIG } from "../config/user.constants";
import { 
  getUserFingerprintsAction, 
  deleteFingerprintAction
} from "../actions/user-biometric.action";

export function UserBiometrics({ user }) {
  const [fingerprints, setFingerprints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, startTransition] = useTransition();
  const { BIOMETRICS } = USER_CONFIG.UI.LABELS;

  // Cargar huellas al abrir
  useEffect(() => {
    loadFingerprints();
  }, [user.id]);

  async function loadFingerprints() {
    setIsLoading(true);
    const result = await getUserFingerprintsAction(user.id);
    if (result.success) {
      setFingerprints(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }

  // Acción: Borrar huella
  const handleDeleteFinger = (fingerIndex) => {
    startTransition(async () => {
      const result = await deleteFingerprintAction(user.biometric_id, fingerIndex, user.id);
      if (result.success) {
        toast.success("Huella eliminada correctamente.");
        loadFingerprints(); // Recargar lista
      } else {
        toast.error(`Error al borrar: ${result.error}`);
      }
    });
  };

  // Mapeo de dedos (del 0 al 9)
  const allFingers = Array.from({ length: 10 }, (_, i) => ({
    index: i,
    label: getFingerLabel(i),
    isRegistered: fingerprints.some(f => f.finger_index === i)
  }));

  function getFingerLabel(index) {
    const labels = {
      0: "Meñique Izquierdo", 1: "Anular Izquierdo", 2: "Medio Izquierdo", 
      3: "Índice Izquierdo", 4: "Pulgar Izquierdo", 5: "Pulgar Derecho", 
      6: "Índice Derecho", 7: "Medio Derecho", 8: "Anular Derecho", 9: "Meñique Derecho"
    };
    return labels[index];
  }

  return (
    <div className="space-y-6">
      {/* Información de Identidad */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-dashed text-xs text-muted-foreground">
        <span>ID Biométrico: {user.biometric_id || "No vinculado"}</span>
        <span>{fingerprints.length} huellas registradas</span>
      </div>

      {/* Fingers List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isLoading ? (
          <div className="col-span-2 py-10 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          allFingers.map((finger) => (
            <div 
              key={finger.index} 
              className={`flex items-center justify-between p-3 rounded-md border ${
                finger.isRegistered ? 'bg-primary/5 border-primary/20' : 'bg-background'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${finger.isRegistered ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Fingerprint className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{finger.label}</p>
                  <p className={`text-xs ${finger.isRegistered ? 'text-primary' : 'text-muted-foreground'}`}>
                    {finger.isRegistered ? BIOMETRICS.REGISTERED : BIOMETRICS.NOT_REGISTERED}
                  </p>
                </div>
              </div>
              
              {finger.isRegistered && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteFinger(finger.index)}
                  disabled={isActionPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
        Sincronización Automática Activa
      </p>
    </div>
  );
}
