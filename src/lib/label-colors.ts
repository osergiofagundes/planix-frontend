export interface LabelColor {
  value: string
  label: string
  badgeClassName: string
  swatchClassName: string
}

export const LABEL_COLORS: readonly LabelColor[] = [
  {
    value: "slate",
    label: "Cinza",
    badgeClassName: "bg-label-slate/15 text-label-slate",
    swatchClassName: "bg-label-slate",
  },
  {
    value: "red",
    label: "Vermelho",
    badgeClassName: "bg-label-red/15 text-label-red",
    swatchClassName: "bg-label-red",
  },
  {
    value: "orange",
    label: "Laranja",
    badgeClassName: "bg-label-orange/15 text-label-orange",
    swatchClassName: "bg-label-orange",
  },
  {
    value: "amber",
    label: "Âmbar",
    badgeClassName: "bg-label-amber/15 text-label-amber",
    swatchClassName: "bg-label-amber",
  },
  {
    value: "green",
    label: "Verde",
    badgeClassName: "bg-label-green/15 text-label-green",
    swatchClassName: "bg-label-green",
  },
  {
    value: "teal",
    label: "Turquesa",
    badgeClassName: "bg-label-teal/15 text-label-teal",
    swatchClassName: "bg-label-teal",
  },
  {
    value: "blue",
    label: "Azul",
    badgeClassName: "bg-label-blue/15 text-label-blue",
    swatchClassName: "bg-label-blue",
  },
  {
    value: "violet",
    label: "Roxo",
    badgeClassName: "bg-label-violet/15 text-label-violet",
    swatchClassName: "bg-label-violet",
  },
  {
    value: "pink",
    label: "Rosa",
    badgeClassName: "bg-label-pink/15 text-label-pink",
    swatchClassName: "bg-label-pink",
  },
]

export const DEFAULT_LABEL_COLOR = LABEL_COLORS[0]

export function resolveLabelColor(color: string | null | undefined): LabelColor {
  return (
    LABEL_COLORS.find((option) => option.value === color) ?? DEFAULT_LABEL_COLOR
  )
}
