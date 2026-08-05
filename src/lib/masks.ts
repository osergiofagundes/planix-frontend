const COUNTRY_CODE = "55"
const PHONE_PREFIX = `+${COUNTRY_CODE} `

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}

export function countDigits(value: string): number {
  return onlyDigits(value).length
}

function toLocalDigits(value: string): string {
  const withoutPrefix = value.startsWith(PHONE_PREFIX)
    ? value.slice(PHONE_PREFIX.length)
    : value

  const digits = onlyDigits(withoutPrefix)

  const local =
    (digits.length === 12 || digits.length === 13) &&
    digits.startsWith(COUNTRY_CODE)
      ? digits.slice(COUNTRY_CODE.length)
      : digits

  return local.slice(0, 11)
}

export function maskPhone(value: string): string {
  const digits = toLocalDigits(value)

  if (digits.length === 0) {
    return ""
  }

  const areaCode = digits.slice(0, 2)

  if (digits.length <= 2) {
    return `+55 (${areaCode}`
  }

  const splitAt = digits.length > 10 ? 7 : 6
  const firstPart = digits.slice(2, splitAt)
  const lastPart = digits.slice(splitAt)

  if (lastPart.length === 0) {
    return `+55 (${areaCode}) ${firstPart}`
  }

  return `+55 (${areaCode}) ${firstPart}-${lastPart}`
}

export function maskZipCode(value: string): string {
  const digits = onlyDigits(value).slice(0, 8)

  if (digits.length <= 5) {
    return digits
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function phoneDigitCount(value: string): number {
  const local = toLocalDigits(value)

  return local.length === 0 ? 0 : COUNTRY_CODE.length + local.length
}
