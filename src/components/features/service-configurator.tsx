"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Package, Settings, Sparkles, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  ServiceModule,
  ServiceParameter,
  ServicePreset,
  ServiceToModuleMapping,
  ServiceConfiguratorState,
} from "@/types/service-configuration.types";
import ServicePresetCard from "./service-preset-card";
import ServiceParameterInput from "./service-parameter-input";
import ServiceModuleSelector from "./service-module-selector";

// Type per il risultato della configurazione
export interface ServiceConfigurationResult {
  service_id: string;
  service_name: string;
  quantity: number;
  base_price: number;
  unit_price: number;
  selected_modules: Array<{
    module_id: string;
    module_name: string;
    parameters: Record<string, string | number | boolean | null>;
    calculated_price: number;
  }>;
  service_parameters: Record<string, string | number | boolean | null>;
  notes?: string;
  description?: string;
}

interface ServiceConfiguratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  onConfigured: (configuration: ServiceConfigurationResult) => void;
  quoteLevelParams?: {
    cliente_abituale: number;
    prosperita_economica: number;
  };
}

export default function ServiceConfigurator({
  open,
  onOpenChange,
  serviceId,
  onConfigured,
  quoteLevelParams,
}: ServiceConfiguratorProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");

  // Service data
  const [serviceName, setServiceName] = useState<string>("");
  const [serviceBasePrice, setServiceBasePrice] = useState<number>(0);

  // Data
  const [availableModules, setAvailableModules] = useState<ServiceModule[]>([]);
  const [moduleMappings, setModuleMappings] = useState<ServiceToModuleMapping[]>([]);
  const [parameters, setParameters] = useState<ServiceParameter[]>([]);
  const [presets, setPresets] = useState<ServicePreset[]>([]);

  // State
  const [state, setState] = useState<ServiceConfiguratorState>({
    service: { id: serviceId, name: "", base_price: 0 } as any,
    selectedModules: [],
    moduleParameters: {},
    serviceParameters: {},
    calculatedPrice: {
      basePrice: 0,
      parametersPrice: 0,
      modulesPrice: 0,
      total: 0,
    },
  });

  const loadConfigurationData = useCallback(async () => {
    setLoading(true);
    try {
      // Load service data first
      // ServiceId potrebbe essere sia id che notion_id
      let serviceQuery = supabase
        .from("services")
        .select("id, notion_id, name, base_price");
      
      // Prova prima con notion_id, poi con id
      let { data: serviceData } = await serviceQuery
        .eq("notion_id", serviceId)
        .maybeSingle();
      
      if (!serviceData) {
        const result = await serviceQuery.eq("id", serviceId).maybeSingle();
        serviceData = result.data;
      }

      if (!serviceData) {
        console.error("Servizio non trovato:", serviceId);
        setLoading(false);
        return;
      }

      const basePrice = typeof serviceData.base_price === 'number' 
        ? serviceData.base_price 
        : parseFloat(String(serviceData.base_price || 0));
      
      setServiceName(serviceData.name);
      setServiceBasePrice(basePrice);
      
      // Update state with service data
      setState(prev => ({
        ...prev,
        service: { 
          id: serviceData.id, 
          name: serviceData.name, 
          base_price: basePrice 
        } as any,
        calculatedPrice: {
          basePrice: basePrice,
          parametersPrice: 0,
          modulesPrice: 0,
          total: basePrice,
        },
      }));

      // Usa l'id reale del servizio per le query successive
      const realServiceId = serviceData.id;

      // Load service parameters
      const { data: params } = await supabase
        .from("service_parameters")
        .select("*")
        .eq("service_id", realServiceId)
        .order("display_order");

      // Load available modules through mapping
      const { data: mappings } = await supabase
        .from("service_to_modules_mapping")
        .select("*, service_modules(*)")
        .eq("service_id", realServiceId);

      // Load presets
      const { data: presetsData } = await supabase
        .from("service_presets")
        .select("*")
        .eq("service_id", realServiceId)
        .eq("is_active", true)
        .order("display_order");

      if (params) setParameters(params as unknown as ServiceParameter[]);
      if (presetsData) setPresets(presetsData as unknown as ServicePreset[]);

      if (mappings) {
        setModuleMappings(mappings as unknown as ServiceToModuleMapping[]);
        interface MappingWithModule { service_modules?: ServiceModule | null; is_default?: boolean; module_id: string }
        const modules = (mappings as unknown as MappingWithModule[])
          .map((m) => m.service_modules)
          .filter((m): m is ServiceModule => m !== null && m !== undefined && m.is_active === true);
        setAvailableModules(modules as unknown as ServiceModule[]);

        // Auto-select default modules
        const defaultModules = (mappings as unknown as MappingWithModule[])
          .filter((m) => m.is_default)
          .map((m) => m.module_id);

        if (defaultModules.length > 0) {
          setState((prev) => ({
            ...prev,
            selectedModules: defaultModules,
          }));
        }
      }

      // Initialize parameters with defaults
      if (params) {
        const defaultParams: Record<string, any> = {};
        params.forEach((p) => {
          defaultParams[p.parameter_key] = p.default_value;
        });
        setState((prev) => ({
          ...prev,
          serviceParameters: defaultParams,
        }));
      }

      // Recalculate price
      // We can't call recalculatePrice here because it depends on state
      // which hasn't been updated yet in this closure
      // Instead, we'll rely on the initial state or subsequent effects
      
    } catch (error) {
      console.error("Error loading configuration:", error);
    } finally {
      setLoading(false);
    }
  }, [serviceId, supabase]);

  // Load configuration data
  useEffect(() => {
    if (open) {
      loadConfigurationData();
    }
  }, [open, serviceId, loadConfigurationData]);

  // Apply preset
  const handleApplyPreset = (preset: ServicePreset) => {
    setState((prev) => ({
      ...prev,
      selectedPreset: preset,
      selectedModules: preset.included_modules,
      serviceParameters: preset.parameters || {},
    }));

    recalculatePrice(preset.included_modules, preset.parameters || {});
    setActiveTab("custom");
  };

  // Toggle module
  const handleToggleModule = (moduleId: string) => {
    setState((prev) => {
      const isCurrentlySelected = prev.selectedModules.includes(moduleId);
      const newSelectedModules = isCurrentlySelected
        ? prev.selectedModules.filter((id) => id !== moduleId)
        : [...prev.selectedModules, moduleId];

      recalculatePrice(newSelectedModules, prev.serviceParameters);

      return {
        ...prev,
        selectedModules: newSelectedModules,
      };
    });
  };

  // Update service parameter
  type ParameterValueType = string | number | boolean | null
  const handleUpdateParameter = (key: string, value: ParameterValueType) => {
    setState((prev) => {
      const newParams = { ...prev.serviceParameters, [key]: value };
      recalculatePrice(prev.selectedModules, newParams);

      return {
        ...prev,
        serviceParameters: newParams,
      };
    });
  };

  // Update module parameter
  const handleUpdateModuleParameter = (
    moduleId: string,
    key: string,
    value: ParameterValueType
  ) => {
    setState((prev) => {
      const newModuleParams = {
        ...prev.moduleParameters,
        [moduleId]: {
          ...(prev.moduleParameters[moduleId] || {}),
          [key]: value,
        },
      };

      recalculatePrice(prev.selectedModules, prev.serviceParameters, newModuleParams);

      return {
        ...prev,
        moduleParameters: newModuleParams,
      };
    });
  };

  // Recalculate price (simplified - real implementation would be more complex)
  const recalculatePrice = (
    selectedModules = state.selectedModules,
    serviceParams = state.serviceParameters,
    moduleParams = state.moduleParameters
  ) => {
    let parametersPrice = 0;
    let modulesPrice = 0;

    // Calculate parameters price
    parameters.forEach((param) => {
      const value = serviceParams[param.parameter_key];
      if (param.pricing_impact && value !== undefined) {
        const impact = calculateParameterImpact(param, value);
        parametersPrice += impact;
      }
    });

    // Calculate modules price
    selectedModules.forEach((moduleId) => {
      const foundModule = availableModules.find((m) => m.id === moduleId);
      if (foundModule) {
        modulesPrice += foundModule.base_price;

        // Add module parameters price
        const modParams = moduleParams[moduleId] || {};
        if (foundModule.parameters) {
          foundModule.parameters.forEach((param) => {
            const value = modParams[param.key];
            if (param.pricing_impact && value !== undefined) {
              const impact = calculateParameterImpact(
                {
                  ...param,
                  parameter_key: param.key,
                  parameter_type: param.type,
                } as unknown as ServiceParameter,
                  value
                );
                modulesPrice += impact;
              }
            });
          }
        }
      });

    const total = serviceBasePrice + parametersPrice + modulesPrice;

    setState((prev) => ({
      ...prev,
      calculatedPrice: {
        basePrice: serviceBasePrice,
        parametersPrice,
        modulesPrice,
        total,
      },
    }));
  };

  // Calculate single parameter price impact
  const calculateParameterImpact = (
    param: ServiceParameter,
    value: ParameterValueType
  ): number => {
    if (!param.pricing_impact) return 0;

    const impact = param.pricing_impact;

    switch (impact.type) {
      case "fixed":
        if (param.parameter_type === "boolean") {
          return value === true ? impact.price_if_true || 0 : 0;
        }
        return impact.base_value || 0;

      case "per_unit":
        const baseValue = impact.base_value || 0;
        const pricePerUnit = impact.price_per_additional || 0;
        const numValue = typeof value === "number" ? value : 0;
        return Math.max(0, (numValue - baseValue) * pricePerUnit);

      case "tiered":
        if (impact.tiers) {
          const numValue = typeof value === "number" ? value : 0;
          for (const tier of impact.tiers) {
            if (numValue >= tier.from && numValue <= tier.to) {
              if (tier.price !== undefined) return tier.price;
              if (tier.price_per_unit !== undefined) {
                return (numValue - tier.from) * tier.price_per_unit;
              }
            }
          }
        }
        if (impact.mapping && typeof value === "string") {
          return impact.mapping[value] || 0;
        }
        return 0;

      case "percentage":
        if (impact.mapping && typeof value === "string") {
          const percentage = impact.mapping[value] || 0;
          return (serviceBasePrice * percentage) / 100;
        }
        return 0;

      default:
        return 0;
    }
  };

  // Add to quote
  const handleAddToQuote = () => {
    const configuration: ServiceConfigurationResult = {
      service_id: state.service.id, // Usa l'ID reale del servizio
      service_name: serviceName,
      quantity: 1,
      base_price: serviceBasePrice || 0,
      unit_price: state.calculatedPrice.total,
      selected_modules: state.selectedModules.map(moduleId => {
        const foundModule = availableModules.find((m) => m.id === moduleId);
        return {
          module_id: moduleId,
          module_name: foundModule?.name || '',
          parameters: state.moduleParameters[moduleId] || {},
          calculated_price: foundModule?.base_price || 0,
        };
      }),
      service_parameters: state.serviceParameters,
      notes: "",
    };

    onConfigured(configuration);
    onOpenChange(false);
  };

  // Check if module is disabled (conflicts or missing prerequisites)
  const isModuleDisabled = (moduleId: string): boolean => {
    const mapping = moduleMappings.find((m) => m.module_id === moduleId);
    if (!mapping) return false;

    // Check prerequisites
    if (mapping.requires && mapping.requires.length > 0) {
      const missingPrereqs = mapping.requires.filter(
        (reqId) => !state.selectedModules.includes(reqId)
      );
      if (missingPrereqs.length > 0) return true;
    }

    // Check conflicts
    if (mapping.conflicts_with && mapping.conflicts_with.length > 0) {
      const hasConflict = mapping.conflicts_with.some((conflictId) =>
        state.selectedModules.includes(conflictId)
      );
      if (hasConflict) return true;
    }

    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Configura: {serviceName || "Caricamento..."}
          </DialogTitle>
          <DialogDescription>
            Prezzo base: <span className="font-semibold">
              €{(serviceBasePrice || 0).toFixed(2)}
            </span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "presets" | "custom")} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="presets" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Preset Rapidi
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurazione Personalizzata
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 mt-4">
                {/* Tab Presets */}
                <TabsContent value="presets" className="mt-0 space-y-4">
                  {presets.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Nessun preset disponibile. Usa la configurazione personalizzata.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {presets.map((preset) => (
                        <ServicePresetCard
                          key={preset.id}
                          preset={preset}
                          modules={availableModules}
                          onSelect={() => handleApplyPreset(preset)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Tab Custom Configuration */}
                <TabsContent value="custom" className="mt-0 space-y-6">
                  {/* Service Parameters */}
                  {parameters.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Parametri Servizio</h3>
                        <p className="text-sm text-muted-foreground">
                          Configura i parametri principali del servizio
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {parameters.map((param) => (
                          <ServiceParameterInput
                            key={param.id}
                            parameter={param}
                            value={state.serviceParameters[param.parameter_key]}
                            onChange={(value) =>
                              handleUpdateParameter(param.parameter_key, value)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modules */}
                  {availableModules.length > 0 && (
                    <>
                      {parameters.length > 0 && <Separator />}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Moduli Aggiuntivi
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Seleziona i moduli opzionali da includere
                          </p>
                        </div>

                        <ServiceModuleSelector
                          modules={availableModules}
                          mappings={moduleMappings}
                          selectedModules={state.selectedModules}
                          moduleParameters={state.moduleParameters}
                          onToggleModule={handleToggleModule}
                          onUpdateModuleParameter={handleUpdateModuleParameter}
                          isModuleDisabled={isModuleDisabled}
                        />
                      </div>
                    </>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* Price Summary */}
            <div className="border-t pt-4 space-y-3 bg-muted/30 -mx-6 px-6 -mb-6 pb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prezzo Base:</span>
                  <span className="font-mono">
                    €{state.calculatedPrice.basePrice.toFixed(2)}
                  </span>
                </div>
                {state.calculatedPrice.parametersPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parametri:</span>
                    <span className="font-mono">
                      €{state.calculatedPrice.parametersPrice.toFixed(2)}
                    </span>
                  </div>
                )}
                {state.calculatedPrice.modulesPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Moduli ({state.selectedModules.length}):
                    </span>
                    <span className="font-mono">
                      €{state.calculatedPrice.modulesPrice.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Prezzo Totale:</span>
                <span className="text-2xl font-bold font-mono text-primary">
                  €{state.calculatedPrice.total.toFixed(2)}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button onClick={handleAddToQuote}>
                <Package className="mr-2 h-4 w-4" />
                Aggiungi al Preventivo
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

