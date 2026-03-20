import { cn } from "@/features/shared/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { LoginFields } from "./LoginFields"

/**
 * Contenedor principal de la página de Login.
 * Implementa el patrón de diseño de tarjeta con imagen lateral.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {string} [props.className] - Clases CSS adicionales.
 */
export function LoginForm({ className, ...props }) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <LoginFields className="p-6 md:p-8" />
          <div className="bg-muted relative hidden md:block">
            <img
              src="/login-bg.jpg"
              alt="Login Background"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
