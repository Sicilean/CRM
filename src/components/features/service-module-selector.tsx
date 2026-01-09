"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, AlertCircle, Lock, Star, DollarSign } from "lucide-react";
import {
  ServiceModule,
  ServiceToModuleMapping,
  ModuleParameter,
} from "@/types/service-configuration.types";
import ServiceParameterInput from "./service-parameter-input";
import { Separator } from "@/components/ui/separator";

interface ServiceModuleSelectorProps {
  modules: ServiceModule[];
  mappings: ServiceToModuleMapping[];
  selectedModules: string[];
  moduleParameters: Record<string, Record<string, any>>;
  onToggleModule: (moduleId: string) => void;
  onUpdateModuleParameter: (moduleId: string, key: string, value: any) => void;
  isModuleDisabled: (moduleId: string) => boolean;
}

export default function ServiceModuleSelector({
  modules,
  mappings,
  selectedModules,
  moduleParameters,
  onToggleModule,
  onUpdateModuleParameter,
  isModuleDisabled,
}: ServiceModuleSelectorProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleExpanded = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  // Group modules by display_category
  const groupedModules = modules.reduce((acc, module) => {
    const mapping = mappings.find((m) => m.module_id === module.id);
    const category = mapping?.display_category || "other";

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ module, mapping });
    return acc;
  }, {} as Record<string, Array<{ module: ServiceModule; mapping?: ServiceToModuleMapping }>>);

  const categoryLabels: Record<string, string> = {
    content: "📝 Contenuti",
    features: "✨ Funzionalità",
    ecommerce: "🛒 E-commerce",
    communication: "💬 Comunicazione",
    marketing: "📈 Marketing",
    analytics: "📊 Analytics",
    localization: "🌍 Localizzazione",
    enhancements: "⚡ Miglioramenti",
    integrations: "🔌 Integrazioni",
    brand_strategy: "🎯 Strategia Brand",
    brand_identity: "🎨 Identità Brand",
    other: "📦 Altri",
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedModules).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">
            {categoryLabels[category] || category}
          </h4>

          <div className="space-y-2">
            {items.map(({ module, mapping }) => {
              const isSelected = selectedModules.includes(module.id);
              const isDisabled = isModuleDisabled(module.id);
              const isExpanded = expandedModules.has(module.id);
              const hasParameters = module.parameters && module.parameters.length > 0;

              return (
                <div
                  key={module.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  } ${isDisabled ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={module.id}
                      checked={isSelected}
                      onCheckedChange={() => !isDisabled && onToggleModule(module.id)}
                      disabled={isDisabled || mapping?.is_required}
                      className="mt-1"
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={module.id}
                            className={`text-sm font-medium cursor-pointer ${
                              isDisabled ? "cursor-not-allowed" : ""
                            }`}
                          >
                            {module.name}
                          </Label>

                          {/* Badges */}
                          <div className="flex items-center gap-1">
                            {mapping?.is_required && (
                              <Badge variant="destructive" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Obbligatorio
                              </Badge>
                            )}
                            {mapping?.is_recommended && !mapping.is_required && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Consigliato
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold font-mono">
                            +€{module.base_price.toFixed(2)}
                          </span>
                          {hasParameters && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleExpanded(module.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {module.description && (
                        <p className="text-sm text-muted-foreground">
                          {module.description}
                        </p>
                      )}

                      {/* Warning for disabled */}
                      {isDisabled && (
                        <Alert variant="destructive" className="py-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {mapping?.requires && mapping.requires.length > 0
                              ? "Questo modulo richiede altri moduli da selezionare prima"
                              : "Questo modulo è in conflitto con altri moduli selezionati"}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Module Parameters (if selected and expanded) */}
                      {isSelected && hasParameters && isExpanded && (
                        <>
                          <Separator className="my-3" />
                          <div className="space-y-3 pt-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Parametri Modulo
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {module.parameters!.map((param: ModuleParameter) => (
                                <ServiceParameterInput
                                  key={param.key}
                                  parameter={{
                                    ...param,
                                    id: `${module.id}-${param.key}`,
                                    service_id: module.id,
                                    parameter_key: param.key,
                                    parameter_name: param.name,
                                    parameter_type: param.type,
                                    default_value: param.default,
                                    is_required: false,
                                    is_active: true,
                                    display_order: 0,
                                    created_at: "",
                                    updated_at: "",
                                  }}
                                  value={
                                    moduleParameters[module.id]?.[param.key] ||
                                    param.default
                                  }
                                  onChange={(value) =>
                                    onUpdateModuleParameter(module.id, param.key, value)
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

