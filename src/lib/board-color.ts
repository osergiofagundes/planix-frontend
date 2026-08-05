import { LABEL_COLORS } from "@/lib/label-colors"

const BOARD_SWATCHES = LABEL_COLORS.filter((color) => color.value !== "slate")

export function boardSwatchClassName(boardId: number): string {
  const index = Math.abs(boardId) % BOARD_SWATCHES.length
  return BOARD_SWATCHES[index].swatchClassName
}
