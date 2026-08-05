const DATE_TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const LONG_DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

const SHORT_DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
})

const TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
})

const RELATIVE_FORMAT = new Intl.RelativeTimeFormat("pt-BR", {
  numeric: "auto",
})

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function parse(value: string | null | undefined): Date | null {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export function formatLongDate(value: string | null | undefined): string {
  const date = parse(value)
  return date ? LONG_DATE_FORMAT.format(date) : "—"
}

export function formatDateTime(value: string | null | undefined): string {
  const date = parse(value)
  return date ? DATE_TIME_FORMAT.format(date) : "—"
}

export function formatTime(value: string | null | undefined): string {
  const date = parse(value)
  return date ? TIME_FORMAT.format(date) : "—"
}

export function formatRelativeTime(value: string | null | undefined): string {
  const date = parse(value)

  if (!date) {
    return "—"
  }

  const diff = date.getTime() - Date.now()
  const absolute = Math.abs(diff)

  if (absolute < MINUTE) {
    return "agora"
  }

  if (absolute < HOUR) {
    return RELATIVE_FORMAT.format(Math.round(diff / MINUTE), "minute")
  }

  if (absolute < DAY) {
    return RELATIVE_FORMAT.format(Math.round(diff / HOUR), "hour")
  }

  if (absolute < 30 * DAY) {
    return RELATIVE_FORMAT.format(Math.round(diff / DAY), "day")
  }

  return SHORT_DATE_FORMAT.format(date)
}

export function formatDueDate(value: string | null | undefined): string {
  const date = parse(value)

  if (!date) {
    return "—"
  }

  const days = differenceInCalendarDays(date, new Date())

  if (days === 0) {
    return "Hoje"
  }

  if (days === 1) {
    return "Amanhã"
  }

  if (days === -1) {
    return "Ontem"
  }

  if (date.getFullYear() !== new Date().getFullYear()) {
    return LONG_DATE_FORMAT.format(date)
  }

  return SHORT_DATE_FORMAT.format(date)
}

export function isOverdue(value: string | null | undefined): boolean {
  const date = parse(value)
  return date !== null && date.getTime() < Date.now()
}

export function differenceInCalendarDays(left: Date, right: Date): number {
  const startOfLeft = new Date(
    left.getFullYear(),
    left.getMonth(),
    left.getDate()
  )
  const startOfRight = new Date(
    right.getFullYear(),
    right.getMonth(),
    right.getDate()
  )

  return Math.round((startOfLeft.getTime() - startOfRight.getTime()) / DAY)
}

export function toDateTimeLocalValue(value: string | null | undefined): string {
  const date = parse(value)

  if (!date) {
    return ""
  }

  const pad = (part: number) => String(part).padStart(2, "0")

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

export function fromDateTimeLocalValue(value: string): string | null {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function formatDayHeading(value: string | null | undefined): string {
  const date = parse(value)

  if (!date) {
    return "—"
  }

  const days = differenceInCalendarDays(date, new Date())

  if (days === 0) {
    return "Hoje"
  }

  if (days === -1) {
    return "Ontem"
  }

  return SHORT_DATE_FORMAT.format(date)
}

export function toDayKey(value: string | null | undefined): string {
  const date = parse(value)

  if (!date) {
    return "sem-data"
  }

  const pad = (part: number) => String(part).padStart(2, "0")

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
