"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Service,
  ServiceVariant,
  ServiceAddon,
  ServicePricingParameter,
  ParameterValue,
  QuoteItemConfiguration,
  RECURRING_INTERVAL_LABELS,
} from "@/types/quotes.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calculator,
  Package,
  Plus,
  RefreshCw,
  HelpCircle,
  Check,
  ShoppingCart,
  Layers,
  Settings2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InitialConfigValues {
  variant_id: string | null;
  quantity: number;
  selectedAddons: string[];
  parameterValues: Record<string, number | string | boolean>;
}

interface ServiceConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service & {
    variants: ServiceVariant[];
    addons: ServiceAddon[];
  };
  onConfirm: (config: {
    variant_id: string | null;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    base_price: number;
    params_impact: number;
    addons: {
      addon_id: string;
      addon_name: string;
      price: number;
      is_recurring: boolean;
      recurring_interval: string | null;
    }[];
    configuration: QuoteItemConfiguration;
  }) => void;
  initialValues?: InitialConfigValues;
}

export default function ServiceConfigurationDialog({
  open,
  onOpenChange,
  service,
  onConfirm,
  initialValues,
}: ServiceConfigurationDialogProps) {
  // State
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [quantity, setQuantity] = useState(service.default_quantity || 1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [parameterValues, setParameterValues] = useState<
    Record<string, number | string | boolean>
  >({});

  // Initialize defaults or use initial values for reconfiguration
  useEffect(() => {
    if (open) {
      if (initialValues) {
        // Usa i valori esistenti per la riconfigurazione
        setSelectedVariantId(initialValues.variant_id);
        setQuantity(initialValues.quantity);
        setSelectedAddons(initialValues.selectedAddons);
        setParameterValues(initialValues.parameterValues);
      } else {
        // Default per nuovo servizio
        const defaultVariant = service.variants?.find((v) => v.is_default);
        setSelectedVariantId(defaultVariant?.id || null);

        // Default quantity
        setQuantity(service.default_quantity || 1);

        // Reset addons
        setSelectedAddons([]);

        // Default parameter values
        const defaults: Record<string, number | string | boolean> = {};
        (service.pricing_parameters || []).forEach((param) => {
          if (param.default_value !== undefined) {
            defaults[param.id] = param.default_value;
          } else if (param.type === "checkbox") {
            defaults[param.id] = false;
          } else if (param.type === "number" || param.type === "slider") {
            defaults[param.id] = param.min || 0;
          } else if (param.type === "select" && param.options?.length) {
            defaults[param.id] = param.options[0].value;
          }
        });
        setParameterValues(defaults);
      }
    }
  }, [open, service, initialValues]);

  // Calculate parameter impact
  const calculateParameterImpact = useCallback((
    param: ServicePricingParameter,
    value: number | string | boolean
  ): number => {
    if (param.type === "checkbox" && !value) return 0;

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
        return param.price_impact_value || 0;

      case "per_unit":
        return (param.price_impact_value || 0) * numValue;

      case "percentage":
        return service.base_price * ((param.price_impact_value || 0) / 100);

      case "multiplier":
        return (
          service.base_price * ((param.price_impact_value || 1) - 1) * numValue
        );

      case "tiered":
        if (!param.price_tiers) return 0;
        let total = 0;
        let remaining = numValue;
        const sortedTiers = [...param.price_tiers].sort(
          (a, b) => a.min - b.min
        );
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
        break;
    }

    // Handle select options
    if (param.type === "select" || param.type === "range_select") {
      const option = param.options?.find((o) => o.value === value);
      if (option) {
        return option.price_impact;
      }
    }

    return 0;
  }, [service.base_price]);

  // Calculate prices
  const calculations = useMemo(() => {
    // Base price from variant or service
    let basePrice = service.base_price;
    let variantName: string | null = null;

    if (selectedVariantId) {
      const variant = service.variants?.find((v) => v.id === selectedVariantId);
      if (variant) {
        variantName = variant.name;
        if (variant.price_modifier_type === "override") {
          basePrice = variant.price_modifier_value;
        } else if (variant.price_modifier_type === "add") {
          basePrice = service.base_price + variant.price_modifier_value;
        } else if (variant.price_modifier_type === "multiply") {
          basePrice = service.base_price * variant.price_modifier_value;
        }
      }
    }

    // Calculate parameters impact
    let paramsImpact = 0;
    const paramValues: ParameterValue[] = [];

    (service.pricing_parameters || []).forEach((param) => {
      const value = parameterValues[param.id];
      if (value !== undefined) {
        const impact = calculateParameterImpact(param, value);
        paramsImpact += impact;
        paramValues.push({
          parameter_id: param.id,
          parameter_name: param.name,
          value,
          calculated_price_impact: impact,
        });
      }
    });

    // Calculate addons total
    let addonsTotal = 0;
    const selectedAddonDetails = selectedAddons
      .map((addonId) => {
        const addon = service.addons?.find((a) => a.id === addonId);
        if (addon) {
          addonsTotal += addon.price;
          return {
            addon_id: addon.id,
            addon_name: addon.name,
            price: addon.price,
            is_recurring: addon.is_recurring,
            recurring_interval: addon.recurring_interval,
          };
        }
        return null;
      })
      .filter(Boolean) as {
      addon_id: string;
      addon_name: string;
      price: number;
      is_recurring: boolean;
      recurring_interval: string | null;
    }[];

    // Calculate unit price and total
    const unitPrice = basePrice + paramsImpact;
    const lineTotal = unitPrice * quantity + addonsTotal;

    return {
      basePrice,
      variantName,
      paramsImpact,
      paramValues,
      addonsTotal,
      selectedAddonDetails,
      unitPrice,
      lineTotal,
    };
  }, [service, selectedVariantId, quantity, selectedAddons, parameterValues, calculateParameterImpact]);

  const handleConfirm = () => {
    onConfirm({
      variant_id: selectedVariantId,
      variant_name: calculations.variantName,
      quantity,
      unit_price: calculations.unitPrice,
      base_price: calculations.basePrice,
      params_impact: calculations.paramsImpact,
      addons: calculations.selectedAddonDetails,
      configuration: {
        pricing_parameters: calculations.paramValues,
        base_price_before_params: calculations.basePrice,
        total_params_impact: calculations.paramsImpact,
      },
    });
    onOpenChange(false);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  const hasParameters =
    service.pricing_parameters && service.pricing_parameters.length > 0;
  const hasVariants = service.variants && service.variants.length > 0;
  const hasAddons = service.addons && service.addons.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] max-h-[900px] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{service.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {service.short_description ||
                  "Configura le opzioni del servizio"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content - 2 Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Configuration */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Varianti */}
                {hasVariants && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      <Label className="text-lg font-semibold">
                        Seleziona Variante
                      </Label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {service.variants.map((variant) => {
                        const variantPrice =
                          variant.price_modifier_type === "override"
                            ? variant.price_modifier_value
                            : variant.price_modifier_type === "add"
                            ? service.base_price + variant.price_modifier_value
                            : service.base_price * variant.price_modifier_value;

                        return (
                          <Card
                            key={variant.id}
                            className={`cursor-pointer transition-all ${
                              selectedVariantId === variant.id
                                ? "border-primary bg-primary/5 ring-2 ring-primary shadow-md"
                                : "hover:border-primary/50 hover:shadow-sm"
                            }`}
                            onClick={() => setSelectedVariantId(variant.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {selectedVariantId === variant.id && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                      <Check className="h-3 w-3 text-white" />
                                    </div>
                                  )}
                                  <span className="font-semibold">
                                    {variant.name}
                                  </span>
                                </div>
                                {variant.is_default && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xl font-bold text-primary mb-3">
                                {formatCurrency(variantPrice)}
                              </p>
                              {variant.features &&
                                variant.features.length > 0 && (
                                  <ul className="space-y-1.5">
                                    {(variant.features as string[])
                                      .slice(0, 5)
                                      .map((f, i) => (
                                        <li
                                          key={i}
                                          className="text-xs text-muted-foreground flex items-start gap-1.5"
                                        >
                                          <span className="text-green-500 mt-0.5">
                                            ✓
                                          </span>
                                          <span>{f}</span>
                                        </li>
                                      ))}
                                    {(variant.features as string[]).length >
                                      5 && (
                                      <li className="text-xs text-muted-foreground italic">
                                        +
                                        {(variant.features as string[]).length -
                                          5}{" "}
                                        altre caratteristiche...
                                      </li>
                                    )}
                                  </ul>
                                )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantità */}
                {service.requires_quantity_input && (
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold">
                      Quantità{" "}
                      {service.pricing_parameters?.find((p) => p.unit_label)
                        ? `(${
                            service.pricing_parameters.find((p) => p.unit_label)
                              ?.unit_label
                          })`
                        : ""}
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min={service.min_quantity || 1}
                        max={service.max_quantity || undefined}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">
                        Min: {service.min_quantity || 1}
                        {service.max_quantity &&
                          ` | Max: ${service.max_quantity}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Parametri Dinamici */}
                {hasParameters && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5 text-primary" />
                      <Label className="text-lg font-semibold">
                        Parametri di Configurazione
                      </Label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {service
                        .pricing_parameters!.sort(
                          (a, b) => a.sort_order - b.sort_order
                        )
                        .map((param) => (
                          <div
                            key={param.id}
                            className="space-y-2 p-4 bg-muted/30 rounded-lg border"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Label className="font-medium">
                                  {param.label}
                                </Label>
                                {param.is_required && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs px-1"
                                  >
                                    *
                                  </Badge>
                                )}
                                {param.help_text && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">
                                          {param.help_text}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-200 bg-green-50"
                              >
                                +
                                {formatCurrency(
                                  calculateParameterImpact(
                                    param,
                                    parameterValues[param.id] || 0
                                  )
                                )}
                              </Badge>
                            </div>

                            {param.description && (
                              <p className="text-xs text-muted-foreground">
                                {param.description}
                              </p>
                            )}

                            {/* Number input */}
                            {param.type === "number" && (
                              <div className="flex items-center gap-2 pt-1">
                                <Input
                                  type="number"
                                  min={param.min}
                                  max={param.max}
                                  step={param.step || 1}
                                  value={
                                    (parameterValues[param.id] as number) ||
                                    param.min ||
                                    0
                                  }
                                  onChange={(e) =>
                                    setParameterValues((prev) => ({
                                      ...prev,
                                      [param.id]:
                                        parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                  className="w-full"
                                />
                                {param.unit_label && (
                                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    {param.unit_label}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Slider */}
                            {param.type === "slider" && (
                              <div className="space-y-3 pt-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {param.min || 0}
                                  </span>
                                  <span className="font-medium bg-primary/10 px-2 py-0.5 rounded">
                                    {parameterValues[param.id] ||
                                      param.min ||
                                      0}{" "}
                                    {param.unit_label || ""}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {param.max || 100}
                                  </span>
                                </div>
                                <Slider
                                  min={param.min || 0}
                                  max={param.max || 100}
                                  step={param.step || 1}
                                  value={[
                                    Number(parameterValues[param.id]) ||
                                      param.min ||
                                      0,
                                  ]}
                                  onValueChange={([val]) =>
                                    setParameterValues((prev) => ({
                                      ...prev,
                                      [param.id]: val,
                                    }))
                                  }
                                />
                              </div>
                            )}

                            {/* Select */}
                            {(param.type === "select" ||
                              param.type === "range_select") &&
                              param.options && (
                                <Select
                                  value={String(
                                    parameterValues[param.id] || ""
                                  )}
                                  onValueChange={(value) =>
                                    setParameterValues((prev) => ({
                                      ...prev,
                                      [param.id]: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Seleziona..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {param.options.map((opt) => (
                                      <SelectItem
                                        key={String(opt.value)}
                                        value={String(opt.value)}
                                      >
                                        <div className="flex items-center justify-between w-full gap-4">
                                          <span>{opt.label}</span>
                                          {opt.price_impact !== 0 && (
                                            <span
                                              className={`text-xs font-mono ${
                                                opt.price_impact > 0
                                                  ? "text-foreground"
                                                  : "text-muted-foreground"
                                              }`}
                                            >
                                              {opt.price_impact > 0 ? "+" : ""}
                                              {formatCurrency(opt.price_impact)}
                                            </span>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}

                            {/* Checkbox */}
                            {param.type === "checkbox" && (
                              <div className="flex items-center gap-2 pt-1">
                                <Checkbox
                                  checked={Boolean(parameterValues[param.id])}
                                  onCheckedChange={(checked) =>
                                    setParameterValues((prev) => ({
                                      ...prev,
                                      [param.id]: checked,
                                    }))
                                  }
                                />
                                <span className="text-sm">
                                  Attiva (+
                                  {formatCurrency(
                                    param.price_impact_value || 0
                                  )}
                                  )
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Add-ons */}
                {hasAddons && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      <Label className="text-lg font-semibold">
                        Add-ons Disponibili ({service.addons.length})
                      </Label>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {service.addons.map((addon) => (
                        <div
                          key={addon.id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedAddons.includes(addon.id)
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() =>
                            setSelectedAddons((prev) =>
                              prev.includes(addon.id)
                                ? prev.filter((id) => id !== addon.id)
                                : [...prev, addon.id]
                            )
                          }
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedAddons.includes(addon.id)}
                              onChange={() => {}}
                            />
                            <div>
                              <span className="font-medium text-sm">
                                {addon.name}
                              </span>
                              {addon.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {addon.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-mono font-bold text-sm">
                              +{formatCurrency(addon.price)}
                            </span>
                            {addon.is_recurring && (
                              <span className="text-xs text-blue-600 block">
                                /
                                {RECURRING_INTERVAL_LABELS[
                                  addon.recurring_interval as keyof typeof RECURRING_INTERVAL_LABELS
                                ] || "periodo"}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Column - Price Summary (sticky) */}
          <div className="w-80 border-l bg-muted/30 flex flex-col flex-shrink-0">
            <div className="p-4 border-b bg-background">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calculator className="h-5 w-5" />
                Riepilogo Prezzi
              </div>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-auto">
              {/* Base Price */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prezzo Base</span>
                  <span className="font-mono">
                    {formatCurrency(calculations.basePrice)}
                  </span>
                </div>
                {calculations.variantName && (
                  <p className="text-xs text-muted-foreground">
                    Variante: {calculations.variantName}
                  </p>
                )}
              </div>

              {/* Parameters */}
              {calculations.paramsImpact > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">+ Configurazione</span>
                  <span className="font-mono text-green-600">
                    +{formatCurrency(calculations.paramsImpact)}
                  </span>
                </div>
              )}

              <Separator />

              {/* Unit Price */}
              <div className="flex justify-between">
                <span className="font-medium">Prezzo Unitario</span>
                <span className="font-mono font-semibold">
                  {formatCurrency(calculations.unitPrice)}
                </span>
              </div>

              {/* Quantity */}
              {quantity > 1 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>× Quantità ({quantity})</span>
                  <span className="font-mono">
                    {formatCurrency(calculations.unitPrice * quantity)}
                  </span>
                </div>
              )}

              {/* Addons */}
              {calculations.addonsTotal > 0 && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">
                        + Add-ons ({calculations.selectedAddonDetails.length})
                      </span>
                      <span className="font-mono text-blue-600">
                        +{formatCurrency(calculations.addonsTotal)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {calculations.selectedAddonDetails.map((addon) => (
                        <div
                          key={addon.addon_id}
                          className="flex justify-between"
                        >
                          <span className="truncate mr-2">
                            • {addon.addon_name}
                          </span>
                          <span className="font-mono flex-shrink-0">
                            {formatCurrency(addon.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-xl font-bold">
                <span>Totale</span>
                <span className="font-mono text-primary">
                  {formatCurrency(calculations.lineTotal)}
                </span>
              </div>

              {/* Recurring indicator */}
              {service.is_recurring && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-lg py-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>
                    Ricorrente /
                    {RECURRING_INTERVAL_LABELS[
                      service.recurring_interval as keyof typeof RECURRING_INTERVAL_LABELS
                    ] || "periodo"}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t bg-background space-y-2">
              <Button className="w-full" size="lg" onClick={handleConfirm}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Aggiungi al Preventivo
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Annulla
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
