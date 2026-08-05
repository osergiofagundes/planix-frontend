import { useState } from "react"
import { CalendarIcon, XIcon } from "lucide-react"
import { ptBR } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { dateFromDayKey, dayKeyFromDate, formatLongDate } from "@/lib/date"

const EARLIEST_YEAR = 1900

const DEFAULT_AGE = 25

interface BirthDatePickerProps {
  id: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
}

export function BirthDatePicker({
  id,
  value,
  onChange,
  invalid,
}: BirthDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const today = new Date()
  const selected = value ? dateFromDayKey(value) : undefined

  const fallbackMonth = new Date(today.getFullYear() - DEFAULT_AGE, 0)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          id={id}
          aria-invalid={invalid}
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start font-normal"
            />
          }
        >
          <CalendarIcon data-icon="inline-start" />
          <span className={selected ? "truncate" : "text-muted-foreground"}>
            {selected ? formatLongDate(value) : "Selecionar data"}
          </span>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={ptBR}
            captionLayout="dropdown"
            startMonth={new Date(EARLIEST_YEAR, 0)}
            endMonth={today}
            disabled={{ after: today }}
            selected={selected}
            defaultMonth={selected ?? fallbackMonth}
            onSelect={(date) => {
              if (!date) {
                return
              }

              onChange(dayKeyFromDate(date))
              setIsOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Limpar a data de nascimento"
          onClick={() => onChange("")}
        >
          <XIcon />
        </Button>
      )}
    </div>
  )
}
