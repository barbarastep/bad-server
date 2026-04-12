import escapeRegExp from './escapeRegExp'

export function getSingleQueryValue(value: unknown) {
    if (typeof value !== 'string') {
        return undefined
    }

    const trimmedValue = value.trim()

    return trimmedValue.length ? trimmedValue : undefined
}

export function getNumberQueryValue(
    value: unknown,
    fallback: number,
    options: { min?: number; max?: number } = {}
) {
    const stringValue = getSingleQueryValue(value)
    const parsedValue = stringValue ? Number(stringValue) : fallback

    if (!Number.isFinite(parsedValue)) {
        return fallback
    }

    const min = options.min ?? Number.MIN_SAFE_INTEGER
    const max = options.max ?? Number.MAX_SAFE_INTEGER

    return Math.min(Math.max(parsedValue, min), max)
}

export function getDateQueryValue(value: unknown) {
    const stringValue = getSingleQueryValue(value)

    if (!stringValue) {
        return undefined
    }

    const parsedDate = new Date(stringValue)

    if (Number.isNaN(parsedDate.getTime())) {
        return undefined
    }

    return parsedDate
}

export function getSafeSearchRegex(value: unknown, maxLength = 80) {
    const stringValue = getSingleQueryValue(value)

    if (!stringValue) {
        return undefined
    }

    const normalizedValue = stringValue.slice(0, maxLength)

    return new RegExp(escapeRegExp(normalizedValue), 'i')
}
