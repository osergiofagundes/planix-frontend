import { useEffect, useMemo, useRef, useState } from "react"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  EMOJI_CATEGORIES,
  emojisOf,
  searchEmojis,
  type EmojiCategory,
} from "@/lib/emoji"
import type { EmojiCategoryId, EmojiEntry } from "@/lib/emoji-data"
import { cn } from "@/lib/utils"

const COLUMNS = 8
/** Altura de um botão `size="icon-sm"` (h-7) mais o gap do grid. */
const ROW_HEIGHT = 30
const HEADER_HEIGHT = 28

interface EmojiPickerProps {
  onPick: (emoji: string) => void
}

export default function EmojiPicker({ onPick }: EmojiPickerProps) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<EmojiCategoryId>(
    EMOJI_CATEGORIES[0].id
  )

  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef(new Map<EmojiCategoryId, HTMLElement>())

  const results = useMemo(() => searchEmojis(query), [query])
  const isSearching = query.trim().length > 0

  useScrollSpy({
    scrollRef,
    sectionRefs,
    enabled: !isSearching,
    onChange: setActiveCategory,
  })

  function goToCategory(id: EmojiCategoryId) {
    setActiveCategory(id)
    sectionRefs.current.get(id)?.scrollIntoView({ block: "start" })
  }

  return (
    <div className="flex w-64 flex-col gap-2">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          autoFocus
          value={query}
          placeholder="Buscar emoji…"
          aria-label="Buscar emoji"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault()
              focusEmojiAt(scrollRef.current, 0)
            }
          }}
        />
      </InputGroup>

      {!isSearching && (
        <nav
          aria-label="Categorias de emoji"
          className="flex items-center justify-between"
        >
          {EMOJI_CATEGORIES.map((category) => (
            <CategoryButton
              key={category.id}
              category={category}
              isActive={category.id === activeCategory}
              onSelect={() => goToCategory(category.id)}
            />
          ))}
        </nav>
      )}

      <div
        ref={scrollRef}
        className="h-56 overflow-y-auto overscroll-contain"
        onKeyDown={(event) => handleGridKeyDown(event, scrollRef.current)}
      >
        {isSearching ? (
          results.length > 0 ? (
            <EmojiGrid emojis={results} onPick={onPick} isFirstGrid />
          ) : (
            <Empty className="py-6">
              <EmptyHeader>
                <EmptyTitle className="text-xs">
                  Nenhum emoji encontrado
                </EmptyTitle>
              </EmptyHeader>
            </Empty>
          )
        ) : (
          EMOJI_CATEGORIES.map((category, index) => (
            <CategorySection
              key={category.id}
              category={category}
              onPick={onPick}
              isFirstGrid={index === 0}
              ref={(node) => {
                if (node) {
                  sectionRefs.current.set(category.id, node)
                } else {
                  sectionRefs.current.delete(category.id)
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface CategoryButtonProps {
  category: EmojiCategory
  isActive: boolean
  onSelect: () => void
}

function CategoryButton({ category, isActive, onSelect }: CategoryButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      title={category.label}
      aria-label={category.label}
      aria-current={isActive ? "true" : undefined}
      onClick={onSelect}
      className={cn(isActive && "bg-accent")}
    >
      <span className="text-sm leading-none">{category.icon}</span>
    </Button>
  )
}

interface CategorySectionProps {
  category: EmojiCategory
  onPick: (emoji: string) => void
  isFirstGrid: boolean
  ref: (node: HTMLElement | null) => void
}

function CategorySection({
  category,
  onPick,
  isFirstGrid,
  ref,
}: CategorySectionProps) {
  const emojis = emojisOf(category.id)
  const rows = Math.ceil(emojis.length / COLUMNS)

  return (
    <section
      ref={ref}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: `auto ${HEADER_HEIGHT + rows * ROW_HEIGHT}px`,
      }}
    >
      <h4 className="sticky top-0 z-10 bg-popover py-1 text-xs font-medium text-muted-foreground">
        {category.label}
      </h4>
      <EmojiGrid emojis={emojis} onPick={onPick} isFirstGrid={isFirstGrid} />
    </section>
  )
}

interface EmojiGridProps {
  emojis: readonly EmojiEntry[]
  onPick: (emoji: string) => void
  /** Só o primeiro emoji do painel inteiro entra na ordem do Tab. */
  isFirstGrid: boolean
}

function EmojiGrid({ emojis, onPick, isFirstGrid }: EmojiGridProps) {
  return (
    <div className="grid grid-cols-8 gap-0.5">
      {emojis.map(([char, name], index) => (
        <Button
          key={char}
          data-emoji
          variant="ghost"
          size="icon-sm"
          title={name}
          aria-label={name}
          tabIndex={isFirstGrid && index === 0 ? 0 : -1}
          onClick={() => onPick(char)}
        >
          <span className="text-base leading-none">{char}</span>
        </Button>
      ))}
    </div>
  )
}

const ARROW_STEPS: Record<string, number> = {
  ArrowRight: 1,
  ArrowLeft: -1,
  ArrowDown: COLUMNS,
  ArrowUp: -COLUMNS,
}

function emojiButtons(container: HTMLElement | null): HTMLButtonElement[] {
  return Array.from(container?.querySelectorAll("[data-emoji]") ?? [])
}

function focusEmojiAt(container: HTMLElement | null, index: number) {
  emojiButtons(container).at(index)?.focus()
}

function handleGridKeyDown(
  event: React.KeyboardEvent<HTMLElement>,
  container: HTMLElement | null
) {
  const step = ARROW_STEPS[event.key]

  if (step === undefined) {
    return
  }

  const buttons = emojiButtons(container)
  const current = buttons.indexOf(event.target as HTMLButtonElement)

  if (current === -1) {
    return
  }

  const next = current + step

  if (next < 0 || next >= buttons.length) {
    return
  }

  event.preventDefault()
  buttons[next].focus()
}

interface ScrollSpyOptions {
  scrollRef: React.RefObject<HTMLDivElement | null>
  sectionRefs: React.RefObject<Map<EmojiCategoryId, HTMLElement>>
  enabled: boolean
  onChange: (id: EmojiCategoryId) => void
}

/** Acende no menu a categoria que está no topo da área visível. */
function useScrollSpy({
  scrollRef,
  sectionRefs,
  enabled,
  onChange,
}: ScrollSpyOptions) {
  useEffect(() => {
    const root = scrollRef.current

    if (!enabled || !root) {
      return
    }

    const sections = [...sectionRefs.current.entries()]
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0]

        if (!top) {
          return
        }

        const match = sections.find(([, node]) => node === top.target)
        if (match) {
          onChange(match[0])
        }
      },
      { root, rootMargin: "0px 0px -85% 0px" }
    )

    for (const [, node] of sections) {
      observer.observe(node)
    }

    return () => observer.disconnect()
  }, [scrollRef, sectionRefs, enabled, onChange])
}
