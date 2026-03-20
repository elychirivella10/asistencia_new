import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

/**
 * Alerta de error genérica.
 * @param {Object} props
 * @param {string} [props.title="Error Crítico"] - Título de la alerta.
 * @param {string} [props.message] - Mensaje descriptivo del error.
 */
export function ErrorAlert({ 
  title = "Error Crítico", 
  message = "No se pudieron cargar los datos. Por favor, verifique la conexión o intente nuevamente." 
}) {
  return (
    <div className="p-6">
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {message}
        </AlertDescription>
      </Alert>
    </div>
  );
}
