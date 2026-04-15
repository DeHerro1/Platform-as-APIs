/** Payment rails supported in analytics views */
export const PAYMENT_CHANNELS = [
  'MTN Mobile Money',
  'Telecel Cash',
  'AT Money',
  'GhQR',
  'Pay Small Small',
  'Bank Transfer',
  'Pay at Bank',
  'Refund and Reward',
  'Zeepay',
  'G-Money',
  'Card',
] as const

export type PaymentChannel = (typeof PAYMENT_CHANNELS)[number]

export type DatePeriodPreset = 'daily' | 'weekly' | 'monthly' | 'custom'

export interface FailureReason {
  reason: string
  count: number
}

export interface PaymentChannelRow {
  channel: string
  transactionCount: number
  collectionsGhs: number
  successCount: number
  failureCount: number
  successRate: number
  failureRate: number
  failureReasonsTop3: FailureReason[]
}

export interface PaymentTabData {
  totalCollectionsGhs: number
  totalTransactionCount: number
  channels: PaymentChannelRow[]
}

export interface ChannelCount {
  channel: string
  count: number
  collectionsGhs: number
}

/** Example merchant names on the invoicing product (illustrative). */
export const INVOICING_PLATFORM_BUSINESS_NAMES = [
  'ECG',
  'Star Oil',
  'Star Assurance',
  'Ghana Water',
  'GOIL',
  'GCB Bank',
  'Melcom',
  'TotalEnergies',
  'KPMG Ghana',
  'Ecobank Ghana',
  'Fan Milk',
  'Ghana National Gas',
] as const

export interface InvoicingBusinessExample {
  name: string
  collectionsGhs: number
  invoiceCount: number
}

/** Origins for customer-initiated invoice payments (illustrative). */
export const INVOICING_CUSTOMER_PAYMENT_SOURCES = [
  'Hubtel App',
  'Merchant website',
  'SMS link',
  'USSD',
  'Customer Portal',
  'WhatsApp',
] as const

export interface InvoicingCustomerPaymentSource {
  source: string
  transactionCount: number
  /** Share of customer-initiated invoice payments (0–100). */
  sharePercent: number
}

export interface InvoicePaymentCompletionRow {
  type: 'Full' | 'Partial'
  count: number
  amountGhs: number
}

export interface InvoicingTabData {
  /** All businesses registered on the invoicing product (sample). */
  totalBusinessesOnPlatform: number
  /** Subset that have created at least one invoice (sample). */
  businessesWithAtLeastOneInvoice: number
  invoiceCollectionsGhs: number
  /** Total number of invoices issued (all statuses). */
  totalInvoicesIssued: number
  /** Invoices that received at least one payment. */
  invoicesPaidCount: number
  /** Invoices with zero payments. */
  invoicesUnpaidCount: number
  transactionCountByChannel: ChannelCount[]
  topChannelForInvoices: string
  paymentCompletionBreakdown: InvoicePaymentCompletionRow[]
  platformBusinessExamples: InvoicingBusinessExample[]
  /** Businesses registered but with zero invoices created. */
  zeroActivityBusinesses: number
  customerPaymentSources: InvoicingCustomerPaymentSource[]
}

export interface PayrollDestinationRow {
  destination: string
  count: number
  amountGhs: number
}

export interface PayrollFailureReason {
  reason: string
  count: number
}

export interface PayrollTabData {
  totalBusinessesEnrolled: number
  businessesRanPayrollThisPeriod: number
  totalPayrollRuns: number
  totalEmployeesPaid: number
  totalDisbursementGhs: number
  avgDisbursementPerBusinessGhs: number
  avgDisbursementPerEmployeeGhs: number
  largestSinglePayrollRunGhs: number
  /** Bank Transfer vs. each MoMo network */
  destinationBreakdown: PayrollDestinationRow[]
  totalTransactionCount: number
  successfulDisbursements: number
  failedDisbursements: number
  disbursementSuccessRatePercent: number
  failedDisbursementAmountGhs: number
  pendingCount: number
  retryCount: number
  failureReasons: PayrollFailureReason[]
}

export interface PaySmallSmallTabData {
  totalTransactionCount: number
  totalAmountDisbursedGhs: number
  totalRepaymentCollectionsGhs: number
  activeAccounts: number
  averageLoanSizeGhs: number
  uniqueBorrowers: number
  newAccountsOpened: number
  repaymentTransactionCount: number
  onTimeRepaymentCount: number
  lateRepaymentCount: number
  onTimeRepaymentRatePercent: number
  totalOutstandingBalanceGhs: number
  totalOverdueAmountGhs: number
  defaultCount: number
  defaultRatePercent: number
  averageDaysToRepayment: number
  repaymentByChannel: { channel: string; count: number; amountGhs: number }[]
  mostUsedRepaymentChannel: string
  disbursementVsRepaymentCounts: { label: string; count: number }[]
}
