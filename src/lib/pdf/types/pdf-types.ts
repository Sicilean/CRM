/**
 * Tipi TypeScript per il sistema di generazione PDF
 */

export interface CompanyInfo {
  company_name: string
  legal_name?: string
  vat_number?: string
  fiscal_code?: string
  sdi_code?: string
  address?: string
  city?: string
  postal_code?: string
  province?: string
  phone?: string
  email?: string
  pec?: string
  website?: string
  footer_text?: string
  bank_account?: BankAccount | null
}

export interface BankAccount {
  account_name: string
  iban?: string | null
  bic_swift?: string | null
  currency: string
}

export interface ClientInfo {
  client_name: string
  client_email?: string
  client_company?: string
  client_phone?: string
  client_vat_number?: string
  client_fiscal_code?: string
  client_address?: string
  client_city?: string
  client_postal_code?: string
  client_province?: string
  client_sdi_code?: string
  referente_name?: string
  referente_role?: string
  referente_email?: string
  referente_phone?: string
}

export interface QuoteService {
  service_id?: string
  service_name: string
  description?: string
  quantity: number
  duration?: string // Durata del servizio (es. "30 giorni", "6 mesi", "Annuale")
  unit_price: number
  notes?: string
  discount_percentage?: number
}

export interface QuoteData {
  // Identificazione
  quote_number: string
  created_at: string
  valid_until?: string
  validity_days?: number
  
  // Cliente
  client: ClientInfo
  
  // Servizi
  services: QuoteService[]
  
  // Totali
  subtotal: number
  discount_percentage: number
  discount_amount: number
  tax_percentage: number
  tax_amount: number
  total_amount: number
  
  // Note e condizioni
  notes?: string
  payment_terms?: string
  delivery_terms?: string
  warranty_terms?: string
  
  // Stato
  status?: string
  
  // Campi per Proposta Progettuale
  project_name?: string
  vision_summary?: string
  objectives?: string
  timeline?: TimelinePhase[]
  team_members?: string[] // Array di UUID
}

export interface TimelinePhase {
  id: number
  phase: string
  description: string
  duration: string
  startWeek?: number
  endWeek?: number
}

export interface TeamMember {
  id: string
  nome?: string
  cognome?: string
  professione?: string
  foto_profilo?: string
  bio?: string
}

export interface QuoteTerm {
  name: string
  content: string
  order?: number
}

export interface PDFGenerationOptions {
  quote: QuoteData
  companyInfo: CompanyInfo
  terms?: QuoteTerm[]
  logoPath?: string
  includeSignatures?: boolean
  language?: 'it' | 'en'
  teamMembers?: TeamMember[]
  documentType?: 'quote' | 'project_proposal'
}

export interface PDFTheme {
  colors: {
    primary: string
    secondary: string
    text: string
    textLight: string
    background: string
    border: string
    accent: string
  }
  fonts: {
    regular: string
    bold: string
    italic: string
    size: {
      title: number
      heading: number
      body: number
      small: number
      tiny: number
    }
  }
  spacing: {
    page: {
      top: number
      right: number
      bottom: number
      left: number
    }
    section: number
    line: number
  }
}

