/**
 * Types for Service Configuration System
 * Advanced modular service configuration with add-ons, parameters, and recommendations
 */

import { Service } from './database.types'

// ========================================
// SERVICE MODULES (Add-ons)
// ========================================

export type ModuleType = 'feature' | 'integration' | 'extension' | 'enhancement';

export type PricingType = 'fixed' | 'per_unit' | 'percentage' | 'tiered';

export interface ModulePricingConfig {
  base?: number;
  tiers?: Array<{
    from: number;
    to: number;
    price?: number;
    price_per_unit?: number;
  }>;
  mapping?: Record<string, number>; // Per select options
}

// Type per valori dinamici dei parametri
export type ParameterValue = string | number | boolean | string[] | null;

// Type per possibili valori - può essere array (select) o range (number)
export type PossibleValuesConfig = 
  | string[] 
  | { min?: number; max?: number; step?: number }
  | Record<string, string>;

export interface ModuleParameter {
  key: string;
  name: string;
  type: 'number' | 'select' | 'boolean' | 'text' | 'multiselect';
  default: ParameterValue;
  possible_values?: PossibleValuesConfig;
  pricing_impact?: {
    type: 'per_unit' | 'fixed' | 'percentage' | 'tiered' | 'formula';
    base_value?: number;
    price_per_additional?: number;
    price_if_true?: number;
    formula?: string;
    tiers?: Array<{
      from: number;
      to: number;
      price?: number;
      price_per_unit?: number;
    }>;
    mapping?: Record<string, number>;
  };
  help_text?: string;
  placeholder?: string;
}

export interface ServiceModule {
  id: string;
  name: string;
  slug: string;
  description: string;
  module_type: ModuleType;
  category: string;
  base_price: number;
  pricing_type: PricingType;
  pricing_config?: ModulePricingConfig;
  parameters?: ModuleParameter[];
  metadata?: Record<string, any>;
  icon?: string;
  help_text?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ========================================
// SERVICE TO MODULES MAPPING
// ========================================

export interface ServiceToModuleMapping {
  id: string;
  service_id: string;
  module_id: string;
  is_required: boolean;
  is_default: boolean;
  is_recommended: boolean;
  requires?: string[]; // Array di module_id prerequisiti
  conflicts_with?: string[]; // Array di module_id incompatibili
  price_override?: number;
  discount_percentage?: number;
  display_order: number;
  display_category?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// SERVICE PARAMETERS
// ========================================

export type ParameterType = 'number' | 'select' | 'boolean' | 'text' | 'multiselect';

export interface ParameterPricingImpact {
  type: 'per_unit' | 'fixed' | 'percentage' | 'tiered' | 'formula';
  base_value?: number;
  price_per_additional?: number;
  price_if_true?: number;
  formula?: string;
  tiers?: Array<{
    from: number;
    to: number;
    price?: number;
    price_per_unit?: number;
  }>;
  mapping?: Record<string, number>;
}

export interface ServiceParameter {
  id: string;
  service_id: string;
  parameter_key: string;
  parameter_name: string;
  parameter_type: ParameterType;
  default_value: ParameterValue;
  possible_values?: PossibleValuesConfig;
  validation_rules?: Record<string, unknown>;
  pricing_impact?: ParameterPricingImpact;
  affects_complexity?: boolean;
  help_text?: string;
  placeholder?: string;
  display_order: number;
  display_group?: string;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ========================================
// SERVICE PRESETS
// ========================================

export interface ServicePreset {
  id: string;
  service_id: string;
  name: string;
  slug: string;
  description: string;
  included_modules: string[]; // Array di module_id
  parameters: Record<string, any>;
  total_price?: number;
  discount_percentage: number;
  is_featured: boolean;
  badge_text?: string;
  highlight_color?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ========================================
// SERVICE RELATIONSHIPS (Extended)
// ========================================

export type ServiceRelationshipType =
  | 'related'
  | 'prerequisite'
  | 'complementary'
  | 'alternative'
  | 'upsell'
  | 'frequently_together'
  | 'recommended_addon'
  | 'required_for';

export interface RecommendationConfig {
  priority?: number;
  auto_suggest?: boolean;
  discount_if_bundled?: number;
}

export interface ServiceRelationship {
  id: string;
  service_id: string;
  related_service_id: string;
  relationship_type: ServiceRelationshipType;
  description?: string;
  display_order: number;
  recommendation_config?: RecommendationConfig;
  created_at: string;
  updated_at: string;
}

// ========================================
// CONFIGURAZIONE SERVIZIO NEL PREVENTIVO
// ========================================

export interface QuoteServiceModuleConfig {
  module_id: string;
  module_name: string;
  parameters?: Record<string, any>;
  calculated_price: number;
}

export interface QuoteServiceConfiguration {
  // Servizio base
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  
  // Parametri del servizio principale
  parameters?: Record<string, any>;
  
  // Moduli selezionati
  selected_modules?: QuoteServiceModuleConfig[];
  
  // Pricing
  pricing_params?: {
    base_price: number;
    urgenza?: number;
    complessita?: number;
    volume_lavoro?: number;
    importanza?: number;
    altri_costi?: number;
    budget_interno?: number;
    budget_effettivo?: number;
  };
  
  // Metadata
  notes?: string;
  responsabile_user_id?: string;
  customizations?: Record<string, any>;
  
  // Ricorrenza
  is_recurring?: boolean;
  recurrence_period?: string;
  recurrence_period_months?: number;
  
  // Preset
  preset_id?: string | null;
}

// ========================================
// RELATED SERVICE SUGGESTION
// ========================================

export interface RelatedServiceSuggestion {
  service: {
    id: string;
    name: string;
    base_price: number;
    description?: string;
  };
  relationship_type: ServiceRelationshipType;
  priority: number;
  discount_if_bundled?: number;
  auto_suggest: boolean;
}

// ========================================
// UI STATE
// ========================================

export interface ServiceConfiguratorState {
  service: Service;
  selectedPreset?: ServicePreset;
  selectedModules: string[]; // Array di module_id
  moduleParameters: Record<string, Record<string, any>>; // { module_id: { param_key: value } }
  serviceParameters: Record<string, any>; // { param_key: value }
  calculatedPrice: {
    basePrice: number;
    parametersPrice: number;
    modulesPrice: number;
    total: number;
  };
}

// ========================================
// API RESPONSES
// ========================================

export interface GetServiceConfigurationResponse {
  service: Service;
  available_modules: ServiceModule[];
  module_mappings: ServiceToModuleMapping[];
  parameters: ServiceParameter[];
  presets: ServicePreset[];
  related_services: RelatedServiceSuggestion[];
}

export interface CalculatePriceRequest {
  service_id: string;
  parameters?: Record<string, any>;
  selected_modules?: Array<{
    module_id: string;
    parameters?: Record<string, any>;
  }>;
}

export interface CalculatePriceResponse {
  base_price: number;
  parameters_price: number;
  modules_price: number;
  total_price: number;
  breakdown: {
    service_base: number;
    service_parameters: Array<{
      key: string;
      name: string;
      value: ParameterValue;
      price_impact: number;
    }>;
    modules: Array<{
      module_id: string;
      module_name: string;
      base_price: number;
      parameters_price: number;
      total_price: number;
    }>;
  };
}

