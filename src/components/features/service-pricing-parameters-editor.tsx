"use client";

import { useState } from "react";
import {
  ServicePricingParameter,
  ParameterType,
  PriceImpactMode,
  ParameterOption,
  ParameterTier,
  PARAMETER_TYPE_LABELS,
  PRICE_IMPACT_MODE_LABELS,
} from "@/types/quotes.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  X,
  Edit,
  Trash2,
  GripVertical,
  Calculator,
  Settings2,
  Check,
  Pencil,
} from "lucide-react";

interface ServicePricingParametersEditorProps {
  parameters: ServicePricingParameter[];
  onChange: (parameters: ServicePricingParameter[]) => void;
  basePrice: number;
}

const DEFAULT_PARAMETER: Omit<ServicePricingParameter, "id"> = {
  name: "",
  label: "",
  description: "",
  type: "number",
  min: 0,
  max: 100,
  step: 1,
  default_value: 1,
  price_impact_mode: "per_unit",
  price_impact_value: 0,
  is_required: false,
  show_in_summary: true,
  sort_order: 0,
};

export default function ServicePricingParametersEditor({
  parameters,
  onChange,
  basePrice,
}: ServicePricingParametersEditorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParameter, setEditingParameter] =
    useState<ServicePricingParameter | null>(null);
  const [optionInput, setOptionInput] = useState({
    label: "",
    value: "",
    price_impact: 0,
  });
  const [tierInput, setTierInput] = useState({
    min: 0,
    max: 10,
    price_per_unit: 0,
  });
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(
    null
  );
  const [editingOptionData, setEditingOptionData] =
    useState<ParameterOption | null>(null);

  const generateId = () =>
    `param-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const generateName = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^_|_$)/g, "");
  };

  const openDialog = (param?: ServicePricingParameter) => {
    setEditingParameter(
      param || {
        ...DEFAULT_PARAMETER,
        id: generateId(),
        sort_order: parameters.length,
      }
    );
    setDialogOpen(true);
  };

  const saveParameter = () => {
    if (!editingParameter?.name || !editingParameter?.label) return;

    const existingIndex = parameters.findIndex(
      (p) => p.id === editingParameter.id
    );
    if (existingIndex >= 0) {
      const updated = [...parameters];
      updated[existingIndex] = editingParameter;
      onChange(updated);
    } else {
      onChange([...parameters, editingParameter]);
    }

    setDialogOpen(false);
    setEditingParameter(null);
  };

  const deleteParameter = (id: string) => {
    onChange(parameters.filter((p) => p.id !== id));
  };

  const addOption = () => {
    if (!optionInput.label || !editingParameter) return;
    const newOption: ParameterOption = {
      value:
        optionInput.value ||
        optionInput.label.toLowerCase().replace(/\s+/g, "_"),
      label: optionInput.label,
      price_impact: optionInput.price_impact,
    };
    setEditingParameter({
      ...editingParameter,
      options: [...(editingParameter.options || []), newOption],
    });
    setOptionInput({ label: "", value: "", price_impact: 0 });
  };

  const removeOption = (index: number) => {
    if (!editingParameter) return;
    setEditingParameter({
      ...editingParameter,
      options: editingParameter.options?.filter((_, i) => i !== index),
    });
  };

  const startEditingOption = (index: number) => {
    if (!editingParameter?.options) return;
    setEditingOptionIndex(index);
    setEditingOptionData({ ...editingParameter.options[index] });
  };

  const saveEditingOption = () => {
    if (
      !editingParameter?.options ||
      editingOptionIndex === null ||
      !editingOptionData
    )
      return;
    const updatedOptions = [...editingParameter.options];
    updatedOptions[editingOptionIndex] = editingOptionData;
    setEditingParameter({
      ...editingParameter,
      options: updatedOptions,
    });
    setEditingOptionIndex(null);
    setEditingOptionData(null);
  };

  const cancelEditingOption = () => {
    setEditingOptionIndex(null);
    setEditingOptionData(null);
  };

  const addTier = () => {
    if (!editingParameter) return;
    const newTier: ParameterTier = {
      min: tierInput.min,
      max: tierInput.max,
      price_per_unit: tierInput.price_per_unit,
    };
    setEditingParameter({
      ...editingParameter,
      price_tiers: [...(editingParameter.price_tiers || []), newTier],
    });
    setTierInput({
      min: (tierInput.max || 0) + 1,
      max: (tierInput.max || 0) + 10,
      price_per_unit: tierInput.price_per_unit * 0.9,
    });
  };

  const removeTier = (index: number) => {
    if (!editingParameter) return;
    setEditingParameter({
      ...editingParameter,
      price_tiers: editingParameter.price_tiers?.filter((_, i) => i !== index),
    });
  };

  const calculateExamplePrice = (
    param: ServicePricingParameter,
    value: number
  ): number => {
    switch (param.price_impact_mode) {
      case "fixed":
        return param.price_impact_value || 0;
      case "per_unit":
        return (param.price_impact_value || 0) * value;
      case "percentage":
        return basePrice * ((param.price_impact_value || 0) / 100);
      case "multiplier":
        return basePrice * ((param.price_impact_value || 1) - 1);
      case "tiered":
        if (!param.price_tiers) return 0;
        let total = 0;
        let remaining = value;
        for (const tier of param.price_tiers.sort((a, b) => a.min - b.min)) {
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
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Parametri di Pricing
          </h3>
          <p className="text-sm text-muted-foreground">
            Definisci parametri che influenzano il prezzo del servizio
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Parametro
        </Button>
      </div>

      {parameters.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessun parametro di pricing definito</p>
            <p className="text-sm mt-2">
              I parametri permettono di calcolare il prezzo in base a variabili
              come numero prodotti, pagine, complessità, etc.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {parameters
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((param) => (
              <Card key={param.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{param.label}</h4>
                          <Badge variant="outline">
                            {PARAMETER_TYPE_LABELS[param.type]}
                          </Badge>
                          {param.is_required && (
                            <Badge variant="destructive" className="text-xs">
                              Obbligatorio
                            </Badge>
                          )}
                        </div>
                        <code className="text-xs text-muted-foreground">
                          {param.name}
                        </code>
                        {param.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {param.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">
                            Impatto:{" "}
                            <span className="font-medium">
                              {
                                PRICE_IMPACT_MODE_LABELS[
                                  param.price_impact_mode
                                ]
                              }
                            </span>
                          </span>
                          {param.price_impact_mode !== "tiered" &&
                            param.price_impact_value !== undefined && (
                              <span className="text-green-600 font-mono">
                                {param.price_impact_mode === "percentage"
                                  ? `${param.price_impact_value}%`
                                  : param.price_impact_mode === "multiplier"
                                  ? `×${param.price_impact_value}`
                                  : `€${param.price_impact_value}`}
                              </span>
                            )}
                          {param.unit_label && (
                            <span className="text-muted-foreground">
                              Unità: {param.unit_label}
                            </span>
                          )}
                        </div>
                        {/* Preview calcolo */}
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                          <span className="text-muted-foreground">
                            Esempio con valore{" "}
                            {param.type === "checkbox" ? "attivo" : "10"}:
                          </span>{" "}
                          <span className="font-mono text-green-600">
                            +€
                            {calculateExamplePrice(
                              param,
                              param.type === "checkbox" ? 1 : 10
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(param)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => deleteParameter(param.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Dialog Modifica/Creazione Parametro */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              {editingParameter?.id?.startsWith("param-") &&
              !parameters.find((p) => p.id === editingParameter?.id)
                ? "Nuovo Parametro"
                : "Modifica Parametro"}
            </DialogTitle>
          </DialogHeader>

          {editingParameter && (
            <div className="space-y-6">
              {/* Info Base */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Label (visualizzato) *</Label>
                  <Input
                    value={editingParameter.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setEditingParameter({
                        ...editingParameter,
                        label,
                        name: editingParameter.name || generateName(label),
                      });
                    }}
                    placeholder="es. Numero Prodotti"
                  />
                </div>
                <div>
                  <Label>Nome Tecnico *</Label>
                  <Input
                    value={editingParameter.name}
                    onChange={(e) =>
                      setEditingParameter({
                        ...editingParameter,
                        name: e.target.value,
                      })
                    }
                    placeholder="es. num_products"
                  />
                </div>
              </div>

              <div>
                <Label>Descrizione</Label>
                <Textarea
                  value={editingParameter.description || ""}
                  onChange={(e) =>
                    setEditingParameter({
                      ...editingParameter,
                      description: e.target.value,
                    })
                  }
                  placeholder="Descrizione del parametro..."
                  rows={2}
                />
              </div>

              {/* Tipo Parametro */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Tipo Parametro</Label>
                  <Select
                    value={editingParameter.type}
                    onValueChange={(value) =>
                      setEditingParameter({
                        ...editingParameter,
                        type: value as ParameterType,
                        options:
                          value === "select" || value === "range_select"
                            ? editingParameter.options || []
                            : undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PARAMETER_TYPE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Unità (opzionale)</Label>
                  <Input
                    value={editingParameter.unit_label || ""}
                    onChange={(e) =>
                      setEditingParameter({
                        ...editingParameter,
                        unit_label: e.target.value,
                      })
                    }
                    placeholder="es. prodotti, pagine, ore"
                  />
                </div>
              </div>

              {/* Configurazione per number/slider */}
              {(editingParameter.type === "number" ||
                editingParameter.type === "slider") && (
                <div className="grid gap-4 sm:grid-cols-4">
                  <div>
                    <Label>Min</Label>
                    <Input
                      type="number"
                      value={editingParameter.min || 0}
                      onChange={(e) =>
                        setEditingParameter({
                          ...editingParameter,
                          min: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Max</Label>
                    <Input
                      type="number"
                      value={editingParameter.max || 100}
                      onChange={(e) =>
                        setEditingParameter({
                          ...editingParameter,
                          max: parseFloat(e.target.value) || 100,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Step</Label>
                    <Input
                      type="number"
                      value={editingParameter.step || 1}
                      onChange={(e) =>
                        setEditingParameter({
                          ...editingParameter,
                          step: parseFloat(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Default</Label>
                    <Input
                      type="number"
                      value={(editingParameter.default_value as number) || 0}
                      onChange={(e) =>
                        setEditingParameter({
                          ...editingParameter,
                          default_value: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Opzioni per select/range_select */}
              {(editingParameter.type === "select" ||
                editingParameter.type === "range_select") && (
                <div className="space-y-3">
                  <Label>Opzioni</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Label"
                      value={optionInput.label}
                      onChange={(e) =>
                        setOptionInput({
                          ...optionInput,
                          label: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Valore"
                      value={optionInput.value}
                      onChange={(e) =>
                        setOptionInput({
                          ...optionInput,
                          value: e.target.value,
                        })
                      }
                      className="w-32"
                    />
                    <Input
                      type="number"
                      placeholder="Impatto €"
                      value={optionInput.price_impact}
                      onChange={(e) =>
                        setOptionInput({
                          ...optionInput,
                          price_impact: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-28"
                    />
                    <Button type="button" variant="outline" onClick={addOption}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {editingParameter.options &&
                    editingParameter.options.length > 0 && (
                      <div className="space-y-2">
                        {editingParameter.options.map((opt, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded transition-all ${
                              editingOptionIndex === idx
                                ? "bg-primary/10 border border-primary"
                                : "bg-muted/50 hover:bg-muted"
                            }`}
                          >
                            {editingOptionIndex === idx && editingOptionData ? (
                              // Modalità editing inline
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={editingOptionData.label}
                                  onChange={(e) =>
                                    setEditingOptionData({
                                      ...editingOptionData,
                                      label: e.target.value,
                                    })
                                  }
                                  placeholder="Label"
                                  className="flex-1 h-8"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEditingOption();
                                    if (e.key === "Escape")
                                      cancelEditingOption();
                                  }}
                                />
                                <Input
                                  value={editingOptionData.value as string}
                                  onChange={(e) =>
                                    setEditingOptionData({
                                      ...editingOptionData,
                                      value: e.target.value,
                                    })
                                  }
                                  placeholder="value"
                                  className="w-28 h-8"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEditingOption();
                                    if (e.key === "Escape")
                                      cancelEditingOption();
                                  }}
                                />
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                    €
                                  </span>
                                  <Input
                                    type="number"
                                    value={editingOptionData.price_impact}
                                    onChange={(e) =>
                                      setEditingOptionData({
                                        ...editingOptionData,
                                        price_impact:
                                          parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-24 h-8 pl-6"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter")
                                        saveEditingOption();
                                      if (e.key === "Escape")
                                        cancelEditingOption();
                                    }}
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={saveEditingOption}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={cancelEditingOption}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              // Modalità visualizzazione
                              <>
                                <div
                                  className="flex-1 cursor-pointer"
                                  onClick={() => startEditingOption(idx)}
                                >
                                  <span className="font-medium">
                                    {opt.label}
                                  </span>
                                  <span className="text-muted-foreground text-sm ml-2">
                                    ({opt.value})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-mono cursor-pointer hover:underline ${
                                      opt.price_impact >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                    onClick={() => startEditingOption(idx)}
                                  >
                                    {opt.price_impact >= 0 ? "+" : ""}€
                                    {opt.price_impact}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => startEditingOption(idx)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                    onClick={() => removeOption(idx)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {/* Configurazione Pricing */}
              <Accordion type="single" collapsible defaultValue="pricing">
                <AccordionItem value="pricing">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Configurazione Impatto Prezzo
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div>
                      <Label>Modalità Impatto</Label>
                      <Select
                        value={editingParameter.price_impact_mode}
                        onValueChange={(value) =>
                          setEditingParameter({
                            ...editingParameter,
                            price_impact_mode: value as PriceImpactMode,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRICE_IMPACT_MODE_LABELS).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {editingParameter.price_impact_mode === "fixed" &&
                          "Aggiunge un importo fisso al prezzo"}
                        {editingParameter.price_impact_mode === "per_unit" &&
                          "Moltiplica il valore per il numero inserito"}
                        {editingParameter.price_impact_mode === "percentage" &&
                          "Aggiunge una percentuale del prezzo base"}
                        {editingParameter.price_impact_mode === "multiplier" &&
                          "Moltiplica il prezzo base per questo valore"}
                        {editingParameter.price_impact_mode === "tiered" &&
                          "Usa scaglioni progressivi"}
                      </p>
                    </div>

                    {editingParameter.price_impact_mode !== "tiered" && (
                      <div>
                        <Label>
                          Valore{" "}
                          {editingParameter.price_impact_mode === "percentage"
                            ? "(%)"
                            : editingParameter.price_impact_mode ===
                              "multiplier"
                            ? "(×)"
                            : "(€)"}
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingParameter.price_impact_value || 0}
                          onChange={(e) =>
                            setEditingParameter({
                              ...editingParameter,
                              price_impact_value:
                                parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    )}

                    {/* Scaglioni per tiered */}
                    {editingParameter.price_impact_mode === "tiered" && (
                      <div className="space-y-3">
                        <Label>Scaglioni</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Da"
                            value={tierInput.min}
                            onChange={(e) =>
                              setTierInput({
                                ...tierInput,
                                min: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20"
                          />
                          <Input
                            type="number"
                            placeholder="A"
                            value={tierInput.max}
                            onChange={(e) =>
                              setTierInput({
                                ...tierInput,
                                max: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="€/unità"
                            value={tierInput.price_per_unit}
                            onChange={(e) =>
                              setTierInput({
                                ...tierInput,
                                price_per_unit: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-28"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addTier}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {editingParameter.price_tiers &&
                          editingParameter.price_tiers.length > 0 && (
                            <div className="space-y-2">
                              {editingParameter.price_tiers
                                .sort((a, b) => a.min - b.min)
                                .map((tier, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                  >
                                    <span>
                                      {tier.min} - {tier.max ?? "∞"} unità
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-green-600">
                                        €{tier.price_per_unit}/unità
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeTier(idx)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Opzioni */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingParameter.is_required}
                    onCheckedChange={(checked) =>
                      setEditingParameter({
                        ...editingParameter,
                        is_required: checked,
                      })
                    }
                  />
                  <Label>Obbligatorio</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingParameter.show_in_summary}
                    onCheckedChange={(checked) =>
                      setEditingParameter({
                        ...editingParameter,
                        show_in_summary: checked,
                      })
                    }
                  />
                  <Label>Mostra nel riepilogo</Label>
                </div>
              </div>

              <div>
                <Label>Help Text (opzionale)</Label>
                <Input
                  value={editingParameter.help_text || ""}
                  onChange={(e) =>
                    setEditingParameter({
                      ...editingParameter,
                      help_text: e.target.value,
                    })
                  }
                  placeholder="Testo di aiuto per l'utente..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={saveParameter}>Salva Parametro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
