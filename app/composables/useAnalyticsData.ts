import {
  INVOICING_CUSTOMER_PAYMENT_SOURCES,
  INVOICING_PLATFORM_BUSINESS_NAMES,
  PAYMENT_CHANNELS,
  type PaySmallSmallTabData,
  type ChannelCount,
  type InvoicePaymentCompletionRow,
  type InvoicingTabData,
  type PaymentChannelRow,
  type PaymentTabData,
  type PayrollDestinationRow,
  type PayrollTabData,
} from '~/types'

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function hashStr(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const FAILURE_REASONS = [
  'Insufficient funds',
  'Issuer timeout',
  'User cancelled',
  'Daily limit exceeded',
  'Invalid account',
  'Network error',
  'Duplicate reference',
] as const

export function useAnalyticsData() {
  const { effectiveDays, periodKey } = useDateFilter()

  const scale = computed(() => Math.sqrt(effectiveDays.value))

  const payment = computed<PaymentTabData>(() => {
    const key = periodKey.value
    const rows: PaymentChannelRow[] = []
    let totalCollections = 0
    let totalTxns = 0

    PAYMENT_CHANNELS.forEach((channel, i) => {
      const rand = rng(hashStr(`${key}|${channel}`))
      const baseTxn = Math.round((8000 + rand() * 12000) * scale.value * (1 + i * 0.04))
      const sr = 0.88 + rand() * 0.1
      const success = Math.round(baseTxn * sr)
      const failure = Math.max(0, baseTxn - success)
      const avgAmt = 40 + rand() * 220
      const collections = Math.round(success * avgAmt)

      const fr: { reason: string; count: number }[] = []
      for (let k = 0; k < 3; k++) {
        const rr = rng(hashStr(`${key}|${channel}|fail|${k}`))()
        const ri = Math.min(FAILURE_REASONS.length - 1, Math.floor(rr * FAILURE_REASONS.length))
        const reason = FAILURE_REASONS[ri] ?? 'Unknown'
        fr.push({ reason, count: Math.max(1, Math.round(failure * (0.35 - k * 0.08) * rr)) })
      }

      rows.push({
        channel,
        transactionCount: baseTxn,
        collectionsGhs: collections,
        successCount: success,
        failureCount: failure,
        successRate: baseTxn ? (100 * success) / baseTxn : 0,
        failureRate: baseTxn ? (100 * failure) / baseTxn : 0,
        failureReasonsTop3: fr,
      })
      totalCollections += collections
      totalTxns += baseTxn
    })

    return {
      totalCollectionsGhs: totalCollections,
      totalTransactionCount: totalTxns,
      channels: rows,
    }
  })

  const invoicing = computed<InvoicingTabData>(() => {
    const r = rng(hashStr(`${periodKey.value}|inv`))
    const totalBusinessesOnPlatform = Math.round((4200 + r() * 800) * scale.value)
    const businessesWithAtLeastOneInvoice = Math.round(
      totalBusinessesOnPlatform * (0.55 + r() * 0.15),
    )
    const invoiceCollections = Math.round((1.2e6 + r() * 2.8e6) * scale.value)

    const totalInvoicesIssued = Math.round(
      businessesWithAtLeastOneInvoice * (3.2 + r() * 4.8) * scale.value,
    )
    const invoicesPaidCount = Math.round(totalInvoicesIssued * (0.62 + r() * 0.2))
    const invoicesUnpaidCount = Math.max(0, totalInvoicesIssued - invoicesPaidCount)

    const fullPaymentRate = 0.7 + r() * 0.18
    const fullCount = Math.round(invoicesPaidCount * fullPaymentRate)
    const partialCount = Math.max(0, invoicesPaidCount - fullCount)
    const fullAmountGhs = Math.round(invoiceCollections * (fullPaymentRate + 0.03))
    const partialAmountGhs = Math.max(0, invoiceCollections - fullAmountGhs)
    const paymentCompletionBreakdown: InvoicePaymentCompletionRow[] = [
      { type: 'Full', count: fullCount, amountGhs: fullAmountGhs },
      { type: 'Partial', count: partialCount, amountGhs: partialAmountGhs },
    ]

    const channelRaw = PAYMENT_CHANNELS.map((channel, i) => {
      const w = rng(hashStr(`${periodKey.value}|inv|${channel}`))
      const count = Math.round((2000 + w() * 9000) * scale.value * (1 - i * 0.06))
      const avgAmt = 35 + w() * 180
      const collectionsGhs = Math.round(count * avgAmt)
      return { channel, count, collectionsGhs }
    }).sort((a, b) => b.count - a.count)
    const byChannel: ChannelCount[] = channelRaw

    const top = byChannel[0]?.channel ?? '—'

    const zeroActivityBusinesses = Math.max(0, totalBusinessesOnPlatform - businessesWithAtLeastOneInvoice)

    const platformBusinessExamples = INVOICING_PLATFORM_BUSINESS_NAMES.map((name) => {
      const rr = rng(hashStr(`${periodKey.value}|inv|biz|${name}`))
      const collectionsGhs = Math.round((45_000 + rr() * 1_850_000) * scale.value)
      const invoiceCount = Math.round((12 + rr() * 380) * scale.value)
      return { name, collectionsGhs, invoiceCount }
    }).sort((a, b) => b.collectionsGhs - a.collectionsGhs)

    const cipCounts = INVOICING_CUSTOMER_PAYMENT_SOURCES.map((source, i) => {
      const rr = rng(hashStr(`${periodKey.value}|inv|cip|${source}`))()
      const count = Math.round((800 + rr * 5200) * scale.value * (1 - i * 0.07))
      return { source, count }
    })
    const cipTotal = cipCounts.reduce((s, x) => s + x.count, 0)
    const customerPaymentSources = cipCounts
      .map(({ source, count }) => ({
        source,
        transactionCount: count,
        sharePercent: cipTotal > 0 ? (100 * count) / cipTotal : 0,
      }))
      .sort((a, b) => b.transactionCount - a.transactionCount)

    return {
      totalBusinessesOnPlatform,
      businessesWithAtLeastOneInvoice,
      invoiceCollectionsGhs: invoiceCollections,
      totalInvoicesIssued,
      invoicesPaidCount,
      invoicesUnpaidCount,
      transactionCountByChannel: byChannel,
      topChannelForInvoices: top,
      paymentCompletionBreakdown,
      platformBusinessExamples,
      zeroActivityBusinesses,
      customerPaymentSources,
    }
  })

  const payroll = computed<PayrollTabData>(() => {
    const r = rng(hashStr(`${periodKey.value}|pay`))
    const enrolled = Math.round((520 + r() * 180) * Math.min(2.2, scale.value / 4 + 0.55))
    const ranThisPeriod = Math.round(enrolled * (0.68 + r() * 0.22))
    const totalRuns = Math.round((240 + r() * 520) * scale.value)
    const employeesPaid = Math.round((38_000 + r() * 72_000) * scale.value)
    const disbursement = Math.round((2.1e6 + r() * 1.4e6) * scale.value)
    const avgPerBiz = ranThisPeriod > 0 ? Math.round(disbursement / ranThisPeriod) : 0
    const avgPerEmp = employeesPaid > 0 ? Math.round(disbursement / employeesPaid) : 0
    const largestRun = Math.round(disbursement * (0.06 + r() * 0.11))

    const bankCount = Math.round((8000 + r() * 4000) * scale.value)
    const mtnCount = Math.round((7200 + r() * 3600) * scale.value)
    const telecelCount = Math.round((3900 + r() * 2000) * scale.value)
    const atCount = Math.round((2800 + r() * 1400) * scale.value)
    const totalTxn = bankCount + mtnCount + telecelCount + atCount

    const bankAmt = Math.round(disbursement * (0.36 + r() * 0.08))
    const mtnAmt = Math.round(disbursement * (0.28 + r() * 0.06))
    const telecelAmt = Math.round(disbursement * (0.18 + r() * 0.04))
    const atAmt = Math.max(0, disbursement - bankAmt - mtnAmt - telecelAmt)

    const destinations: PayrollDestinationRow[] = [
      { destination: 'Bank Transfer', count: bankCount, amountGhs: bankAmt },
      { destination: 'MTN Mobile Money', count: mtnCount, amountGhs: mtnAmt },
      { destination: 'Telecel Cash', count: telecelCount, amountGhs: telecelAmt },
      { destination: 'AT Money', count: atCount, amountGhs: atAmt },
    ]

    const failed = Math.max(12, Math.round(totalTxn * (0.018 + r() * 0.028)))
    const successful = totalTxn - failed
    const successRate = totalTxn > 0 ? (100 * successful) / totalTxn : 0
    const failedAmt = Math.round(disbursement * (0.006 + r() * 0.022))
    const pending = Math.round((280 + r() * 1400) * scale.value)
    const retries = Math.round(failed * (0.22 + r() * 0.35))

    const failureReasons = [0, 1, 2].map((i) => {
      const rr = rng(hashStr(`${periodKey.value}|pay|fail|${i}`))()
      const ri = Math.min(FAILURE_REASONS.length - 1, Math.floor(rr * FAILURE_REASONS.length))
      return {
        reason: FAILURE_REASONS[ri] ?? 'Unknown',
        count: Math.max(1, Math.round(failed * (0.42 - i * 0.12) * rr)),
      }
    })

    return {
      totalBusinessesEnrolled: enrolled,
      businessesRanPayrollThisPeriod: ranThisPeriod,
      totalPayrollRuns: totalRuns,
      totalEmployeesPaid: employeesPaid,
      totalDisbursementGhs: disbursement,
      avgDisbursementPerBusinessGhs: avgPerBiz,
      avgDisbursementPerEmployeeGhs: avgPerEmp,
      largestSinglePayrollRunGhs: largestRun,
      destinationBreakdown: destinations,
      totalTransactionCount: totalTxn,
      successfulDisbursements: successful,
      failedDisbursements: failed,
      disbursementSuccessRatePercent: successRate,
      failedDisbursementAmountGhs: failedAmt,
      pendingCount: pending,
      retryCount: retries,
      failureReasons,
    }
  })

  const paySmallSmall = computed<PaySmallSmallTabData>(() => {
    const r = rng(hashStr(`${periodKey.value}|bnpl`))
    const disbTxns = Math.round((4200 + r() * 8000) * scale.value)
    const repayTxns = Math.round((7800 + r() * 10_200) * scale.value)
    const totalTxns = disbTxns + repayTxns

    const disbursedVol = Math.round((890_000 + r() * 1_200_000) * scale.value)
    const repaymentVol = Math.round((720_000 + r() * 980_000) * scale.value)
    const avgLoan = disbTxns > 0 ? Math.round(disbursedVol / disbTxns) : 0

    const uniqueBorrowers = Math.round((1900 + r() * 2100) * Math.min(1.6, scale.value / 10 + 0.5))
    const newAccounts = Math.round((95 + r() * 310) * scale.value)
    const activeOpen = Math.round((2100 + r() * 900) * Math.min(1.8, scale.value / 8 + 0.5))

    const onTime = Math.round(repayTxns * (0.81 + r() * 0.13))
    const late = Math.max(0, repayTxns - onTime)
    const onTimeRate = repayTxns > 0 ? (100 * onTime) / repayTxns : 0

    const outstanding = Math.round((1.05e6 + r() * 1.85e6) * scale.value)
    const overdue = Math.round(outstanding * (0.035 + r() * 0.09))

    const defaults = Math.round((38 + r() * 140) * Math.min(1.2, scale.value / 12 + 0.4))
    const defaultRate = uniqueBorrowers > 0 ? Math.min(100, (100 * defaults) / uniqueBorrowers) : 0
    const avgDays = Math.round(11 + r() * 18)

    const mmShare = 0.62 + r() * 0.15
    const repayMoMoCount = Math.round(repayTxns * mmShare)
    const repayBankCount = Math.max(0, repayTxns - repayMoMoCount)
    const repayMoMoGhs = Math.round(repaymentVol * (0.66 + r() * 0.12))
    const repayBankGhs = Math.max(0, repaymentVol - repayMoMoGhs)
    const mostUsed = repayMoMoCount >= repayBankCount ? 'Mobile Money' : 'Bank Transfer'

    return {
      totalTransactionCount: totalTxns,
      totalAmountDisbursedGhs: disbursedVol,
      totalRepaymentCollectionsGhs: repaymentVol,
      activeAccounts: activeOpen,
      averageLoanSizeGhs: avgLoan,
      uniqueBorrowers,
      newAccountsOpened: newAccounts,
      repaymentTransactionCount: repayTxns,
      onTimeRepaymentCount: onTime,
      lateRepaymentCount: late,
      onTimeRepaymentRatePercent: onTimeRate,
      totalOutstandingBalanceGhs: outstanding,
      totalOverdueAmountGhs: overdue,
      defaultCount: defaults,
      defaultRatePercent: defaultRate,
      averageDaysToRepayment: avgDays,
      repaymentByChannel: [
        { channel: 'Mobile Money', count: repayMoMoCount, amountGhs: repayMoMoGhs },
        { channel: 'Bank Transfer', count: repayBankCount, amountGhs: repayBankGhs },
      ],
      mostUsedRepaymentChannel: mostUsed,
      disbursementVsRepaymentCounts: [
        { label: 'Disbursements', count: disbTxns },
        { label: 'Repayments', count: repayTxns },
      ],
    }
  })

  const invoicingTransactionTotal = computed(() =>
    invoicing.value.transactionCountByChannel.reduce((s, c) => s + c.count, 0),
  )

  return {
    payment,
    invoicing,
    payroll,
    paySmallSmall,
    invoicingTransactionTotal,
  }
}
