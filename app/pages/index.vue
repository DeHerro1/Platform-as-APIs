<script setup lang="ts">
const { formatGhs, formatPercent, formatNumber } = useFormatters()
const {
  payment,
  invoicing,
  payroll,
  paySmallSmall,
} = useAnalyticsData()

type ProductTab = 'payment' | 'invoicing' | 'payroll' | 'paySmallSmall'
const tab = ref<ProductTab>('payment')

const tabs: { id: ProductTab; label: string }[] = [
  { id: 'payment', label: 'Payment' },
  { id: 'invoicing', label: 'Invoicing' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'paySmallSmall', label: 'PaySmallSmall' },
]

const RING_R = 36
const RING_C = 2 * Math.PI * RING_R

const paymentOverallSuccessRate = computed(() => {
  const ch = payment.value.channels
  const ok = ch.reduce((a, c) => a + c.successCount, 0)
  const all = ch.reduce((a, c) => a + c.transactionCount, 0)
  return all > 0 ? (100 * ok) / all : 0
})

const paymentAvgTxnValue = computed(() => {
  const t = payment.value.totalTransactionCount
  return t > 0 ? payment.value.totalCollectionsGhs / t : 0
})

const invoicingChannelRows = computed(() => {
  const rows = invoicing.value.transactionCountByChannel
  const totalTxn = rows.reduce((s, c) => s + c.count, 0)
  const totalGhs = rows.reduce((s, c) => s + c.collectionsGhs, 0)
  return rows.map((r) => ({
    channel: r.channel,
    count: r.count,
    collectionsGhs: r.collectionsGhs,
    txnSharePercent: totalTxn > 0 ? (100 * r.count) / totalTxn : 0,
    ghsSharePercent: totalGhs > 0 ? (100 * r.collectionsGhs) / totalGhs : 0,
  }))
})

const invoicingTotalTransactions = computed(() =>
  invoicingChannelRows.value.reduce((s, r) => s + r.count, 0),
)

const invoicingTotalChannelCollections = computed(() =>
  invoicingChannelRows.value.reduce((s, r) => s + r.collectionsGhs, 0),
)

const invoicingAvgTxnValue = computed(() => {
  const txn = invoicingTotalTransactions.value
  return txn > 0 ? invoicingTotalChannelCollections.value / txn : 0
})

const invoicingAvgInvoicesPerBusiness = computed(() => {
  const biz = invoicing.value.businessesWithAtLeastOneInvoice
  return biz > 0 ? invoicing.value.totalInvoicesIssued / biz : 0
})

const invoicingTopBusinessByValue = computed(() =>
  invoicing.value.platformBusinessExamples[0] ?? null,
)

const invoicingTopBusinessByCount = computed(() => {
  const rows = [...invoicing.value.platformBusinessExamples]
  rows.sort((a, b) => b.invoiceCount - a.invoiceCount)
  return rows[0] ?? null
})

const pssCollectionRate = computed(() => {
  const d = paySmallSmall.value.totalAmountDisbursedGhs
  return d > 0 ? (100 * paySmallSmall.value.totalRepaymentCollectionsGhs) / d : 0
})

const pssBarMax = computed(() =>
  Math.max(
    paySmallSmall.value.totalAmountDisbursedGhs,
    paySmallSmall.value.totalRepaymentCollectionsGhs,
    paySmallSmall.value.totalOutstandingBalanceGhs,
    1,
  ),
)

const paymentMaxChannelCollections = computed(() =>
  Math.max(...payment.value.channels.map(c => c.collectionsGhs), 1),
)
const invoicingMaxBizCollections = computed(() =>
  Math.max(...invoicing.value.platformBusinessExamples.map(b => b.collectionsGhs), 1),
)
const payrollMaxDestAmount = computed(() =>
  Math.max(...payroll.value.destinationBreakdown.map(d => d.amountGhs), 1),
)
const payrollOutcomeTotal = computed(() =>
  payroll.value.successfulDisbursements + payroll.value.failedDisbursements + payroll.value.pendingCount,
)

const payrollMaxFailureCount = computed(() =>
  Math.max(...payroll.value.failureReasons.map(f => f.count), 1),
)

function shortChannel(ch: string) {
  return (ch ?? '')
    .replace('MTN Mobile Money', 'MTN MoMo')
    .replace('Telecel Cash', 'Telecel')
    .replace('AT Money', 'AT')
    .replace('Pay Small Small', 'PSS')
    .replace('Bank Transfer', 'Bank')
}
</script>

<template>
  <div class="py-10">
    <div class="mb-8">
      <h2 class="page-title">Product Growth Analytics</h2>
      <p class="page-subtitle">Collections, transactions, and health across products.</p>
    </div>

    <nav class="mb-10 flex flex-wrap gap-3" role="tablist" aria-label="Product">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        role="tab"
        :aria-selected="tab === t.id"
        class="min-w-[6rem] rounded-xl px-5 py-2.5 text-center text-sm font-semibold transition-all duration-200"
        :class="tab === t.id
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
          : 'border hover:shadow-sm'"
        :style="tab !== t.id ? { borderColor: 'var(--border-primary)', color: 'var(--text-secondary)', backgroundColor: 'var(--surface-elevated)' } : {}"
        @click="tab = t.id"
      >
        {{ t.label }}
      </button>
    </nav>

    <!-- ═══════════════════ PAYMENT ═══════════════════ -->
    <section v-show="tab === 'payment'" class="space-y-8" aria-label="Payment">

      <div>
        <p class="metric-label">Total Collections</p>
        <p class="mt-2 text-[52px] font-bold leading-none tracking-tight tabular-nums" :style="{ color: 'var(--text-primary)' }">
          {{ payment.totalCollectionsGhs > 0 ? formatGhs(payment.totalCollectionsGhs) : '—' }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-y-8 gap-x-12 border-t pt-8 sm:grid-cols-4" :style="{ borderColor: 'var(--border-secondary)' }">
        <div>
          <p class="metric-label">Transactions</p>
          <p class="metric-value">{{ formatNumber(payment.totalTransactionCount) }}</p>
        </div>
        <div>
          <p class="metric-label">Success Rate</p>
          <div class="mt-2 flex items-center gap-3">
            <div class="relative h-14 w-14 shrink-0">
              <svg class="h-14 w-14 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" :r="RING_R" fill="none" stroke-width="3" stroke="var(--bar-track)" />
                <circle cx="40" cy="40" :r="RING_R" fill="none" stroke-width="3" stroke-linecap="round"
                  :stroke="paymentOverallSuccessRate >= 90 ? '#10b981' : paymentOverallSuccessRate >= 70 ? 'var(--bar-fill)' : '#f43f5e'"
                  :stroke-dasharray="RING_C" :stroke-dashoffset="RING_C * (1 - paymentOverallSuccessRate / 100)" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs font-bold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatPercent(paymentOverallSuccessRate, 0) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p class="metric-label">Avg Transaction</p>
          <p class="metric-value">{{ paymentAvgTxnValue > 0 ? formatGhs(paymentAvgTxnValue) : '—' }}</p>
        </div>
        <div>
          <p class="metric-label">Channels</p>
          <p class="metric-value">{{ payment.channels.length }}</p>
        </div>
      </div>

      <div class="glass-card p-6">
        <p class="card-title">Collections by Channel</p>
        <div class="mt-6 space-y-5">
          <div v-for="row in payment.channels" :key="`bar-${row.channel}`" class="flex items-center gap-4">
            <span class="w-36 shrink-0 text-sm font-medium" :style="{ color: 'var(--text-secondary)' }">{{ shortChannel(row.channel) }}</span>
            <div class="h-2 flex-1 overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
              <div class="h-full rounded-full transition-all duration-700" :style="{ width: (100 * row.collectionsGhs / paymentMaxChannelCollections) + '%', backgroundColor: 'var(--bar-fill)' }"></div>
            </div>
            <span class="w-24 shrink-0 text-right text-sm font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatGhs(row.collectionsGhs) }}</span>
          </div>
        </div>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="px-6 pt-6 pb-4">
          <p class="card-title">Channel Detail</p>
          <p class="card-subtitle">Volume, share, outcomes.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[900px] text-sm">
            <thead>
              <tr>
                <th class="th-cell">Channel</th>
                <th class="th-cell text-right">Txns</th>
                <th class="th-cell" style="min-width:130px">Share</th>
                <th class="th-cell text-right">Collections</th>
                <th class="th-cell" style="min-width:130px">Share</th>
                <th class="th-cell text-right">Success</th>
                <th class="th-cell text-right">Fail</th>
                <th class="th-cell text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in payment.channels" :key="row.channel" class="table-row-hover border-t">
                <td class="td-cell font-medium" :style="{ color: 'var(--text-primary)' }">{{ row.channel }}</td>
                <td class="td-cell text-right tabular-nums">{{ formatNumber(row.transactionCount) }}</td>
                <td class="td-cell">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 flex-1 overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
                      <div class="h-full rounded-full transition-all duration-500" :style="{ width: (payment.totalTransactionCount > 0 ? (100 * row.transactionCount / payment.totalTransactionCount) : 0) + '%', backgroundColor: 'var(--bar-fill)' }"></div>
                    </div>
                    <span class="w-10 shrink-0 text-right text-[11px] tabular-nums" :style="{ color: 'var(--text-muted)' }">{{ formatPercent(payment.totalTransactionCount > 0 ? (100 * row.transactionCount) / payment.totalTransactionCount : 0, 1) }}</span>
                  </div>
                </td>
                <td class="td-cell text-right tabular-nums font-medium" :style="{ color: 'var(--text-primary)' }">{{ formatGhs(row.collectionsGhs) }}</td>
                <td class="td-cell">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 flex-1 overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
                      <div class="h-full rounded-full transition-all duration-500" :style="{ width: (payment.totalCollectionsGhs > 0 ? (100 * row.collectionsGhs / payment.totalCollectionsGhs) : 0) + '%', backgroundColor: 'var(--bar-fill)' }"></div>
                    </div>
                    <span class="w-10 shrink-0 text-right text-[11px] tabular-nums" :style="{ color: 'var(--text-muted)' }">{{ formatPercent(payment.totalCollectionsGhs > 0 ? (100 * row.collectionsGhs) / payment.totalCollectionsGhs : 0, 1) }}</span>
                  </div>
                </td>
                <td class="td-cell text-right tabular-nums text-emerald-600 dark:text-emerald-400">{{ formatNumber(row.successCount) }}</td>
                <td class="td-cell text-right tabular-nums text-rose-600 dark:text-rose-400">{{ formatNumber(row.failureCount) }}</td>
                <td class="td-cell text-right">
                  <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums" :class="row.successRate >= 95 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : row.successRate >= 85 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'">{{ formatPercent(row.successRate, 1) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="glass-card p-6">
        <p class="card-title">Failure Reasons</p>
        <p class="card-subtitle">Top 3 per channel.</p>
        <div class="mt-5 grid gap-8 sm:grid-cols-2">
          <div v-for="row in payment.channels" :key="`f-${row.channel}`">
            <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">{{ shortChannel(row.channel) }}</p>
            <div class="mt-3 space-y-2">
              <div v-for="(f, i) in row.failureReasonsTop3" :key="i" class="flex items-center justify-between text-sm">
                <span class="text-rose-600 dark:text-rose-400">{{ f.reason }}</span>
                <span class="tabular-nums" :style="{ color: 'var(--text-muted)' }">{{ formatNumber(f.count) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ INVOICING ═══════════════════ -->
    <section v-show="tab === 'invoicing'" class="space-y-8" aria-label="Invoicing">

      <div>
        <p class="metric-label">Invoice Collections</p>
        <p class="mt-2 text-[52px] font-bold leading-none tracking-tight tabular-nums" :style="{ color: 'var(--text-primary)' }">
          {{ invoicing.invoiceCollectionsGhs > 0 ? formatGhs(invoicing.invoiceCollectionsGhs) : '—' }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-y-8 gap-x-12 border-t pt-8 sm:grid-cols-4" :style="{ borderColor: 'var(--border-secondary)' }">
        <div>
          <p class="metric-label">Transactions</p>
          <p class="metric-value">{{ formatNumber(invoicingTotalTransactions) }}</p>
        </div>
        <div>
          <p class="metric-label">Active Businesses</p>
          <p class="metric-value">{{ formatNumber(invoicing.businessesWithAtLeastOneInvoice) }}</p>
        </div>
        <div>
          <p class="metric-label">Avg Transaction</p>
          <p class="metric-value">{{ invoicingAvgTxnValue > 0 ? formatGhs(invoicingAvgTxnValue) : '—' }}</p>
        </div>
        <div>
          <p class="metric-label">Invoices per Business</p>
          <p class="metric-value">{{ invoicingAvgInvoicesPerBusiness > 0 ? invoicingAvgInvoicesPerBusiness.toFixed(1) : '—' }}</p>
        </div>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="px-6 pt-6 pb-4">
          <p class="card-title">Collections by Payment Channel</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] text-sm">
            <thead>
              <tr>
                <th class="th-cell">Channel</th>
                <th class="th-cell text-right">Txns</th>
                <th class="th-cell" style="min-width:120px">Txn share</th>
                <th class="th-cell text-right">Collections</th>
                <th class="th-cell" style="min-width:120px">GHS share</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in invoicingChannelRows" :key="row.channel" class="table-row-hover border-t">
                <td class="td-cell font-medium" :style="{ color: 'var(--text-primary)' }">{{ row.channel }}</td>
                <td class="td-cell text-right tabular-nums">{{ formatNumber(row.count) }}</td>
                <td class="td-cell">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 flex-1 overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
                      <div class="h-full rounded-full transition-all duration-500" :style="{ width: row.txnSharePercent + '%', backgroundColor: 'var(--bar-fill)' }"></div>
                    </div>
                    <span class="w-10 shrink-0 text-right text-[11px] tabular-nums" :style="{ color: 'var(--text-muted)' }">{{ formatPercent(row.txnSharePercent, 1) }}</span>
                  </div>
                </td>
                <td class="td-cell text-right tabular-nums font-medium" :style="{ color: 'var(--text-primary)' }">{{ formatGhs(row.collectionsGhs) }}</td>
                <td class="td-cell">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 flex-1 overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
                      <div class="h-full rounded-full transition-all duration-500" :style="{ width: row.ghsSharePercent + '%', backgroundColor: 'var(--bar-fill)' }"></div>
                    </div>
                    <span class="w-10 shrink-0 text-right text-[11px] tabular-nums" :style="{ color: 'var(--text-muted)' }">{{ formatPercent(row.ghsSharePercent, 1) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="px-6 pt-6 pb-4">
          <p class="card-title">Collections per Business</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th class="th-cell">Business</th>
                <th class="th-cell" style="min-width:200px">Collections</th>
                <th class="th-cell text-right">Invoices</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in invoicing.platformBusinessExamples" :key="row.name" class="table-row-hover border-t">
                <td class="td-cell font-medium" :style="{ color: 'var(--text-primary)' }">{{ row.name }}</td>
                <td class="td-cell">
                  <div class="flex items-center gap-3">
                    <div class="h-2 flex-1 overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
                      <div class="h-full rounded-full transition-all duration-700" :style="{ width: (100 * row.collectionsGhs / invoicingMaxBizCollections) + '%', backgroundColor: 'var(--bar-fill)' }"></div>
                    </div>
                    <span class="shrink-0 text-right text-sm font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatGhs(row.collectionsGhs) }}</span>
                  </div>
                </td>
                <td class="td-cell text-right tabular-nums">{{ formatNumber(row.invoiceCount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-baseline justify-between">
          <p class="card-title">Invoice Lifecycle</p>
          <span class="text-sm font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(invoicing.totalInvoicesIssued) }} total</span>
        </div>

        <div class="mt-5 h-2 w-full rounded-full overflow-hidden flex" v-if="invoicing.totalInvoicesIssued > 0">
          <div v-for="row in invoicing.paymentCompletionBreakdown" :key="`stack-${row.type}`"
            class="h-full transition-all duration-700"
            :style="{ width: (100 * row.count / invoicing.totalInvoicesIssued) + '%', backgroundColor: row.type === 'Full' ? 'var(--bar-fill)' : 'var(--text-muted)' }"></div>
          <div class="h-full bg-rose-500 transition-all duration-700"
            :style="{ width: (100 * invoicing.invoicesUnpaidCount / invoicing.totalInvoicesIssued) + '%' }"></div>
        </div>

        <div class="mt-5 space-y-3">
          <div v-for="row in invoicing.paymentCompletionBreakdown" :key="`leg-${row.type}`" class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full" :style="{ backgroundColor: row.type === 'Full' ? 'var(--bar-fill)' : 'var(--text-muted)' }"></div>
              <span :style="{ color: 'var(--text-secondary)' }">{{ row.type === 'Full' ? 'Paid in full' : 'Partially paid' }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(row.count) }}</span>
              <span class="text-[11px] tabular-nums" :style="{ color: 'var(--text-muted)' }">{{ formatPercent(invoicing.totalInvoicesIssued > 0 ? (100 * row.count) / invoicing.totalInvoicesIssued : 0, 1) }}</span>
            </div>
          </div>
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full bg-rose-500"></div>
              <span class="text-rose-600 dark:text-rose-400">Unpaid / overdue</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-semibold tabular-nums text-rose-600 dark:text-rose-400">{{ formatNumber(invoicing.invoicesUnpaidCount) }}</span>
              <span class="text-[11px] tabular-nums text-rose-600 dark:text-rose-400">{{ formatPercent(invoicing.totalInvoicesIssued > 0 ? (100 * invoicing.invoicesUnpaidCount) / invoicing.totalInvoicesIssued : 0, 1) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <p class="card-title">Businesses</p>
        <div class="mt-5 divide-y">
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Total active businesses</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(invoicing.businessesWithAtLeastOneInvoice) }}</span>
          </div>
          <div v-if="invoicingTopBusinessByValue" class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Top by collection value</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ invoicingTopBusinessByValue.name }} — {{ formatGhs(invoicingTopBusinessByValue.collectionsGhs) }}</span>
          </div>
          <div v-if="invoicingTopBusinessByCount" class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Top by invoice count</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ invoicingTopBusinessByCount.name }} — {{ formatNumber(invoicingTopBusinessByCount.invoiceCount) }}</span>
          </div>
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span class="text-rose-600 dark:text-rose-400">Zero activity merchants</span>
            <span class="font-semibold tabular-nums text-rose-600 dark:text-rose-400">{{ formatNumber(invoicing.zeroActivityBusinesses) }}</span>
          </div>
        </div>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="px-6 pt-6 pb-4">
          <p class="card-title">Channels &amp; Access</p>
          <p class="card-subtitle">Collections by platform.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th class="th-cell">Platform</th>
                <th class="th-cell text-right">Payments</th>
                <th class="th-cell" style="min-width:120px">Share</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in invoicing.customerPaymentSources" :key="row.source" class="table-row-hover border-t">
                <td class="td-cell font-medium" :style="{ color: 'var(--text-primary)' }">{{ row.source }}</td>
                <td class="td-cell text-right tabular-nums">{{ formatNumber(row.transactionCount) }}</td>
                <td class="td-cell">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 flex-1 overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
                      <div class="h-full rounded-full transition-all duration-500" :style="{ width: row.sharePercent + '%', backgroundColor: 'var(--bar-fill)' }"></div>
                    </div>
                    <span class="w-10 shrink-0 text-right text-[11px] tabular-nums" :style="{ color: 'var(--text-muted)' }">{{ formatPercent(row.sharePercent, 1) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ PAYROLL ═══════════════════ -->
    <section v-show="tab === 'payroll'" class="space-y-8" aria-label="Payroll">

      <div>
        <p class="metric-label">Total Disbursement</p>
        <p class="mt-2 text-[52px] font-bold leading-none tracking-tight tabular-nums" :style="{ color: 'var(--text-primary)' }">
          {{ payroll.totalDisbursementGhs > 0 ? formatGhs(payroll.totalDisbursementGhs) : '—' }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-y-8 gap-x-12 border-t pt-8 sm:grid-cols-4" :style="{ borderColor: 'var(--border-secondary)' }">
        <div>
          <p class="metric-label">Businesses</p>
          <p class="metric-value">{{ formatNumber(payroll.totalBusinessesEnrolled) }}</p>
          <p class="metric-note">{{ formatNumber(payroll.businessesRanPayrollThisPeriod) }} ran payroll</p>
        </div>
        <div>
          <p class="metric-label">Employees Paid</p>
          <p class="metric-value">{{ formatNumber(payroll.totalEmployeesPaid) }}</p>
          <p class="metric-note">Avg {{ payroll.businessesRanPayrollThisPeriod > 0 ? (payroll.totalEmployeesPaid / payroll.businessesRanPayrollThisPeriod).toFixed(0) : '—' }} per business</p>
        </div>
        <div>
          <p class="metric-label">Success Rate</p>
          <div class="mt-2 flex items-center gap-3">
            <div class="relative h-14 w-14 shrink-0">
              <svg class="h-14 w-14 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" :r="RING_R" fill="none" stroke-width="3" stroke="var(--bar-track)" />
                <circle cx="40" cy="40" :r="RING_R" fill="none" stroke-width="3" stroke-linecap="round"
                  :stroke="payroll.disbursementSuccessRatePercent >= 90 ? '#10b981' : payroll.disbursementSuccessRatePercent >= 70 ? 'var(--bar-fill)' : '#f43f5e'"
                  :stroke-dasharray="RING_C" :stroke-dashoffset="RING_C * (1 - payroll.disbursementSuccessRatePercent / 100)" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs font-bold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatPercent(payroll.disbursementSuccessRatePercent, 0) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p class="metric-label">Payroll Runs</p>
          <p class="metric-value">{{ formatNumber(payroll.totalPayrollRuns) }}</p>
        </div>
      </div>

      <div class="glass-card p-6">
        <p class="card-title">Disbursement Amounts</p>
        <div class="mt-5 divide-y">
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Total disbursement</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ payroll.totalDisbursementGhs > 0 ? formatGhs(payroll.totalDisbursementGhs) : '—' }}</span>
          </div>
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Avg per business</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ payroll.avgDisbursementPerBusinessGhs > 0 ? formatGhs(payroll.avgDisbursementPerBusinessGhs) : '—' }}</span>
          </div>
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Avg per employee</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ payroll.avgDisbursementPerEmployeeGhs > 0 ? formatGhs(payroll.avgDisbursementPerEmployeeGhs) : '—' }}</span>
          </div>
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Largest single run</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ payroll.largestSinglePayrollRunGhs > 0 ? formatGhs(payroll.largestSinglePayrollRunGhs) : '—' }}</span>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-baseline justify-between">
          <p class="card-title">Outcome Distribution</p>
          <span class="text-sm font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(payrollOutcomeTotal) }} total</span>
        </div>

        <div class="mt-5 h-2 w-full rounded-full overflow-hidden flex" v-if="payrollOutcomeTotal > 0">
          <div class="h-full transition-all duration-700" :style="{ width: (100 * payroll.successfulDisbursements / payrollOutcomeTotal) + '%', backgroundColor: 'var(--bar-fill)' }"></div>
          <div class="h-full bg-rose-500 transition-all duration-700" :style="{ width: (100 * payroll.failedDisbursements / payrollOutcomeTotal) + '%' }"></div>
          <div class="h-full transition-all duration-700" :style="{ width: (100 * payroll.pendingCount / payrollOutcomeTotal) + '%', backgroundColor: 'var(--text-muted)' }"></div>
        </div>

        <div class="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full" :style="{ backgroundColor: 'var(--bar-fill)' }"></div>
            <span :style="{ color: 'var(--text-secondary)' }">Success</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(payroll.successfulDisbursements) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-rose-500"></div>
            <span class="text-rose-600 dark:text-rose-400">Failed</span>
            <span class="font-semibold tabular-nums text-rose-600 dark:text-rose-400">{{ formatNumber(payroll.failedDisbursements) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full" :style="{ backgroundColor: 'var(--text-muted)' }"></div>
            <span :style="{ color: 'var(--text-secondary)' }">Pending</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(payroll.pendingCount) }}</span>
          </div>
        </div>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="px-6 pt-6 pb-4">
          <p class="card-title">Destination Breakdown</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th class="th-cell">Destination</th>
                <th class="th-cell text-right">Txns</th>
                <th class="th-cell" style="min-width:200px">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in payroll.destinationBreakdown" :key="row.destination" class="table-row-hover border-t">
                <td class="td-cell font-medium" :style="{ color: 'var(--text-primary)' }">{{ row.destination }}</td>
                <td class="td-cell text-right tabular-nums">{{ formatNumber(row.count) }}</td>
                <td class="td-cell">
                  <div class="flex items-center gap-3">
                    <div class="h-2 flex-1 overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
                      <div class="h-full rounded-full transition-all duration-700" :style="{ width: (100 * row.amountGhs / payrollMaxDestAmount) + '%', backgroundColor: 'var(--bar-fill)' }"></div>
                    </div>
                    <span class="shrink-0 text-right text-sm font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatGhs(row.amountGhs) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="glass-card p-6">
        <p class="card-title">Disbursement Outcomes</p>
        <div class="mt-5 divide-y">
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span class="text-emerald-600 dark:text-emerald-400">Success rate</span>
            <span class="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{{ formatPercent(payroll.disbursementSuccessRatePercent, 1) }}</span>
          </div>
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Successful</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(payroll.successfulDisbursements) }}</span>
          </div>
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span class="text-rose-600 dark:text-rose-400">Failed</span>
            <span class="font-semibold tabular-nums text-rose-600 dark:text-rose-400">{{ formatNumber(payroll.failedDisbursements) }}</span>
          </div>
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Failed amount</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ payroll.failedDisbursementAmountGhs > 0 ? formatGhs(payroll.failedDisbursementAmountGhs) : '—' }}</span>
          </div>
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Pending</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(payroll.pendingCount) }}</span>
          </div>
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Retries</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(payroll.retryCount) }}</span>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <p class="card-title">Failure Reasons</p>
        <div class="mt-5 space-y-4">
          <div v-for="(f, i) in payroll.failureReasons" :key="`pf-${i}`" class="flex items-center gap-4">
            <span class="flex-1 text-sm text-rose-600 dark:text-rose-400">{{ f.reason }}</span>
            <div class="h-1.5 w-32 shrink-0 overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
              <div class="h-full rounded-full bg-rose-500 transition-all duration-500" :style="{ width: (100 * f.count / payrollMaxFailureCount) + '%' }"></div>
            </div>
            <span class="w-16 shrink-0 text-right text-sm font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(f.count) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ PAYSMALLSMALL ═══════════════════ -->
    <section v-show="tab === 'paySmallSmall'" class="space-y-8" aria-label="PaySmallSmall">

      <div>
        <p class="metric-label">Amount Disbursed</p>
        <p class="mt-2 text-[52px] font-bold leading-none tracking-tight tabular-nums" :style="{ color: 'var(--text-primary)' }">
          {{ paySmallSmall.totalAmountDisbursedGhs > 0 ? formatGhs(paySmallSmall.totalAmountDisbursedGhs) : '—' }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-y-8 gap-x-12 border-t pt-8 sm:grid-cols-4" :style="{ borderColor: 'var(--border-secondary)' }">
        <div>
          <p class="metric-label">Repaid</p>
          <p class="metric-value">{{ paySmallSmall.totalRepaymentCollectionsGhs > 0 ? formatGhs(paySmallSmall.totalRepaymentCollectionsGhs) : '—' }}</p>
        </div>
        <div>
          <p class="metric-label">Collection Rate</p>
          <div class="mt-2 flex items-center gap-3">
            <div class="relative h-14 w-14 shrink-0">
              <svg class="h-14 w-14 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" :r="RING_R" fill="none" stroke-width="3" stroke="var(--bar-track)" />
                <circle cx="40" cy="40" :r="RING_R" fill="none" stroke-width="3" stroke-linecap="round"
                  :stroke="pssCollectionRate >= 80 ? '#10b981' : pssCollectionRate >= 60 ? 'var(--bar-fill)' : '#f43f5e'"
                  :stroke-dasharray="RING_C" :stroke-dashoffset="RING_C * (1 - pssCollectionRate / 100)" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs font-bold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatPercent(pssCollectionRate, 0) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p class="metric-label">Borrowers</p>
          <p class="metric-value">{{ formatNumber(paySmallSmall.uniqueBorrowers) }}</p>
          <p class="metric-note">{{ formatNumber(paySmallSmall.newAccountsOpened) }} new this period</p>
        </div>
        <div>
          <p class="metric-label">Active Accounts</p>
          <p class="metric-value">{{ formatNumber(paySmallSmall.activeAccounts) }}</p>
        </div>
      </div>

      <div class="glass-card p-6">
        <p class="card-title">Disbursed vs Repaid</p>
        <div class="mt-6 space-y-5">
          <div>
            <div class="flex items-center justify-between mb-2 text-sm">
              <span :style="{ color: 'var(--text-secondary)' }">Disbursed</span>
              <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatGhs(paySmallSmall.totalAmountDisbursedGhs) }}</span>
            </div>
            <div class="h-2.5 w-full overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
              <div class="h-full rounded-full transition-all duration-700" :style="{ width: (100 * paySmallSmall.totalAmountDisbursedGhs / pssBarMax) + '%', backgroundColor: 'var(--bar-fill)' }"></div>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-2 text-sm">
              <span class="text-emerald-600 dark:text-emerald-400">Repaid</span>
              <span class="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{{ formatGhs(paySmallSmall.totalRepaymentCollectionsGhs) }}</span>
            </div>
            <div class="h-2.5 w-full overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
              <div class="h-full rounded-full bg-emerald-500 transition-all duration-700" :style="{ width: (100 * paySmallSmall.totalRepaymentCollectionsGhs / pssBarMax) + '%' }"></div>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-2 text-sm">
              <span class="text-rose-600 dark:text-rose-400">Outstanding</span>
              <span class="font-semibold tabular-nums text-rose-600 dark:text-rose-400">{{ formatGhs(paySmallSmall.totalOutstandingBalanceGhs) }}</span>
            </div>
            <div class="h-2.5 w-full overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
              <div class="h-full rounded-full bg-rose-500 transition-all duration-700" :style="{ width: (100 * paySmallSmall.totalOutstandingBalanceGhs / pssBarMax) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <p class="card-title">Loan Profile</p>
        <div class="mt-5 divide-y">
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Average loan size</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ paySmallSmall.averageLoanSizeGhs > 0 ? formatGhs(paySmallSmall.averageLoanSizeGhs) : '—' }}</span>
          </div>
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Unique borrowers</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(paySmallSmall.uniqueBorrowers) }}</span>
          </div>
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">New accounts opened</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(paySmallSmall.newAccountsOpened) }}</span>
          </div>
          <div class="flex items-center justify-between py-3.5 text-sm">
            <span :style="{ color: 'var(--text-secondary)' }">Total transactions</span>
            <span class="font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(paySmallSmall.totalTransactionCount) }}</span>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <p class="card-title">Disbursements vs Repayments</p>
        <div class="mt-5 space-y-4">
          <div v-for="(row, idx) in paySmallSmall.disbursementVsRepaymentCounts" :key="row.label" class="flex items-center gap-4">
            <span class="w-28 shrink-0 text-sm" :style="{ color: 'var(--text-secondary)' }">{{ row.label }}</span>
            <div class="h-2 flex-1 overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
              <div class="h-full rounded-full transition-all duration-700"
                :style="{ width: (paySmallSmall.totalTransactionCount > 0 ? (100 * row.count / paySmallSmall.totalTransactionCount) : 50) + '%', backgroundColor: idx === 0 ? 'var(--bar-fill)' : '#10b981' }"></div>
            </div>
            <span class="w-16 shrink-0 text-right text-sm font-semibold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(row.count) }}</span>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-baseline justify-between">
          <p class="card-title">Repayment Health</p>
          <span class="text-sm tabular-nums" :style="{ color: 'var(--text-muted)' }">Avg {{ paySmallSmall.averageDaysToRepayment }}d to repay</span>
        </div>

        <div class="mt-5 h-2 w-full rounded-full overflow-hidden flex" v-if="paySmallSmall.repaymentTransactionCount > 0">
          <div class="h-full transition-all duration-700" :style="{ width: (100 * paySmallSmall.onTimeRepaymentCount / paySmallSmall.repaymentTransactionCount) + '%', backgroundColor: 'var(--bar-fill)' }"></div>
          <div class="h-full bg-rose-500 transition-all duration-700"
            :style="{ width: (100 * paySmallSmall.lateRepaymentCount / paySmallSmall.repaymentTransactionCount) + '%' }"></div>
        </div>

        <div class="mt-5 grid grid-cols-3 gap-8">
          <div>
            <p class="text-[11px] font-medium uppercase tracking-[0.12em]" :style="{ color: 'var(--text-muted)' }">Total</p>
            <p class="mt-1 text-xl font-bold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(paySmallSmall.repaymentTransactionCount) }}</p>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <div class="h-2 w-2 rounded-full" :style="{ backgroundColor: 'var(--bar-fill)' }"></div>
              <p class="text-[11px] font-medium uppercase tracking-[0.12em]" :style="{ color: 'var(--text-muted)' }">On-time</p>
            </div>
            <p class="mt-1 text-xl font-bold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(paySmallSmall.onTimeRepaymentCount) }}</p>
            <p class="mt-0.5 text-xs tabular-nums" :class="paySmallSmall.onTimeRepaymentRatePercent >= 80 ? 'text-emerald-600 dark:text-emerald-400' : paySmallSmall.onTimeRepaymentRatePercent >= 60 ? '' : 'text-rose-600 dark:text-rose-400'" :style="paySmallSmall.onTimeRepaymentRatePercent >= 60 && paySmallSmall.onTimeRepaymentRatePercent < 80 ? { color: 'var(--text-secondary)' } : {}">{{ formatPercent(paySmallSmall.onTimeRepaymentRatePercent, 1) }}</p>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <div class="h-2 w-2 rounded-full bg-rose-500"></div>
              <p class="text-[11px] font-medium uppercase tracking-[0.12em] text-rose-600 dark:text-rose-400">Late</p>
            </div>
            <p class="mt-1 text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{{ formatNumber(paySmallSmall.lateRepaymentCount) }}</p>
            <p class="mt-0.5 text-xs tabular-nums text-rose-600 dark:text-rose-400">{{ formatPercent(paySmallSmall.repaymentTransactionCount > 0 ? (100 * paySmallSmall.lateRepaymentCount) / paySmallSmall.repaymentTransactionCount : 0, 1) }}</p>
          </div>
        </div>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="px-6 pt-6 pb-4">
          <p class="card-title">Repayment Channels</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th class="th-cell">Channel</th>
                <th class="th-cell text-right">Txns</th>
                <th class="th-cell text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in paySmallSmall.repaymentByChannel" :key="row.channel" class="table-row-hover border-t">
                <td class="td-cell font-medium" :style="{ color: 'var(--text-primary)' }">{{ row.channel }}</td>
                <td class="td-cell text-right tabular-nums">{{ formatNumber(row.count) }}</td>
                <td class="td-cell text-right tabular-nums font-medium" :style="{ color: 'var(--text-primary)' }">{{ formatGhs(row.amountGhs) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="border-t px-6 py-4" :style="{ borderColor: 'var(--border-primary)' }">
          <p class="text-sm" :style="{ color: 'var(--text-muted)' }">
            Most used: <span class="font-semibold" :style="{ color: 'var(--text-primary)' }">{{ paySmallSmall.mostUsedRepaymentChannel }}</span>
          </p>
        </div>
      </div>

      <div class="glass-card p-6">
        <p class="card-title">Risk &amp; Portfolio</p>
        <div class="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p class="text-[11px] font-medium uppercase tracking-[0.12em]" :style="{ color: 'var(--text-muted)' }">Outstanding</p>
            <p class="mt-1 text-2xl font-bold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ paySmallSmall.totalOutstandingBalanceGhs > 0 ? formatGhs(paySmallSmall.totalOutstandingBalanceGhs) : '—' }}</p>
            <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
              <div class="h-full rounded-full" :style="{ width: '100%', backgroundColor: 'var(--bar-fill)' }"></div>
            </div>
          </div>
          <div>
            <p class="text-[11px] font-medium uppercase tracking-[0.12em] text-rose-600 dark:text-rose-400">Overdue</p>
            <p class="mt-1 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{{ paySmallSmall.totalOverdueAmountGhs > 0 ? formatGhs(paySmallSmall.totalOverdueAmountGhs) : '—' }}</p>
            <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bar-track)' }">
              <div class="h-full rounded-full bg-rose-500 transition-all duration-700" :style="{ width: (paySmallSmall.totalOutstandingBalanceGhs > 0 ? (100 * paySmallSmall.totalOverdueAmountGhs / paySmallSmall.totalOutstandingBalanceGhs) : 0) + '%' }"></div>
            </div>
            <p class="mt-1.5 text-[11px] tabular-nums text-rose-600 dark:text-rose-400">{{ formatPercent(paySmallSmall.totalOutstandingBalanceGhs > 0 ? (100 * paySmallSmall.totalOverdueAmountGhs) / paySmallSmall.totalOutstandingBalanceGhs : 0, 1) }} of outstanding</p>
          </div>
          <div>
            <p class="text-[11px] font-medium uppercase tracking-[0.12em]" :style="{ color: 'var(--text-muted)' }">Defaults</p>
            <p class="mt-1 text-2xl font-bold tabular-nums" :style="{ color: 'var(--text-primary)' }">{{ formatNumber(paySmallSmall.defaultCount) }}</p>
            <p class="mt-1.5 text-[11px] tabular-nums" :class="paySmallSmall.defaultRatePercent <= 2 ? 'text-emerald-600 dark:text-emerald-400' : paySmallSmall.defaultRatePercent <= 5 ? '' : 'text-rose-600 dark:text-rose-400'" :style="paySmallSmall.defaultRatePercent > 2 && paySmallSmall.defaultRatePercent <= 5 ? { color: 'var(--text-secondary)' } : {}">{{ formatPercent(paySmallSmall.defaultRatePercent, 2) }} default rate</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
