import { useState } from "react"
import { CalendarIcon, XIcon } from "lucide-react"
import { ptBR } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useUpdateCard } from "@/hooks/use-card"
import {
  dateFromDayKey,
  dayKeyFromDate,
  formatLongDate,
  fromDateTimeLocalValue,
  isOverdue,
  toDateTimeLocalValue,
} from "@/lib/date"
import type { CardResponse } from "@/types/card.types"

const DEFAULT_TIME = "23:59"

interface CardDueDateFieldProps {
  card: CardResponse
}

export function CardDueDateField({ card }: CardDueDateFieldProps) {
  const [value, setValue] = useState(() => toDateTimeLocalValue(card.dueDate))
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const updateCard = useUpdateCard(card)

  const overdue = !card.completed && isOverdue(card.dueDate)
  const [datePart = "", timePart = ""] = value.split("T")
  const selectedDate = datePart ? dateFromDayKey(datePart) : undefined

  function commit(nextValue: string) {
    const isoValue = fromDateTimeLocalValue(nextValue)

    if (isoValue === card.dueDate) {
      return
    }

    updateCard.mutate({ dueDate: isoValue })
  }

  function selectDate(date: Date | undefined) {
    if (!date) {
      return
    }

    const nextValue = `${dayKeyFromDate(date)}T${timePart || DEFAULT_TIME}`

    setValue(nextValue)
    setIsPickerOpen(false)
    commit(nextValue)
  }

  function commitTime() {
    const nextValue = `${datePart}T${timePart || DEFAULT_TIME}`

    setValue(nextValue)
    commit(nextValue)
  }

  function clear() {
    setValue("")
    updateCard.mutate({ dueDate: null })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        Vencimento
      </span>

      <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start font-normal"
            />
          }
          aria-label="Vencimento do cartão"
          aria-invalid={overdue}
          disabled={updateCard.isPending}
        >
          <CalendarIcon data-icon="inline-start" />
          <span className={datePart ? "truncate" : "text-muted-foreground"}>
            {datePart ? formatLongDate(value) : "Sem vencimento"}
          </span>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selectedDate}
            defaultMonth={selectedDate}
            onSelect={selectDate}
          />
        </PopoverContent>
      </Popover>

      {datePart && (
        <div className="flex items-center gap-1">
          <Input
            type="time"
            className="flex-1"
            aria-label="Hora do vencimento"
            disabled={updateCard.isPending}
            value={timePart}
            onChange={(event) => setValue(`${datePart}T${event.target.value}`)}
            onBlur={commitTime}
          />

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Limpar vencimento"
            disabled={updateCard.isPending}
            onClick={clear}
          >
            <XIcon />
          </Button>
        </div>
      )}

      {overdue && <p className="text-xs text-destructive">Vencido</p>}
    </div>
  )
}
