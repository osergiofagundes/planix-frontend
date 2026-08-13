import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BoardVisibility } from "@/types/board.types"

const OPTIONS = [
  {
    value: "TEAM" as const,
    label: "Toda a equipe",
    hint: "Qualquer membro da equipe entra neste quadro.",
  },
  {
    value: "RESTRICTED" as const,
    label: "Somente convidados",
    hint: "Só entra quem você adicionar como membro do quadro.",
  },
]

interface BoardVisibilityFieldProps {
  id: string
  value: BoardVisibility
  onChange: (value: BoardVisibility) => void
}

export function BoardVisibilityField({
  id,
  value,
  onChange,
}: BoardVisibilityFieldProps) {
  const selected =
    OPTIONS.find((option) => option.value === value) ?? OPTIONS[0]

  return (
    <Field>
      <FieldLabel htmlFor={id}>Quem vê este quadro</FieldLabel>
      <Select
        items={OPTIONS}
        value={value}
        onValueChange={(next) => onChange(next as BoardVisibility)}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldDescription>{selected.hint}</FieldDescription>
    </Field>
  )
}
