/**
 * Libreria per il calcolo dinamico dei prezzi
 * Gestisce il calcolo dei prezzi basato su parametri, varianti, add-ons e modificatori
 */

import {
  Service,
  ServiceVariant,
  ServiceAddon,
  ServicePricingParameter,
  ParameterValue,
  PriceModifier,
  QuoteItemConfiguration,
} from "@/types/quotes.types";

/**
 * Risultato del calcolo prezzo
 */
export interface PriceCalculationResult {
  basePrice: number;
  variantAdjustment: number;
  parametersImpact: number;
  addonsTotal: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  details: {
    parameters: ParameterValue[];
    addons: { name: string; price: number; isRecurring: boolean }[];
  };
}

/**
 * Calcola l'impatto di un singolo parametro sul prezzo
 */
export function calculateParameterImpact(
  param: ServicePricingParameter,
  value: number | string | boolean,
  basePrice: number
): number {
  // Se checkbox non attivo, nessun impatto
  if (param.type === "checkbox" && !value) return 0;

  // Converti il valore in numero per i calcoli
  const numValue =
    typeof value === "number"
      ? value
      : typeof value === "boolean"
      ? value
        ? 1
        : 0
      : 0;

  switch (param.price_impact_mode) {
    case "fixed":
      // Importo fisso aggiunto
      return param.price_impact_value || 0;

    case "per_unit":
      // Prezzo per unità × quantità
      return (param.price_impact_value || 0) * numValue;

    case "percentage":
      // Percentuale del prezzo base
      return basePrice * ((param.price_impact_value || 0) / 100);

    case "multiplier":
      // Moltiplica il prezzo base
      return basePrice * ((param.price_impact_value || 1) - 1) * numValue;

    case "tiered":
      // Calcolo a scaglioni
      if (!param.price_tiers || param.price_tiers.length === 0) return 0;

      let total = 0;
      let remaining = numValue;
      const sortedTiers = [...param.price_tiers].sort((a, b) => a.min - b.min);

      for (const tier of sortedTiers) {
        if (remaining <= 0) break;

        const tierMax = tier.max === null ? Infinity : tier.max;
        const tierRange = tierMax - tier.min + 1;
        const unitsInTier = Math.min(remaining, tierRange);

        total += unitsInTier * tier.price_per_unit;
        remaining -= unitsInTier;
      }

      return total;

    default:
      return 0;
  }
}

/**
 * Calcola l'impatto di un'opzione selezionata (per select/range_select)
 */
export function calculateOptionImpact(
  param: ServicePricingParameter,
  value: string | number
): number {
  if (!param.options) return 0;

  const option = param.options.find((o) => o.value === value);
  return option?.price_impact || 0;
}

/**
 * Calcola il prezzo di una variante
 */
export function calculateVariantPrice(
  basePrice: number,
  variant: ServiceVariant | null
): number {
  if (!variant) return basePrice;

  switch (variant.price_modifier_type) {
    case "override":
      return variant.price_modifier_value;
    case "add":
      return basePrice + variant.price_modifier_value;
    case "multiply":
      return basePrice * variant.price_modifier_value;
    default:
      return basePrice;
  }
}

/**
 * Calcola il prezzo totale di tutti i parametri
 */
export function calculateAllParametersImpact(
  parameters: ServicePricingParameter[],
  values: Record<string, number | string | boolean>,
  basePrice: number
): { total: number; details: ParameterValue[] } {
  let total = 0;
  const details: ParameterValue[] = [];

  for (const param of parameters) {
    const value = values[param.id];
    if (value === undefined) continue;

    let impact: number;

    // Per select e range_select, usa il calcolo delle opzioni
    if (
      (param.type === "select" || param.type === "range_select") &&
      param.options
    ) {
      impact = calculateOptionImpact(param, value as string | number);
    } else {
      impact = calculateParameterImpact(param, value, basePrice);
    }

    total += impact;
    details.push({
      parameter_id: param.id,
      parameter_name: param.label || param.name,
      value,
      calculated_price_impact: impact,
    });
  }

  return { total, details };
}

/**
 * Calcola il prezzo completo di un item del preventivo
 */
export function calculateItemPrice(
  service: Service,
  options: {
    variantId?: string | null;
    quantity?: number;
    parameterValues?: Record<string, number | string | boolean>;
    selectedAddonIds?: string[];
  }
): PriceCalculationResult {
  const {
    variantId = null,
    quantity = 1,
    parameterValues = {},
    selectedAddonIds = [],
  } = options;

  // 1. Prezzo base del servizio
  const basePrice = service.base_price;

  // 2. Calcola prezzo variante
  let variantAdjustment = 0;
  if (variantId && service.variants) {
    const variant = service.variants.find((v) => v.id === variantId);
    if (variant) {
      const variantPrice = calculateVariantPrice(basePrice, variant);
      variantAdjustment = variantPrice - basePrice;
    }
  }
  const priceAfterVariant = basePrice + variantAdjustment;

  // 3. Calcola impatto parametri
  let parametersImpact = 0;
  const parameterDetails: ParameterValue[] = [];

  if (service.pricing_parameters && service.pricing_parameters.length > 0) {
    const { total, details } = calculateAllParametersImpact(
      service.pricing_parameters,
      parameterValues,
      priceAfterVariant
    );
    parametersImpact = total;
    parameterDetails.push(...details);
  }

  // 4. Prezzo unitario
  const unitPrice = priceAfterVariant + parametersImpact;

  // 5. Calcola add-ons
  let addonsTotal = 0;
  const addonDetails: { name: string; price: number; isRecurring: boolean }[] =
    [];

  if (service.addons && selectedAddonIds.length > 0) {
    for (const addonId of selectedAddonIds) {
      const addon = service.addons.find((a) => a.id === addonId);
      if (addon) {
        addonsTotal += addon.price;
        addonDetails.push({
          name: addon.name,
          price: addon.price,
          isRecurring: addon.is_recurring,
        });
      }
    }
  }

  // 6. Totale linea
  const lineTotal = unitPrice * quantity + addonsTotal;

  return {
    basePrice,
    variantAdjustment,
    parametersImpact,
    addonsTotal,
    unitPrice,
    quantity,
    lineTotal,
    details: {
      parameters: parameterDetails,
      addons: addonDetails,
    },
  };
}

/**
 * Calcola il totale di un preventivo
 */
export interface QuoteTotalCalculation {
  subtotalOneTime: number;
  subtotalRecurringMonthly: number;
  subtotalRecurringYearly: number;
  discountAmount: number;
  taxAmount: number;
  totalOneTime: number;
  totalRecurringMonthly: number;
  totalRecurringYearly: number;
  grandTotal: number;
}

export function calculateQuoteTotals(
  items: {
    line_total: number;
    is_recurring: boolean;
    recurring_interval: string | null;
    addons?: {
      line_total: number;
      is_recurring?: boolean;
      recurring_interval?: string | null;
    }[];
  }[],
  discountPercentage: number = 0,
  taxPercentage: number = 22
): QuoteTotalCalculation {
  let subtotalOneTime = 0;
  let subtotalRecurringMonthly = 0;
  let subtotalRecurringYearly = 0;

  for (const item of items) {
    // Calcola il costo base dell'item (esclusi add-ons)
    const addonsTotalRecurring =
      item.addons?.reduce((sum, a) => {
        if (a.is_recurring) {
          if (a.recurring_interval === "year") {
            subtotalRecurringYearly += a.line_total;
          } else {
            subtotalRecurringMonthly += a.line_total;
          }
          return sum;
        }
        return sum + a.line_total;
      }, 0) || 0;

    const addonsOneTime = addonsTotalRecurring;
    const itemBaseTotal = item.line_total - (item.addons?.reduce((s, a) => s + a.line_total, 0) || 0);

    if (item.is_recurring) {
      if (item.recurring_interval === "year") {
        subtotalRecurringYearly += itemBaseTotal;
      } else {
        // Default a mensile
        subtotalRecurringMonthly += itemBaseTotal;
      }
    } else {
      subtotalOneTime += itemBaseTotal + addonsOneTime;
    }
  }

  // Applica sconto solo sul one-time
  const discountAmount = subtotalOneTime * (discountPercentage / 100);
  const totalOneTime = subtotalOneTime - discountAmount;

  // Calcola IVA
  const taxAmount =
    (totalOneTime +
      subtotalRecurringMonthly * 12 +
      subtotalRecurringYearly) *
    (taxPercentage / 100);

  // Grand total (one-time + un anno di ricorrente)
  const grandTotal =
    totalOneTime +
    subtotalRecurringMonthly * 12 +
    subtotalRecurringYearly +
    taxAmount;

  return {
    subtotalOneTime,
    subtotalRecurringMonthly,
    subtotalRecurringYearly,
    discountAmount,
    taxAmount,
    totalOneTime,
    totalRecurringMonthly: subtotalRecurringMonthly,
    totalRecurringYearly: subtotalRecurringYearly,
    grandTotal,
  };
}

/**
 * Applica modificatori globali a un prezzo
 */
export function applyPriceModifiers(
  basePrice: number,
  modifiers: PriceModifier[]
): { finalPrice: number; adjustments: { name: string; amount: number }[] } {
  let finalPrice = basePrice;
  const adjustments: { name: string; amount: number }[] = [];

  for (const modifier of modifiers) {
    let adjustment = 0;

    switch (modifier.modifier_type) {
      case "percentage":
        adjustment = basePrice * (modifier.value / 100);
        break;
      case "fixed":
        adjustment = modifier.value;
        break;
      case "multiplier":
        adjustment = basePrice * modifier.value - basePrice;
        break;
    }

    if (!modifier.is_positive) {
      adjustment = -adjustment;
    }

    finalPrice += adjustment;
    adjustments.push({
      name: modifier.name,
      amount: adjustment,
    });
  }

  return { finalPrice, adjustments };
}

/**
 * Formatta un prezzo in valuta italiana
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

/**
 * Formatta un prezzo compatto
 */
export function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `€${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return `€${value.toFixed(0)}`;
}
