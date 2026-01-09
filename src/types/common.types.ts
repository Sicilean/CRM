/**
 * Common Types - Sicilean Gestionale
 * 
 * Interfacce TypeScript condivise per garantire type safety
 * attraverso l'applicazione.
 * 
 * Queste interfacce sono basate sulle strutture dati effettive
 * utilizzate nel database e nell'applicazione.
 */

/**
 * Team Member - Membro del team per proposte progettuali
 * Basato su profiles table
 */
export interface TeamMember {
  id: string
  nome: string | null
  cognome: string | null
  professione: string | null
  foto_profilo: string | null
  email?: string | null
}

/**
 * Available User - Utente disponibile per assegnazione responsabilità
 * Basato su profiles_with_email view
 */
export interface AvailableUser {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
  professione: string | null
}

/**
 * Project Summary - Riepilogo progetto per selezione
 * Basato su projects table
 */
export interface ProjectSummary {
  id: string
  project_number: string
  nome: string
  descrizione: string | null
  stato: string
  persona_giuridica_id: string | null
  persona_fisica_id: string | null
  valore_preventivato: number | null
  project_types: string[]
  data_creazione: string | null
}

/**
 * Client - Cliente (persona fisica o giuridica)
 * Interfaccia unificata per gestione cliente nei form
 */
export interface Client {
  id: string
  type: 'persona_fisica' | 'persona_giuridica'
  nome?: string
  cognome?: string
  ragione_sociale?: string
  email: string | null
  telefono: string | null
  piva?: string
  codice_fiscale?: string
  sdi_code?: string
  indirizzo?: string
  citta?: string
  provincia?: string
  cap?: string
  paese?: string
}

/**
 * Referente - Referente aziendale o persona di contatto
 */
export interface Referente {
  id?: string
  nome: string
  cognome: string
  ruolo?: string
  email?: string
  telefono?: string
  persona_giuridica_id?: string
}

/**
 * Service Configuration - Configurazione servizio nel preventivo
 * Struttura JSON memorizzata in quotes.services
 */
export interface QuoteServiceConfig {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
  base_price: number
  discount?: number
  
  // Parametri pricing
  urgenza?: number
  complessita?: number
  volume_lavoro?: number
  importanza?: number
  altri_costi?: number
  
  // Servizi ricorrenti
  duration?: {
    period_months: number
    recurrence_period: 'mensile' | 'bimensile' | 'trimestrale' | 'semestrale' | 'annuale'
  } | null
  
  // Responsabile servizio
  responsabile_user_id?: string | null
  
  // Customizations
  customizations?: {
    dominio?: string
    cliente_slug?: string
    provider?: string
    [key: string]: string | number | boolean | null | undefined
  }
  
  // Metadata
  notes?: string
  description?: string
}

/**
 * Timeline Phase - Fase della timeline progettuale
 * Usata nelle proposte progettuali
 */
export interface TimelinePhase {
  id: number
  phase: string
  description: string
  duration: string
  startWeek?: number
  endWeek?: number
}

/**
 * Pricing Configuration - Configurazione pricing attiva
 * Basato su pricing_configuration table
 */
export interface PricingConfiguration {
  id: string
  nome_configurazione: string
  is_active: boolean
  created_at: string
  
  // Moltiplicatori
  moltiplicatore_urgenza: Record<string, number>
  moltiplicatore_complessita: Record<string, number>
  moltiplicatore_volume: Record<string, number>
  moltiplicatore_importanza: Record<string, number>
  
  // Modificatori globali
  modificatore_cliente_abituale: number
  modificatore_prosperita: Record<string, number>
  
  // Metadata
  note?: string
}

/**
 * Service - Servizio del catalogo
 * Basato su services table
 */
export interface Service {
  id: string
  notion_id: string
  name: string
  description: string | null
  type: 'Brand' | 'Software' | 'Strategy' | 'Accessory' | 'Setup' | 'Managed'
  area: string | null
  output_type: 'brand' | 'software' | 'consulting' | 'strategy' | 'managed_service' | 'mixed' | null
  base_price: number
  estimated_hours: number | null
  
  // Ricorrenza
  is_recurring: boolean
  recurrence_period: 'mensile' | 'bimensile' | 'trimestrale' | 'semestrale' | 'annuale' | null
  recurrence_period_months: number | null
  
  // Auto-generazione
  auto_generate_requirements: boolean
  auto_generate_brand_assets: boolean
  auto_generate_managed_services: boolean
  
  // Default
  default_project_type: string | null
  responsabile_user_id: string | null
  
  // Metadata
  tags: string[]
  configuration: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

/**
 * Software Project Summary - Riepilogo progetto software
 * Per linking in preventivi
 */
export interface SoftwareProjectSummary {
  id: string
  nome: string
  descrizione: string | null
  tipo_progetto: string
  stato: string
  project_id: string | null
  persona_giuridica_id: string | null
}

/**
 * Brand Kit Summary - Riepilogo brand kit
 * Per linking in preventivi
 */
export interface BrandKitSummary {
  id: string
  nome: string
  descrizione: string | null
  stato: string
  project_id: string | null
  persona_giuridica_id: string | null
  tipo_gestione: string
}

/**
 * Managed Service - Servizio gestito
 * Basato su servizi_gestiti table
 */
export interface ManagedService {
  id: string
  notion_id: string
  nome: string
  tipo: string
  descrizione: string | null
  stato: string
  project_id: string | null
  persona_giuridica_id: string | null
  responsabile_user_id: string | null
  responsabile_email: string | null
  
  // Date
  inizio_servizio: string | null
  data_rinnovo: string | null
  next_renewal_date: string | null
  
  // Ricorrenza
  is_recurring: boolean
  recurrence_period: string | null
  recurrence_period_months: number | null
  rinnovo_automatico: boolean
  rinnovo_periodicita: string | null
  
  // Slot (per servizi ricorrenti)
  total_slots: number | null
  current_slot: number | null
  slots_paid: number | null
  
  // Billing
  billing_type: string | null
  unit_price: number | null
  total_value: number | null
  
  // Metadata
  link: string | null
  note: string | null
  raw_notion_data: Record<string, unknown> | null
}

/**
 * Form Data Types - Tipi per gestione form
 */
export type ClientType = 'persona_fisica' | 'persona_giuridica'

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export type ProjectStatus = 
  | 'contratto_firmato'
  | 'concept'
  | 'design'
  | 'sviluppo'
  | 'revisione'
  | 'completato'
  | 'sospeso'
  | 'annullato'

/**
 * Helper type per form select options
 */
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  metadata?: Record<string, unknown>
}

/**
 * Pagination Info
 */
export interface PaginationInfo {
  page: number
  pageSize: number
  totalCount: number
  hasMore: boolean
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

