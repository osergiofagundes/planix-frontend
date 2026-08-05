interface Positioned {
  position: number
}

export function withPositions<T extends Positioned>(items: readonly T[]): T[] {
  return items.map((item, index) =>
    item.position === index ? item : { ...item, position: index }
  )
}

export function moveWithin<T extends Positioned>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number
): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    fromIndex === toIndex
  ) {
    return withPositions(items)
  }

  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(clamp(toIndex, 0, next.length), 0, moved)

  return withPositions(next)
}

export function moveBetween<T extends Positioned>(
  source: readonly T[],
  target: readonly T[],
  fromIndex: number,
  toIndex: number
): { source: T[]; target: T[] } {
  if (fromIndex < 0 || fromIndex >= source.length) {
    return { source: withPositions(source), target: withPositions(target) }
  }

  const nextSource = [...source]
  const [moved] = nextSource.splice(fromIndex, 1)

  const nextTarget = [...target]
  nextTarget.splice(clamp(toIndex, 0, nextTarget.length), 0, moved)

  return {
    source: withPositions(nextSource),
    target: withPositions(nextTarget),
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
