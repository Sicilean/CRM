import { PricingConfiguration, PricingParams } from '@/types/database.types'

/**
 * Configurazione di default (fallback se non caricata dal DB)
 */
export const DEFAULT_PRICING_CONFIG: Omit<PricingConfiguration, 'id' | 'is_active' | 'created_at' | 'updated_at' | 'created_by'> = {
  name: 'Configurazione Standard',
  description: 'Configurazione predefinita del sistema',
  
  // Pesi per Formula Budget Interno
  peso_urgenza: 1/12,         // 0.08333
  peso_complessita: 1/12,     // 0.08333
  peso_cliente_abituale: 1/17, // 0.05882
  peso_volume_lavoro: 1/12,   // 0.08333
  
  // Pesi per Formula Budget Effettivo
  moltiplicatore_arrotondamento: 1/4,  // 0.25
  moltiplicatore_base: 10,
  peso_prosperita_economica: 1/12,  // 0.08333
  peso_importanza: 1/12,            // 0.08333
}

/**
 * Parametri di default per i valori non specificati
 */
export const DEFAULT_PRICING_PARAMS = {
  urgenza: 2,
  complessita: 2,
  volume_lavoro: 2,
  importanza: 2,
  cliente_abituale: 2,
  prosperita_economica: 2,
  altri_costi: 0,
}

/**
 * Calcola il Budget Interno
 * 
 * Formula: 
 * budgetInterno = prezzoBase 
 *   * (1 + urgenza * peso_urgenza) 
 *   * (1 + complessita * peso_complessita)
 *   * (1 - clienteAbituale * peso_cliente_abituale)
 *   * (1 + volumeLavoro * peso_volume_lavoro)
 */
export function calculateBudgetInterno(
  prezzoBase: number,
  urgenza: number,
  complessita: number,
  clienteAbituale: number,
  volumeLavoro: number,
  config: Partial<PricingConfiguration> = DEFAULT_PRICING_CONFIG
): number {
  const cfg = { ...DEFAULT_PRICING_CONFIG, ...config }
  
  const result = prezzoBase
    * (1 + urgenza * cfg.peso_urgenza)
    * (1 + complessita * cfg.peso_complessita)
    * (1 - clienteAbituale * cfg.peso_cliente_abituale)
    * (1 + volumeLavoro * cfg.peso_volume_lavoro)
  
  return Math.round(result * 100) / 100 // Arrotonda a 2 decimali
}

/**
 * Calcola il Budget Effettivo (prezzo finale per il cliente)
 * 
 * Formula:
 * budgetEffettivo = (round((budgetInterno + altriCosti) * moltiplicatore_arrotondamento) * moltiplicatore_base)
 *   * (1 + prosperitaEconomica * peso_prosperita)
 *   * (1 + importanza * peso_importanza)
 */
export function calculateBudgetEffettivo(
  budgetInterno: number,
  altriCosti: number,
  prosperitaEconomica: number,
  importanza: number,
  config: Partial<PricingConfiguration> = DEFAULT_PRICING_CONFIG
): number {
  const cfg = { ...DEFAULT_PRICING_CONFIG, ...config }
  
  const base = Math.round((budgetInterno + altriCosti) * cfg.moltiplicatore_arrotondamento)
  const result = base * cfg.moltiplicatore_base
    * (1 + prosperitaEconomica * cfg.peso_prosperita_economica)
    * (1 + importanza * cfg.peso_importanza)
  
  return Math.round(result * 100) / 100 // Arrotonda a 2 decimali
}

/**
 * Calcola completamente i parametri di pricing per un servizio
 */
export function calculateFullPricing(
  basePrice: number,
  serviceLevelParams: {
    urgenza?: number
    complessita?: number
    volume_lavoro?: number
    importanza?: number
    altri_costi?: number
  },
  quoteLevelParams: {
    cliente_abituale?: number
    prosperita_economica?: number
  },
  config?: Partial<PricingConfiguration>
): PricingParams {
  // Applica defaults
  const urgenza = serviceLevelParams.urgenza ?? DEFAULT_PRICING_PARAMS.urgenza
  const complessita = serviceLevelParams.complessita ?? DEFAULT_PRICING_PARAMS.complessita
  const volumeLavoro = serviceLevelParams.volume_lavoro ?? DEFAULT_PRICING_PARAMS.volume_lavoro
  const importanza = serviceLevelParams.importanza ?? DEFAULT_PRICING_PARAMS.importanza
  const altriCosti = serviceLevelParams.altri_costi ?? DEFAULT_PRICING_PARAMS.altri_costi
  
  const clienteAbituale = quoteLevelParams.cliente_abituale ?? DEFAULT_PRICING_PARAMS.cliente_abituale
  const prosperitaEconomica = quoteLevelParams.prosperita_economica ?? DEFAULT_PRICING_PARAMS.prosperita_economica
  
  // Calcola Budget Interno
  const budgetInterno = calculateBudgetInterno(
    basePrice,
    urgenza,
    complessita,
    clienteAbituale,
    volumeLavoro,
    config
  )
  
  // Calcola Budget Effettivo
  const budgetEffettivo = calculateBudgetEffettivo(
    budgetInterno,
    altriCosti,
    prosperitaEconomica,
    importanza,
    config
  )
  
  return {
    base_price: basePrice,
    urgenza,
    complessita,
    volume_lavoro: volumeLavoro,
    importanza,
    altri_costi: altriCosti,
    budget_interno: budgetInterno,
    budget_effettivo: budgetEffettivo,
  }
}

/**
 * Valida che i parametri siano nel range corretto (0-5)
 */
export function validatePricingParam(value: number | undefined, defaultValue: number = 2): number {
  if (value === undefined || value === null) return defaultValue
  if (value < 0) return 0
  if (value > 5) return 5
  return value
}

