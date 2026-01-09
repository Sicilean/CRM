/**
 * Export principale per il sistema di generazione PDF
 */

// Generators
export { BasePDFGenerator } from './generators/base-generator'
export { QuoteGenerator } from './generators/quote-generator'
export { ProjectProposalGenerator } from './generators/project-proposal-generator'
export type { BaseGeneratorOptions } from './generators/base-generator'
export type { QuoteGeneratorOptions } from './generators/quote-generator'
export type { ProjectProposalGeneratorOptions } from './generators/project-proposal-generator'

// Types
export type {
  CompanyInfo,
  BankAccount,
  ClientInfo,
  QuoteService,
  QuoteData,
  QuoteTerm,
  PDFGenerationOptions,
  PDFTheme,
  TimelinePhase,
  TeamMember,
} from './types/pdf-types'

// Utils
export {
  formatCurrency,
  formatDate,
  formatDateLong,
  formatPercentage,
  formatNumber,
  formatPhoneNumber,
  formatVATNumber,
  formatFiscalCode,
  formatIBAN,
} from './utils/italian-formatter'

export {
  validateCompanyInfo,
  validateClientInfo,
  validateItalianVAT,
  validateItalianFiscalCode,
  validateSDICode,
  validateIBAN,
} from './utils/legal-compliance'

// Theme
export { sicileanTheme, statusColors, A4_PAGE } from './templates/styles/theme'

