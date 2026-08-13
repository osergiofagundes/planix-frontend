const SIZE_UNITS = ["B", "KB", "MB", "GB"] as const

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "—"
  }

  let value = bytes
  let unit = 0

  while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
    value /= 1024
    unit += 1
  }

  const fractionDigits = unit === 0 ? 0 : 1

  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })} ${SIZE_UNITS[unit]}`
}

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".")

  if (dot <= 0 || dot === filename.length - 1) {
    return "—"
  }

  return filename
    .slice(dot + 1)
    .toUpperCase()
    .slice(0, 4)
}

export function getUrlHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
