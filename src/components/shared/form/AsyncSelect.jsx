"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/features/shared/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormControl } from "@/components/ui/form"

// Utility hook for debouncing
function useDebouncedCallback(callback, delay) {
  const timeoutRef = React.useRef(null);

  return React.useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

/**
 * Componente Genérico de Selección Asíncrona.
 * 
 * @param {Object} props
 * @param {string|number} props.value - Valor seleccionado (ID).
 * @param {function} props.onChange - Callback al cambiar selección.
 * @param {function} props.fetcher - Función asíncrona que retorna array de opciones. (term) => Promise<Array>
 * @param {function} props.renderOption - Función para renderizar cada opción en la lista. (option) => ReactNode
 * @param {function} props.getLabel - Función para obtener el texto a mostrar en el input seleccionado. (option) => string
 * @param {function} props.getValue - Función para obtener el ID único de la opción. (option) => string|number
 * @param {string} props.placeholder - Placeholder del input.
 * @param {string} props.emptyMessage - Mensaje cuando no hay resultados.
 * @param {Object} props.initialData - Objeto completo de la opción inicial (para prellenar sin buscar).
 */
export function AsyncSelect({ 
  value, 
  onChange, 
  fetcher, 
  renderOption,
  getLabel = (opt) => opt.label || opt.nombre, // Default fallback
  getValue = (opt) => opt.value || opt.id,     // Default fallback
  placeholder = "Seleccionar...", 
  emptyMessage = "No se encontraron resultados.",
  initialData = null,
  useFormControl = true,
  triggerClassName,
  minSearchLength = 2,
  fetchOnOpen = false,
  initialQuery = "",
  allowEmptyQuery = false
}) {
  const [open, setOpen] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState(initialData)
  const [options, setOptions] = React.useState(initialData ? [initialData] : [])
  const [loading, setLoading] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const isMountedRef = React.useRef(true)
  
  // Sincronizar selectedOption si initialData cambia o si value coincide con alguna opción actual
  React.useEffect(() => {
    if (value && options.length > 0) {
      const found = options.find(opt => getValue(opt) === value)
      if (found) setSelectedOption(found)
    }
  }, [value, options, getValue])

  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Recuperar initialData si viene después (async loading del padre)
  React.useEffect(() => {
    if (!initialData) return
    setSelectedOption((prev) => {
      if (!prev || getValue(prev) !== getValue(initialData)) return initialData
      return prev
    })
    setOptions((prev) => {
      const exists = prev.some((p) => getValue(p) === getValue(initialData))
      return exists ? prev : [initialData, ...prev]
    })
  }, [initialData, getValue])

  const performSearch = React.useCallback(async (term) => {
    const nextQuery = typeof term === "string" ? term.trim() : ""
    const canSearchEmpty = allowEmptyQuery && nextQuery.length === 0
    const canSearchText = nextQuery.length >= minSearchLength

    if (!canSearchEmpty && !canSearchText) {
      return
    }

    setLoading(true)
    try {
      const results = await fetcher(nextQuery)
      if (!isMountedRef.current) return
      setOptions(results || [])
    } catch (error) {
      if (!isMountedRef.current) return
      console.error("AsyncSelect fetch error:", error)
      setOptions([])
    } finally {
      if (!isMountedRef.current) return
      setLoading(false)
    }
  }, [allowEmptyQuery, fetcher, minSearchLength])

  const handleSearch = useDebouncedCallback(performSearch, 300)

  // Mostrar la opción seleccionada
  const displayLabel = selectedOption && getValue(selectedOption) === value 
    ? getLabel(selectedOption) 
    : null

  // Cargar opciones iniciales al abrir si se solicita explícitamente
  React.useEffect(() => {
    if (!open) return
    if (!fetchOnOpen) return
    if (options.length > (initialData ? 1 : 0)) return
    if (query) return
    handleSearch(initialQuery)
  }, [fetchOnOpen, handleSearch, initialData, initialQuery, open, options.length, query])

  const TriggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      // Añadimos 'truncate' y quitamos flexibilidad si es necesario
      className={cn(
        "w-full justify-between overflow-hidden", 
        !value && "text-muted-foreground",
        triggerClassName
      )}
    >
      {/* Envolvemos el texto en un span con truncate */}
      <span className="truncate mr-2 text-left">
        {displayLabel || placeholder}
      </span>
      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {useFormControl ? (
          <FormControl>{TriggerButton}</FormControl>
        ) : (
          TriggerButton
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={`Buscar...`} 
            onValueChange={(val) => {
                setQuery(val)
                handleSearch(val)
            }}
          />
          <CommandList>
            {loading && (
                <div className="py-6 text-center text-sm text-muted-foreground flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                </div>
            )}
            {!loading && options.length === 0 && (
                <CommandEmpty>
                  {(!allowEmptyQuery && (query || "").trim().length < minSearchLength)
                    ? `Escribe al menos ${minSearchLength} caracteres.`
                    : emptyMessage}
                </CommandEmpty>
            )}
            <CommandGroup>
              {options.map((option) => {
                const optValue = getValue(option)
                const isSelected = value === optValue
                return (
                    <CommandItem
                    key={optValue}
                    value={String(optValue)} // CommandItem espera string en value
                    onSelect={() => {
                        setSelectedOption(option)
                        onChange(optValue === value ? "" : optValue)
                        setOpen(false)
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="cursor-pointer pointer-events-auto data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                    >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                        )}
                    />
                    {renderOption ? renderOption(option) : getLabel(option)}
                    </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
