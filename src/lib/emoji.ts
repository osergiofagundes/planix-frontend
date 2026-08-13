import {
  EMOJI_DATA,
  type EmojiCategoryId,
  type EmojiEntry,
} from "@/lib/emoji-data"

export interface EmojiCategory {
  id: EmojiCategoryId
  label: string
  /** Emoji representativo, usado como ícone na navegação. */
  icon: string
}

export const EMOJI_CATEGORIES: readonly EmojiCategory[] = [
  { id: "smileys_people", label: "Pessoas e corpo", icon: "😀" },
  { id: "animals_nature", label: "Animais e natureza", icon: "🐶" },
  { id: "food_drink", label: "Comida e bebida", icon: "🍔" },
  { id: "travel_places", label: "Viagens e lugares", icon: "✈️" },
  { id: "activities", label: "Atividades", icon: "⚽" },
  { id: "objects", label: "Objetos", icon: "💡" },
  { id: "symbols", label: "Símbolos", icon: "❤️" },
  { id: "flags", label: "Bandeiras", icon: "🏳️" },
]

export function emojisOf(category: EmojiCategoryId): readonly EmojiEntry[] {
  return EMOJI_DATA[category]
}

/**
 * Tira acento e caixa. Mais da metade das palavras-chave é acentuada, então sem
 * isso quem digita "coracao" ou "simbolo" não acha nada.
 */
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
}

const FOLDED_INDEX: readonly (readonly [EmojiEntry, string])[] =
  EMOJI_CATEGORIES.flatMap((category) =>
    EMOJI_DATA[category.id].map(
      (entry) =>
        [entry, fold(`${entry[1]} ${entry[2]}`)] as readonly [
          EmojiEntry,
          string,
        ]
    )
  )

/** Vazio para busca em branco — quem chama mostra as categorias nesse caso. */
export function searchEmojis(query: string): readonly EmojiEntry[] {
  const needle = fold(query.trim())

  if (!needle) {
    return []
  }

  return FOLDED_INDEX.filter(([, haystack]) => haystack.includes(needle)).map(
    ([entry]) => entry
  )
}
