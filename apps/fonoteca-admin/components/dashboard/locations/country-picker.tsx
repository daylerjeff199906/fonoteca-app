"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import countries from "react-select-country-list"
import { cn } from "@/lib/utils"
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

interface CountryPickerProps {
  value?: string
  onChange: (country: { name: string; code: string }) => void
}

export function CountryPicker({ value, onChange }: CountryPickerProps) {
  const [open, setOpen] = React.useState(false)
  const options = React.useMemo(() => countries().getData(), [])

  // Find the label for the current value (which could be the code)
  const selectedCountry = options.find((option: { label: string; value: string }) => option.value === value || option.label === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent border-none shadow-none h-8 font-medium hover:bg-muted/10 px-2"
        >
          <span className="truncate">
            {selectedCountry ? (
                <span className="flex items-center gap-2">
                    <span className="text-lg">{getFlagEmoji(selectedCountry.value)}</span>
                    {selectedCountry.label}
                </span>
            ) : "Seleccionar país..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar país..." />
          <CommandList>
            <CommandEmpty>No se encontró país.</CommandEmpty>
            <CommandGroup>
              {options.map((option: { label: string; value: string }) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange({ name: option.label, code: option.value })
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      (option.value === value || option.label === value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{getFlagEmoji(option.value)}</span>
                    {option.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
