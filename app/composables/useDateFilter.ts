import type { DatePeriodPreset } from '~/types'

function toYmd(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseYmd(s: string) {
  const parts = s.split('-').map(Number)
  const y = parts[0] ?? 0
  const m = parts[1] ?? 1
  const d = parts[2] ?? 1
  return new Date(y, m - 1, d)
}

export function useDateFilter() {
  const periodPreset = useState<DatePeriodPreset>('analytics.periodPreset', () => 'monthly')

  const customStart = useState<string>('analytics.customStart', () => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 29)
    return toYmd(start)
  })

  const customEnd = useState<string>('analytics.customEnd', () => toYmd(new Date()))

  const effectiveDays = computed(() => {
    if (periodPreset.value === 'daily') return 1
    if (periodPreset.value === 'weekly') return 7
    if (periodPreset.value === 'monthly') return 30
    const a = parseYmd(customStart.value)
    const b = parseYmd(customEnd.value)
    const lo = Math.min(a.getTime(), b.getTime())
    const hi = Math.max(a.getTime(), b.getTime())
    const diff = Math.ceil((hi - lo) / 86400000) + 1
    return Math.min(366, Math.max(1, diff))
  })

  const periodKey = computed(() => {
    if (periodPreset.value === 'custom') {
      return `custom:${customStart.value}:${customEnd.value}`
    }
    return `${periodPreset.value}:${toYmd(new Date())}`
  })

  const periodLabelShort = computed(() => {
    if (periodPreset.value === 'daily') return 'Today'
    if (periodPreset.value === 'weekly') return 'Last 7 days'
    if (periodPreset.value === 'monthly') return 'Last 30 days'
    return `${customStart.value} → ${customEnd.value}`
  })

  return {
    periodPreset,
    customStart,
    customEnd,
    effectiveDays,
    periodKey,
    periodLabelShort,
  }
}
