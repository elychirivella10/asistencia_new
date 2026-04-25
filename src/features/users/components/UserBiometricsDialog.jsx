"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserBiometrics } from "./UserBiometrics";
import { Fingerprint } from "lucide-react";

export function UserBiometricsDialog({ user, open, onOpenChange }) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Fingerprint className="h-5 w-5" />
            </div>
            <DialogTitle>Gestión Biométrica</DialogTitle>
          </div>
          <DialogDescription>
            Administra las huellas de <strong>{user.nombre} {user.apellido}</strong> directamente en el reloj biométrico.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <UserBiometrics user={user} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
