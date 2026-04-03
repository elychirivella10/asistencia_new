"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/features/shared/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormControl } from "@/components/ui/form"

function useDebouncedCallback(callback, delay) {
  const timeoutRef = React.useRef(null);
  return React.useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { callback(...args); }, delay);
  }, [callback, delay]);
}

export function AsyncMultiSelect({ 
  value = [], 
  onChange, 
  fetcher, 
  renderOption,
  getLabel = (opt) => opt.label || opt.nombre, 
  getValue = (opt) => opt.value || opt.id,     
  placeholder = "Seleccionar...", 
  emptyMessage = "No se encontraron resultados.",
  initialData = [], 
  useFormControl = true,
  triggerClassName,
  minSearchLength = 0,
  fetchOnOpen = false,
  initialQuery = "",
  allowEmptyQuery = false
}) {
  const [open, setOpen] = React.useState(false)
  const [selectedOptions, setSelectedOptions] = React.useState(Array.isArray(initialData) ? initialData : [])
  const [options, setOptions] = React.useState(Array.isArray(initialData) ? initialData.filter(o => o.id !== 'ALL') : [])
  const [loading, setLoading] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const isMountedRef = React.useRef(true)

  const selectedValues = Array.isArray(value) ? value : []

  React.useEffect(() => {
    if (selectedValues.length && options.length > 0) {
      const selectedMap = selectedValues.map(val => {
        const existing = selectedOptions.find(opt => getValue(opt) === val)
        if (existing) return existing
        return options.find(opt => getValue(opt) === val)
      }).filter(Boolean)
      setSelectedOptions(selectedMap)
    } else if (selectedValues.length === 0) {
      setSelectedOptions([])
    }
  }, [value, options, getValue])

  React.useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

  const performSearch = React.useCallback(async (term) => {
    const nextQuery = typeof term === "string" ? term.trim() : ""
    const canSearchEmpty = allowEmptyQuery && nextQuery.length === 0
    const canSearchText = nextQuery.length >= minSearchLength

    if (!canSearchEmpty && !canSearchText) {
      if (!isMountedRef.current) return;
      setOptions(selectedOptions);
      return;
    }

    setLoading(true)
    try {
      let results = await fetcher(nextQuery)
      if (!isMountedRef.current) return
      
      results = results.filter(r => getValue(r) !== 'ALL')
      
      const newOptions = [...results];
      selectedOptions.forEach(selected => {
         if(!newOptions.some(opt => getValue(opt) === getValue(selected))) {
            newOptions.unshift(selected)
         }
      })
      setOptions(newOptions)
    } catch (error) {
      if (!isMountedRef.current) return
      setOptions(selectedOptions)
    } finally {
      if (!isMountedRef.current) return
      setLoading(false)
    }
  }, [allowEmptyQuery, fetcher, minSearchLength, selectedOptions, getValue])

  const handleSearch = useDebouncedCallback(performSearch, 300)

  React.useEffect(() => {
    if (!open || !fetchOnOpen || query) return
    handleSearch(initialQuery)
  }, [fetchOnOpen, handleSearch, initialQuery, open, query])

  const toggleOption = (option) => {
    const val = getValue(option)
    const isSelected = selectedValues.includes(val)
    let newValues;
    let newSelectedOptions;
    
    if (isSelected) {
      newValues = selectedValues.filter(v => v !== val)
      newSelectedOptions = selectedOptions.filter(opt => getValue(opt) !== val)
    } else {
      newValues = [...selectedValues, val]
      newSelectedOptions = [...selectedOptions, option]
    }
    
    setSelectedOptions(newSelectedOptions)
    if (onChange) onChange(newValues)
  }

  const selectAll = () => {
    if (selectedValues.length === options.length) {
      setSelectedOptions([])
      if (onChange) onChange([])
    } else {
      setSelectedOptions([...options])
      if (onChange) onChange(options.map(o => getValue(o)))
    }
  }

  const listboxId = React.useId()

  const TriggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      aria-controls={listboxId}
      className={cn(
        "w-full justify-between h-auto min-h-9 py-1.5 px-3 bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-background/80 overflow-hidden", 
        !selectedValues.length && "text-muted-foreground",
        triggerClassName
      )}
    >
      <div className="flex flex-wrap gap-1 items-center flex-1 max-w-[calc(100%-20px)] overflow-hidden">
        {selectedValues.length === 0 ? (
          <span className="truncate">{placeholder}</span>
        ) : selectedValues.length > 2 ? (
          <Badge variant="secondary" className="rounded-sm px-1.5 font-normal h-5 border-none bg-muted hover:bg-muted">
            {selectedValues.length} seleccionados
          </Badge>
        ) : (
          selectedOptions.map((opt) => (
            <Badge key={getValue(opt)} variant="secondary" className="rounded-sm px-1.5 font-normal truncate max-w-[120px] h-5 border-none bg-muted hover:bg-muted">
              {getLabel(opt)}
            </Badge>
          ))
        )}
      </div>
      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {useFormControl ? <FormControl>{TriggerButton}</FormControl> : TriggerButton}
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 shadow-lg" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            value={query}
            placeholder={`Buscar...`} 
            className="border-none focus:ring-0"
            onValueChange={(val) => {
                setQuery(val)
                handleSearch(val)
            }}
          />
          <CommandList id={listboxId}>
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
              {!loading && options.length > 0 && (
                <>
                  <CommandItem
                    value="selectAll"
                    onSelect={selectAll}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="cursor-pointer font-medium mb-1 pointer-events-auto data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                  >
                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/50", selectedValues.length === options.length ? "bg-primary border-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                      <Check className="h-3 w-3" />
                    </div>
                    Seleccionar todos
                  </CommandItem>
                  <CommandSeparator className="my-1 border-muted" />
                </>
              )}
              {options.map((option) => {
                const optValue = getValue(option)
                const isSelected = selectedValues.includes(optValue)
                return (
                    <CommandItem
                      key={String(optValue)}
                      value={String(optValue)}
                      onSelect={() => toggleOption(option)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="cursor-pointer pointer-events-auto data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                    >
                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/50 transition-colors", isSelected ? "bg-primary border-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                      <Check className="h-3 w-3" />
                    </div>
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
