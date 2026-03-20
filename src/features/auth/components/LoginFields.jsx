'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../schemas/login.schema'
import { loginAction } from '../actions/auth-login.action'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { CustomFormField } from '@/components/shared/form/CustomFormField'
import { Loader2 } from 'lucide-react'
import { cn, toFormData } from '@/features/shared/lib/utils'
import { toast } from 'sonner'
import { loginFormConfig } from '../config/login-form.config'

/**
 * Componente que maneja la lógica del formulario de login.
 * Refactorizado para usar React Hook Form + Zod + Config-Driven UI.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {string} [props.className] - Clases adicionales de estilo.
 */
export function LoginFields({ className }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      cedula: '',
      password: ''
    }
  })

  // Configuración de campos (Config-Driven UI)
  const formConfig = loginFormConfig;

  async function onSubmit(values) {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const formData = toFormData(values)

      const result = await loginAction(null, formData)

      if (result?.error) {
        if (result.details) {
           // Errores de validación del servidor (si los hubiera)
           Object.entries(result.details).forEach(([field, messages]) => {
             form.setError(field, { type: 'server', message: messages[0] })
           })
        } else {
           // Error general (credenciales incorrectas, etc.)
           setServerError(result.error)
           toast.error(result.error)
        }
      } else if (result?.success) {
        toast.success('Bienvenido al sistema')
        router.push('/')
      }
      
    } catch (error) {
      console.error(error)
      setServerError('Error inesperado al iniciar sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Bienvenido</h1>
        <p className="text-muted-foreground text-balance text-sm">
          Ingresa tu cédula para acceder al sistema
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          {formConfig.map((field) => (
            <CustomFormField
              key={field.name}
              control={form.control}
              name={field.name}
              label={field.label}
              placeholder={field.placeholder}
              type={field.type}
            />
          ))}

          {serverError && (
            <div className="text-sm text-destructive font-medium text-center">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ingresar
          </Button>
        </form>
      </Form>
    </div>
  )
}
