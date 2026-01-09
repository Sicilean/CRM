// =====================================================
// TIPI PER IL NUOVO SISTEMA PREVENTIVI E SERVIZI
// =====================================================

import { Json } from './database.types'

// =====================================================
// MACRO AREAS
// =====================================================

export interface MacroArea {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// =====================================================
// SERVICES
// =====================================================

export type PricingType = 'fixed' | 'range' | 'tiered' | 'recurring' | 'time_based' | 'composite'
export type RecurringInterval = 'month' | 'quarter' | 'year'
export type TimeUnit = 'hour' | 'day' | 'week'
export type DeliveryUnit = 'days' | 'weeks' | 'months'

export interface PricingTier {
  min: number
  max: number
  price_per_unit: number
}

export interface PricingVariable {
  name: string
  price?: number
  price_per_unit?: number
  unit?: string
}

// =====================================================
// SERVICE PRICING PARAMETERS (Parametri Dinamici)
// =====================================================

/**
 * Tipi di parametro supportati per il pricing dinamico
 */
export type ParameterType = 'number' | 'select' | 'slider' | 'checkbox' | 'range_select'

/**
 * Modalità di impatto sul prezzo
 * - fixed: aggiunge un valore fisso (es. +€500)
 * - per_unit: moltiplica per quantità (es. €50 × num_prodotti)
 * - percentage: percentuale sul prezzo base (es. +20%)
 * - multiplier: moltiplica il prezzo base (es. ×1.5)
 * - tiered: usa scaglioni per il calcolo
 */
export type PriceImpactMode = 'fixed' | 'per_unit' | 'percentage' | 'multiplier' | 'tiered'

/**
 * Opzione per parametri di tipo select
 */
export interface ParameterOption {
  value: string | number
  label: string
  price_impact: number // Valore da usare nel calcolo
  description?: string
}

/**
 * Scaglione per parametri con pricing tiered
 */
export interface ParameterTier {
  min: number
  max: number | null // null = illimitato
  price_per_unit: number
  label?: string
}

/**
 * Definizione di un parametro di pricing per un servizio
 * Salvato in services.pricing_parameters (JSONB)
 */
export interface ServicePricingParameter {
  id: string // UUID generato
  name: string // Nome tecnico (es. "num_products")
  label: string // Label UI (es. "Numero Prodotti")
  description?: string
  type: ParameterType
  
  // Configurazione per tipo 'number' e 'slider'
  min?: number
  max?: number
  step?: number
  default_value?: number | string | boolean
  
  // Configurazione per tipo 'select' e 'range_select'
  options?: ParameterOption[]
  
  // Configurazione pricing
  price_impact_mode: PriceImpactMode
  price_impact_value?: number // Usato per fixed, per_unit, percentage, multiplier
  price_tiers?: ParameterTier[] // Usato per tiered
  
  // UI
  unit_label?: string // es. "prodotti", "pagine", "ore"
  help_text?: string
  is_required: boolean
  show_in_summary: boolean // Mostrare nel riepilogo preventivo
  sort_order: number
}

/**
 * Valore di un parametro inserito nel preventivo
 */
export interface ParameterValue {
  parameter_id: string
  parameter_name: string
  value: number | string | boolean
  calculated_price_impact: number
  show_in_summary?: boolean
}

/**
 * Estensione della configurazione per includere i parametri
 */
export interface ServicePricingConfig {
  parameters: ServicePricingParameter[]
}

export interface Service {
  id: string
  macro_area_id: string | null
  name: string
  slug: string
  description: string | null
  short_description: string | null
  
  // Pricing
  pricing_type: PricingType
  base_price: number
  max_price: number | null
  setup_fee: number | null
  recurring_interval: RecurringInterval | null
  time_unit: TimeUnit | null
  pricing_tiers: PricingTier[] | null
  pricing_variables: { components: PricingVariable[] } | null
  
  // Parametri dinamici per pricing
  pricing_parameters: ServicePricingParameter[] | null
  
  // Configurazione
  is_recurring: boolean
  requires_quantity_input: boolean
  min_quantity: number
  max_quantity: number | null
  default_quantity: number
  requires_manual_pricing: boolean
  is_featured: boolean
  is_active: boolean
  
  // Metadati
  estimated_delivery_days: number | null
  delivery_unit: DeliveryUnit
  tags: string[]
  custom_fields: Json
  
  sort_order: number
  created_at: string
  updated_at: string
  
  // Relazioni (opzionali, per query con join)
  macro_area?: MacroArea | null
  variants?: ServiceVariant[]
  addons?: ServiceAddon[]
}

// =====================================================
// SERVICE VARIANTS
// =====================================================

export type PriceModifierType = 'override' | 'add' | 'multiply'

export interface ServiceVariant {
  id: string
  service_id: string
  name: string
  description: string | null
  price_modifier_type: PriceModifierType
  price_modifier_value: number
  features: string[] | null
  is_default: boolean
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// =====================================================
// SERVICE ADDONS
// =====================================================

export interface ServiceAddon {
  id: string
  service_id: string
  name: string
  description: string | null
  price: number
  is_recurring: boolean
  recurring_interval: RecurringInterval | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// =====================================================
// SERVICE DEPENDENCIES
// =====================================================

export type DependencyType = 'required' | 'suggested' | 'conflicts_with' | 'prerequisite'

export interface ServiceDependency {
  id: string
  service_id: string
  depends_on_service_id: string
  dependency_type: DependencyType
  auto_add: boolean
  message: string | null
  discount_percentage: number
  created_at: string
  
  // Relazioni (opzionali)
  depends_on_service?: Service | null
}

// =====================================================
// BUNDLES
// =====================================================

export type BundleDiscountType = 'percentage' | 'fixed'

export interface Bundle {
  id: string
  name: string
  slug: string
  description: string | null
  service_ids: string[]
  discount_type: BundleDiscountType
  discount_value: number
  bundle_price: number | null
  is_active: boolean
  is_featured: boolean
  valid_from: string | null
  valid_until: string | null
  created_at: string
  updated_at: string
  
  // Relazioni (opzionali)
  services?: Service[]
}

// =====================================================
// PRICE MODIFIERS
// =====================================================

export type ModifierType = 'percentage' | 'fixed' | 'multiplier'
export type AppliesTo = 'all' | 'specific_macro_area' | 'specific_service'

export interface PriceModifier {
  id: string
  name: string
  code: string
  description: string | null
  modifier_type: ModifierType
  value: number
  applies_to: AppliesTo
  macro_area_id: string | null
  service_id: string | null
  is_positive: boolean
  is_active: boolean
  valid_from: string | null
  valid_until: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

// =====================================================
// QUOTES
// =====================================================

export type QuoteStatus = 'draft' | 'review' | 'sent' | 'negotiating' | 'accepted' | 'rejected' | 'expired' | 'converted'

export interface TimelinePhase {
  id: number
  phase: string
  description: string
  duration: string
  startWeek?: number
  endWeek?: number
}

export interface Quote {
  id: string
  quote_number: string
  version: number
  parent_quote_id: string | null
  
  // Client info
  client_name: string
  client_email: string
  client_company: string | null
  client_phone: string | null
  client_vat: string | null
  client_fiscal_code: string | null
  client_address: string | null
  client_sdi_code: string | null
  client_pec: string | null
  
  // Riferimenti
  persona_fisica_id: string | null
  persona_giuridica_id: string | null
  contact_id: string | null
  referente_name: string | null
  referente_role: string | null
  
  // Prezzi
  subtotal_one_time: number
  subtotal_recurring_monthly: number
  subtotal_recurring_yearly: number
  discount_amount: number
  discount_percentage: number
  tax_percentage: number
  tax_amount: number
  total_one_time: number
  total_recurring_monthly: number
  total_recurring_yearly: number
  grand_total: number
  
  // Status & workflow
  status: QuoteStatus
  valid_until: string | null
  sent_at: string | null
  accepted_at: string | null
  rejected_at: string | null
  
  // Altro
  notes: string | null
  client_notes: string | null
  terms_and_conditions: string | null
  payment_terms: string | null
  estimated_delivery: string | null
  
  // Proposta progettuale
  project_name: string | null
  vision_summary: string | null
  objectives: string | null
  timeline: TimelinePhase[] | null
  team_members: string[] | null
  
  // PDF
  pdf_path: string | null
  pdf_generated_at: string | null
  
  created_by: string | null
  created_at: string
  updated_at: string
  
  // Relazioni (opzionali)
  items?: QuoteItem[]
  modifiers_applied?: QuoteModifierApplied[]
  bundles_applied?: QuoteBundleApplied[]
}

// =====================================================
// QUOTE ITEMS
// =====================================================

export interface QuoteItemConfiguration {
  selected_modules?: string[]
  parameters?: Record<string, any>
  custom_options?: Record<string, any>
  
  // Parametri dinamici con valori e calcoli
  pricing_parameters?: ParameterValue[]
  
  // Prezzo base prima dei parametri
  base_price_before_params?: number
  
  // Totale impatto dei parametri
  total_params_impact?: number
}

export interface QuoteItem {
  id: string
  quote_id: string
  service_id: string | null
  variant_id: string | null
  
  // Info servizio (frozen)
  service_name: string
  service_description: string | null
  
  quantity: number
  unit_price: number
  line_total: number
  
  // Pricing dettagli
  is_recurring: boolean
  recurring_interval: RecurringInterval | null
  setup_fee: number
  
  // Override
  custom_name: string | null
  custom_description: string | null
  
  // Sconto
  discount_percentage: number
  discount_amount: number
  
  // Configurazione
  configuration: QuoteItemConfiguration
  
  notes: string | null
  sort_order: number
  created_at: string
  
  // Relazioni (opzionali)
  service?: Service | null
  variant?: ServiceVariant | null
  addons?: QuoteItemAddon[]
}

// =====================================================
// QUOTE ITEM ADDONS
// =====================================================

export interface QuoteItemAddon {
  id: string
  quote_item_id: string
  addon_id: string | null
  addon_name: string
  quantity: number
  unit_price: number
  line_total: number
  is_recurring: boolean
  recurring_interval: RecurringInterval | null
  created_at: string
}

// =====================================================
// QUOTE MODIFIERS APPLIED
// =====================================================

export interface QuoteModifierApplied {
  id: string
  quote_id: string
  modifier_id: string | null
  modifier_name: string
  modifier_type: ModifierType
  value: number
  calculated_amount: number
  notes: string | null
  created_at: string
}

// =====================================================
// QUOTE BUNDLES APPLIED
// =====================================================

export interface QuoteBundleApplied {
  id: string
  quote_id: string
  bundle_id: string | null
  bundle_name: string
  discount_amount: number
  created_at: string
}

// =====================================================
// HELPER TYPES
// =====================================================

// Servizio con tutte le relazioni caricate
export interface ServiceWithRelations extends Service {
  macro_area: MacroArea | null
  variants: ServiceVariant[]
  addons: ServiceAddon[]
  dependencies: ServiceDependency[]
}

// Preventivo con tutte le relazioni caricate
export interface QuoteWithRelations extends Quote {
  items: (QuoteItem & {
    addons: QuoteItemAddon[]
  })[]
  modifiers_applied: QuoteModifierApplied[]
  bundles_applied: QuoteBundleApplied[]
}

// =====================================================
// CONSTANTS
// =====================================================

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  fixed: 'Prezzo Fisso',
  range: 'Range di Prezzo',
  tiered: 'A Scaglioni',
  recurring: 'Ricorrente',
  time_based: 'A Tempo',
  composite: 'Composito'
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Bozza',
  review: 'In Revisione',
  sent: 'Inviato',
  negotiating: 'In Negoziazione',
  accepted: 'Accettato',
  rejected: 'Rifiutato',
  expired: 'Scaduto',
  converted: 'Convertito'
}

export const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  review: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-blue-100 text-blue-800',
  negotiating: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
  converted: 'bg-emerald-100 text-emerald-800'
}

export const RECURRING_INTERVAL_LABELS: Record<RecurringInterval, string> = {
  month: 'Mese',
  quarter: 'Trimestre',
  year: 'Anno'
}

export const TIME_UNIT_LABELS: Record<TimeUnit, string> = {
  hour: 'Ora',
  day: 'Giorno',
  week: 'Settimana'
}

export const DEPENDENCY_TYPE_LABELS: Record<DependencyType, string> = {
  required: 'Obbligatorio',
  suggested: 'Suggerito',
  conflicts_with: 'Incompatibile',
  prerequisite: 'Prerequisito'
}

export const DEPENDENCY_TYPE_COLORS: Record<DependencyType, string> = {
  required: 'text-red-600 bg-red-50 border-red-200',
  suggested: 'text-blue-600 bg-blue-50 border-blue-200',
  conflicts_with: 'text-orange-600 bg-orange-50 border-orange-200',
  prerequisite: 'text-purple-600 bg-purple-50 border-purple-200'
}

// =====================================================
// CONSTANTS - PRICING PARAMETERS
// =====================================================

export const PARAMETER_TYPE_LABELS: Record<ParameterType, string> = {
  number: 'Numero',
  select: 'Selezione',
  slider: 'Slider',
  checkbox: 'Checkbox',
  range_select: 'Range'
}

export const PRICE_IMPACT_MODE_LABELS: Record<PriceImpactMode, string> = {
  fixed: 'Fisso (€)',
  per_unit: 'Per Unità (€ × quantità)',
  percentage: 'Percentuale (%)',
  multiplier: 'Moltiplicatore (×)',
  tiered: 'A Scaglioni'
}

export const PARAMETER_TYPE_ICONS: Record<ParameterType, string> = {
  number: '🔢',
  select: '📋',
  slider: '🎚️',
  checkbox: '☑️',
  range_select: '📊'
}

// =====================================================
// QUOTE PUBLIC TOKENS
// =====================================================

export interface QuotePublicToken {
  id: string
  quote_id: string
  token: string
  password_hash: string | null
  requires_password: boolean
  expires_at: string | null
  is_active: boolean
  usage_count: number
  last_used_at: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// =====================================================
// COMMERCIAL METRICS (Metriche Commerciali)
// =====================================================

/**
 * Metriche commerciali calcolate per il preventivo
 * Usate internamente dal commerciale, non visibili al cliente
 */
export interface QuoteCommercialMetrics {
  /** Totale imponibile (somma servizi + addons - sconti) */
  totalImponibile: number
  
  /** Budget costi variabili interni (40% dell'imponibile) */
  budgetCostiVariabili: number
  
  /** Budget strumentazione/ads/terze parti (10% dell'imponibile) */
  budgetStrumentazione: number
  
  /** Totale costi stimati (costi variabili + strumentazione) */
  totaleCosti: number
  
  /** IVA (22% dell'imponibile) */
  iva: number
  
  /** Prezzo finale al cliente (imponibile + IVA) */
  prezzoFinaleCliente: number
  
  /** Margine atteso (imponibile - costi) */
  margineAtteso: number
  
  /** Percentuale margine atteso */
  percentualeMargine: number
}

// =====================================================
// RECURRING BREAKDOWN
// =====================================================

/**
 * Breakdown dettagliato dei costi ricorrenti
 */
export interface RecurringBreakdown {
  /** Totale ricorrente mensile */
  monthly: number
  /** Totale ricorrente trimestrale */
  quarterly: number
  /** Totale ricorrente annuale */
  yearly: number
  /** Dettaglio per ogni voce ricorrente */
  items: RecurringItem[]
}

export interface RecurringItem {
  name: string
  amount: number
  interval: RecurringInterval
  /** Numero di periodi (es. 12 mesi, 4 trimestri) */
  periodsCount?: number
  isAddon: boolean
  serviceItemId?: string
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calcola le metriche commerciali da un preventivo
 */
export function calculateCommercialMetrics(imponibile: number): QuoteCommercialMetrics {
  const budgetCostiVariabili = imponibile * 0.40
  const budgetStrumentazione = imponibile * 0.10
  const totaleCosti = budgetCostiVariabili + budgetStrumentazione
  const iva = imponibile * 0.22
  const prezzoFinaleCliente = imponibile + iva
  const margineAtteso = imponibile - totaleCosti
  const percentualeMargine = imponibile > 0 ? (margineAtteso / imponibile) * 100 : 0
  
  return {
    totalImponibile: imponibile,
    budgetCostiVariabili,
    budgetStrumentazione,
    totaleCosti,
    iva,
    prezzoFinaleCliente,
    margineAtteso,
    percentualeMargine
  }
}

/**
 * Converte intervallo ricorrente in label italiano con quantità
 */
export function formatRecurringWithCount(
  interval: RecurringInterval | null,
  count?: number
): string {
  if (!interval) return 'una tantum'
  
  const labels: Record<RecurringInterval, { singular: string, plural: string }> = {
    month: { singular: 'mese', plural: 'mesi' },
    quarter: { singular: 'trimestre', plural: 'trimestri' },
    year: { singular: 'anno', plural: 'anni' }
  }
  
  const label = labels[interval]
  if (!label) return interval
  
  if (count && count > 1) {
    return `${count} ${label.plural}`
  }
  
  return `/${label.singular}`
}
