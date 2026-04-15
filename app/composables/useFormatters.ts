export function useFormatters() {
  /** Full GHS amount for dashboards (no abbreviation). */
  function formatGhs(value: number): string {
    if (value === 0) return 'GHS 0'
    return `GHS ${value.toLocaleString('en-GH', { maximumFractionDigits: 0 })}`
  }

  function formatCurrency(value: number, currency = 'GHS'): string {
    if (value >= 1_000_000) {
      return `${currency} ${(value / 1_000_000).toFixed(1)}M`
    }
    if (value >= 1_000) {
      return `${currency} ${(value / 1_000).toFixed(1)}K`
    }
    return `${currency} ${value.toFixed(2)}`
  }

  function formatNumber(value: number): string {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`
    }
    return value.toLocaleString()
  }

  function formatPercent(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`
  }

  function formatLatency(ms: number): string {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`
    }
    return `${Math.round(ms)}ms`
  }

  function formatDuration(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`
    }
    if (hours < 24) {
      return `${hours.toFixed(1)}hrs`
    }
    return `${(hours / 24).toFixed(1)}d`
  }

  function relativeTime(timestamp: string): string {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60_000)
    const diffHours = Math.floor(diffMs / 3_600_000)
    const diffDays = Math.floor(diffMs / 86_400_000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  function statusColor(status: string): string {
    switch (status) {
      case 'healthy':
      case 'active':
        return 'text-emerald-400'
      case 'degraded':
      case 'onboarding':
        return 'text-amber-400'
      case 'down':
      case 'inactive':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  function statusBg(status: string): string {
    switch (status) {
      case 'healthy':
      case 'active':
        return 'bg-emerald-400/10 border-emerald-400/20'
      case 'degraded':
      case 'onboarding':
        return 'bg-amber-400/10 border-amber-400/20'
      case 'down':
      case 'inactive':
        return 'bg-red-400/10 border-red-400/20'
      default:
        return 'bg-slate-400/10 border-slate-400/20'
    }
  }

  return {
    formatGhs,
    formatCurrency,
    formatNumber,
    formatPercent,
    formatLatency,
    formatDuration,
    relativeTime,
    statusColor,
    statusBg,
  }
}
