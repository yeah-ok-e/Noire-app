import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    const parsed = parseISO(date)
    if (!isValid(parsed)) return '—'
    return format(parsed, 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

export function formatRelativeTime(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    const parsed = parseISO(date)
    if (!isValid(parsed)) return '—'
    return formatDistanceToNow(parsed, { addSuffix: true })
  } catch {
    return '—'
  }
}

export function formatShortDate(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    const parsed = parseISO(date)
    if (!isValid(parsed)) return '—'
    return format(parsed, 'MMM d')
  } catch {
    return '—'
  }
}

export function formatTime(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    const parsed = parseISO(date)
    if (!isValid(parsed)) return '—'
    return format(parsed, 'h:mm a')
  } catch {
    return '—'
  }
}

export function formatDateInput(date: string | null | undefined): string {
  if (!date) return ''
  try {
    const parsed = parseISO(date)
    if (!isValid(parsed)) return ''
    return format(parsed, 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

export function getCashColor(amount: number): string {
  if (amount < 500) return 'text-crisis'
  if (amount < 2000) return 'text-yellow-500'
  return 'text-green-500'
}

export function getSurvivalRunway(cashAmount: number, monthlyObligations: number): number {
  if (monthlyObligations <= 0) return 999
  const dailyBurn = monthlyObligations / 30
  return Math.floor(cashAmount / dailyBurn)
}
