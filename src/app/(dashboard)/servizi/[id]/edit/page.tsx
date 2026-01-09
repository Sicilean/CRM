"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import {
  MacroArea,
  Service,
  ServiceVariant,
  ServiceAddon,
  ServiceDependency,
  ServicePricingParameter,
  PricingType,
  RecurringInterval,
  TimeUnit,
  DeliveryUnit,
  DependencyType,
  PRICING_TYPE_LABELS,
  RECURRING_INTERVAL_LABELS,
  TIME_UNIT_LABELS,
  DEPENDENCY_TYPE_LABELS,
} from "@/types/quotes.types";
import ServicePricingParametersEditor from "@/components/features/service-pricing-parameters-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Package,
  Link2,
  Layers,
  Settings,
  AlertTriangle,
  Calculator,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface PricingTier {
  min: number;
  max: number;
  price_per_unit: number;
}

interface VariantFormData {
  id?: string;
  name: string;
  description: string;
  price_modifier_type: "override" | "add" | "multiply";
  price_modifier_value: number;
  is_default: boolean;
  features: string[];
}

interface AddonFormData {
  id?: string;
  name: string;
  description: string;
  price: number;
  is_recurring: boolean;
  recurring_interval: RecurringInterval | null;
}

interface DependencyFormData {
  id?: string;
  depends_on_service_id: string;
  dependency_type: DependencyType;
  auto_add: boolean;
  message: string;
  discount_percentage: number;
}

export default function ServizioEditPage() {
  const router = useRouter();
  const params = useParams();
  const { isAgente, loading: permissionsLoading } = usePermissions();
  const id = params.id as string;
  const isNew = id === "new";
  const supabase = createClient();

  // Blocca accesso agli agenti
  useEffect(() => {
    if (!permissionsLoading && isAgente) {
      router.push('/servizi');
    }
  }, [isAgente, permissionsLoading, router]);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [macroAreas, setMacroAreas] = useState<MacroArea[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState("general");

  // Main form data
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    macro_area_id: "",
    pricing_type: "fixed" as PricingType,
    base_price: 0,
    max_price: null as number | null,
    setup_fee: null as number | null,
    recurring_interval: null as RecurringInterval | null,
    time_unit: null as TimeUnit | null,
    pricing_tiers: [] as PricingTier[],
    pricing_parameters: [] as ServicePricingParameter[],
    is_recurring: false,
    requires_quantity_input: false,
    min_quantity: 1,
    max_quantity: null as number | null,
    default_quantity: 1,
    requires_manual_pricing: false,
    is_featured: false,
    is_active: true,
    estimated_delivery_days: null as number | null,
    delivery_unit: "days" as DeliveryUnit,
    tags: [] as string[],
  });

  // Variants, Addons, Dependencies
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [addons, setAddons] = useState<AddonFormData[]>([]);
  const [dependencies, setDependencies] = useState<DependencyFormData[]>([]);

  // Dialog states
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [dependencyDialogOpen, setDependencyDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantFormData | null>(
    null
  );
  const [editingAddon, setEditingAddon] = useState<AddonFormData | null>(null);
  const [editingDependency, setEditingDependency] =
    useState<DependencyFormData | null>(null);

  const [tagInput, setTagInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  const loadServizio = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("services")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Errore caricamento servizio:", error);
      router.push("/servizi");
      return;
    }

    setFormData({
      name: data.name || "",
      slug: data.slug || "",
      description: data.description || "",
      short_description: data.short_description || "",
      macro_area_id: data.macro_area_id || "",
      pricing_type: data.pricing_type as PricingType,
      base_price: data.base_price || 0,
      max_price: data.max_price,
      setup_fee: data.setup_fee,
      recurring_interval: data.recurring_interval as RecurringInterval | null,
      time_unit: data.time_unit as TimeUnit | null,
      pricing_tiers: (data.pricing_tiers as PricingTier[]) || [],
      pricing_parameters:
        (data.pricing_parameters as ServicePricingParameter[]) || [],
      is_recurring: data.is_recurring || false,
      requires_quantity_input: data.requires_quantity_input || false,
      min_quantity: data.min_quantity || 1,
      max_quantity: data.max_quantity,
      default_quantity: data.default_quantity || 1,
      requires_manual_pricing: data.requires_manual_pricing || false,
      is_featured: data.is_featured || false,
      is_active: data.is_active ?? true,
      estimated_delivery_days: data.estimated_delivery_days,
      delivery_unit: (data.delivery_unit as DeliveryUnit) || "days",
      tags: data.tags || [],
    });

    // Load variants
    const { data: variantsData } = await (supabase as any)
      .from("service_variants")
      .select("*")
      .eq("service_id", id)
      .order("sort_order", { ascending: true });
    if (variantsData) {
      setVariants(
        (variantsData as any[]).map((v: any) => ({
          id: v.id,
          name: v.name,
          description: v.description || "",
          price_modifier_type: v.price_modifier_type as
            | "override"
            | "add"
            | "multiply",
          price_modifier_value: v.price_modifier_value,
          is_default: v.is_default,
          features: (v.features as string[]) || [],
        }))
      );
    }

    // Load addons
    const { data: addonsData } = await (supabase as any)
      .from("service_addons")
      .select("*")
      .eq("service_id", id)
      .order("sort_order", { ascending: true });
    if (addonsData) {
      setAddons(
        (addonsData as any[]).map((a: any) => ({
          id: a.id,
          name: a.name,
          description: a.description || "",
          price: a.price,
          is_recurring: a.is_recurring,
          recurring_interval: a.recurring_interval as RecurringInterval | null,
        }))
      );
    }

    // Load dependencies
    const { data: depsData } = await (supabase as any)
      .from("service_dependencies")
      .select("*")
      .eq("service_id", id);
    if (depsData) {
      setDependencies(
        (depsData as any[]).map((d: any) => ({
          id: d.id,
          depends_on_service_id: d.depends_on_service_id,
          dependency_type: d.dependency_type as DependencyType,
          auto_add: d.auto_add,
          message: d.message || "",
          discount_percentage: d.discount_percentage || 0,
        }))
      );
    }

    setLoading(false);
  }, [id, supabase, router]);

  // Load data
  useEffect(() => {
    const loadInitialData = async () => {
      // Load macro areas
      const { data: areasData } = await (supabase as any)
        .from("macro_areas")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (areasData) setMacroAreas(areasData as MacroArea[]);

      // Load all services (for dependencies)
      const { data: servicesData } = await (supabase as any)
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (servicesData) setAllServices(servicesData as Service[]);

      // Load service if editing
      if (!isNew) {
        await loadServizio();
      }
    };
    loadInitialData();
  }, [id, isNew, loadServizio, supabase]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[ç]/g, "c")
      .replace(/[ñ]/g, "n")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isNew ? generateSlug(name) : prev.slug,
    }));
  };

  const handlePricingTypeChange = (type: PricingType) => {
    setFormData((prev) => ({
      ...prev,
      pricing_type: type,
      is_recurring: type === "recurring",
      recurring_interval: type === "recurring" ? "month" : null,
      time_unit: type === "time_based" ? "day" : null,
      max_price:
        type === "range" ? prev.max_price || prev.base_price * 2 : null,
      pricing_tiers:
        type === "tiered"
          ? prev.pricing_tiers.length > 0
            ? prev.pricing_tiers
            : [
                { min: 1, max: 10, price_per_unit: prev.base_price },
                { min: 11, max: 50, price_per_unit: prev.base_price * 0.8 },
                { min: 51, max: 9999, price_per_unit: prev.base_price * 0.6 },
              ]
          : [],
    }));
  };

  // Tag management
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Tier management
  const addTier = () => {
    const lastTier = formData.pricing_tiers[formData.pricing_tiers.length - 1];
    const newMin = lastTier ? lastTier.max + 1 : 1;
    setFormData((prev) => ({
      ...prev,
      pricing_tiers: [
        ...prev.pricing_tiers,
        {
          min: newMin,
          max: newMin + 49,
          price_per_unit: lastTier
            ? lastTier.price_per_unit * 0.8
            : formData.base_price,
        },
      ],
    }));
  };

  const updateTier = (
    index: number,
    field: keyof PricingTier,
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      pricing_tiers: prev.pricing_tiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      ),
    }));
  };

  const removeTier = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pricing_tiers: prev.pricing_tiers.filter((_, i) => i !== index),
    }));
  };

  // Variant management
  const openVariantDialog = (variant?: VariantFormData) => {
    setEditingVariant(
      variant || {
        name: "",
        description: "",
        price_modifier_type: "override",
        price_modifier_value: formData.base_price,
        is_default: variants.length === 0,
        features: [],
      }
    );
    setVariantDialogOpen(true);
  };

  const saveVariant = () => {
    if (!editingVariant?.name.trim()) return;

    if (editingVariant.id) {
      setVariants((prev) =>
        prev.map((v) => (v.id === editingVariant.id ? editingVariant : v))
      );
    } else {
      setVariants((prev) => [
        ...prev,
        { ...editingVariant, id: `temp-${Date.now()}` },
      ]);
    }

    // If this is set as default, unset others
    if (editingVariant.is_default) {
      setVariants((prev) =>
        prev.map((v) => ({
          ...v,
          is_default:
            v.id === editingVariant.id ||
            Boolean(
              v.id?.startsWith("temp-") && v.name === editingVariant.name
            ),
        }))
      );
    }

    setVariantDialogOpen(false);
    setEditingVariant(null);
  };

  const deleteVariant = (variantId: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  // Addon management
  const openAddonDialog = (addon?: AddonFormData) => {
    setEditingAddon(
      addon || {
        name: "",
        description: "",
        price: 0,
        is_recurring: false,
        recurring_interval: null,
      }
    );
    setAddonDialogOpen(true);
  };

  const saveAddon = () => {
    if (!editingAddon?.name.trim()) return;

    if (editingAddon.id) {
      setAddons((prev) =>
        prev.map((a) => (a.id === editingAddon.id ? editingAddon : a))
      );
    } else {
      setAddons((prev) => [
        ...prev,
        { ...editingAddon, id: `temp-${Date.now()}` },
      ]);
    }

    setAddonDialogOpen(false);
    setEditingAddon(null);
  };

  const deleteAddon = (addonId: string) => {
    setAddons((prev) => prev.filter((a) => a.id !== addonId));
  };

  // Dependency management
  const openDependencyDialog = (dep?: DependencyFormData) => {
    setEditingDependency(
      dep || {
        depends_on_service_id: "",
        dependency_type: "suggested",
        auto_add: false,
        message: "",
        discount_percentage: 0,
      }
    );
    setDependencyDialogOpen(true);
  };

  const saveDependency = () => {
    if (!editingDependency?.depends_on_service_id) return;

    if (editingDependency.id) {
      setDependencies((prev) =>
        prev.map((d) => (d.id === editingDependency.id ? editingDependency : d))
      );
    } else {
      setDependencies((prev) => [
        ...prev,
        { ...editingDependency, id: `temp-${Date.now()}` },
      ]);
    }

    setDependencyDialogOpen(false);
    setEditingDependency(null);
  };

  const deleteDependency = (depId: string) => {
    setDependencies((prev) => prev.filter((d) => d.id !== depId));
  };

  // Save all
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Il nome è obbligatorio");
      return;
    }
    if (!formData.slug.trim()) {
      alert("Lo slug è obbligatorio");
      return;
    }

    setSaving(true);

    const dataToSave = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      short_description: formData.short_description || null,
      macro_area_id: formData.macro_area_id || null,
      pricing_type: formData.pricing_type,
      base_price: formData.base_price,
      max_price: formData.pricing_type === "range" ? formData.max_price : null,
      setup_fee: formData.is_recurring ? formData.setup_fee : null,
      recurring_interval:
        formData.pricing_type === "recurring"
          ? formData.recurring_interval
          : null,
      time_unit:
        formData.pricing_type === "time_based" ? formData.time_unit : null,
      pricing_tiers:
        formData.pricing_type === "tiered" ? formData.pricing_tiers : null,
      pricing_parameters:
        formData.pricing_parameters.length > 0
          ? formData.pricing_parameters
          : null,
      is_recurring: formData.is_recurring,
      requires_quantity_input: formData.requires_quantity_input,
      min_quantity: formData.min_quantity,
      max_quantity: formData.max_quantity,
      default_quantity: formData.default_quantity,
      requires_manual_pricing: formData.requires_manual_pricing,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
      estimated_delivery_days: formData.estimated_delivery_days,
      delivery_unit: formData.delivery_unit,
      tags: formData.tags,
    };

    try {
      let serviceId = id;

      if (isNew) {
        const { data, error } = await (supabase as any)
          .from("services")
          .insert(dataToSave)
          .select("id")
          .single();
        if (error) throw error;
        serviceId = data.id;
      } else {
        const { error } = await (supabase as any)
          .from("services")
          .update(dataToSave)
          .eq("id", id);
        if (error) throw error;

        // Delete old variants, addons, dependencies
        await (supabase as any)
          .from("service_variants")
          .delete()
          .eq("service_id", id);
        await (supabase as any)
          .from("service_addons")
          .delete()
          .eq("service_id", id);
        await (supabase as any)
          .from("service_dependencies")
          .delete()
          .eq("service_id", id);
      }

      // Save variants
      if (variants.length > 0) {
        const variantsToInsert = variants.map((v, i) => ({
          service_id: serviceId,
          name: v.name,
          description: v.description || null,
          price_modifier_type: v.price_modifier_type,
          price_modifier_value: v.price_modifier_value,
          is_default: v.is_default,
          features: v.features,
          sort_order: i,
          is_active: true,
        }));
        const { error } = await (supabase as any)
          .from("service_variants")
          .insert(variantsToInsert);
        if (error) throw error;
      }

      // Save addons
      if (addons.length > 0) {
        const addonsToInsert = addons.map((a, i) => ({
          service_id: serviceId,
          name: a.name,
          description: a.description || null,
          price: a.price,
          is_recurring: a.is_recurring,
          recurring_interval: a.is_recurring ? a.recurring_interval : null,
          sort_order: i,
          is_active: true,
        }));
        const { error } = await (supabase as any)
          .from("service_addons")
          .insert(addonsToInsert);
        if (error) throw error;
      }

      // Save dependencies
      if (dependencies.length > 0) {
        const depsToInsert = dependencies.map((d) => ({
          service_id: serviceId,
          depends_on_service_id: d.depends_on_service_id,
          dependency_type: d.dependency_type,
          auto_add: d.auto_add,
          message: d.message || null,
          discount_percentage: d.discount_percentage || 0,
        }));
        const { error } = await (supabase as any)
          .from("service_dependencies")
          .insert(depsToInsert);
        if (error) throw error;
      }

      router.push(isNew ? "/servizi" : `/servizi/${serviceId}`);
    } catch (error: any) {
      console.error("Errore salvataggio:", error);
      alert("Errore durante il salvataggio: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Get service name by ID
  const getServiceName = (serviceId: string) => {
    return (
      allServices.find((s) => s.id === serviceId)?.name ||
      "Servizio sconosciuto"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={isNew ? "/servizi" : `/servizi/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {isNew ? "Nuovo Servizio" : "Modifica Servizio"}
            </h1>
            {!isNew && (
              <p className="text-muted-foreground mt-1">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {formData.slug}
                </code>
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={isNew ? "/servizi" : `/servizi/${id}`}>Annulla</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salva
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Generale
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="parameters" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Parametri ({formData.pricing_parameters.length})
          </TabsTrigger>
          <TabsTrigger value="variants" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Varianti ({variants.length})
          </TabsTrigger>
          <TabsTrigger value="addons" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add-ons ({addons.length})
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Relazioni ({dependencies.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB: General */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informazioni Base</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Nome del servizio"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: e.target.value,
                          }))
                        }
                        placeholder="nome-servizio"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="macro_area">Macro-Area</Label>
                    <Select
                      value={formData.macro_area_id || "__none__"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          macro_area_id: value === "__none__" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona macro-area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Nessuna</SelectItem>
                        {macroAreas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.icon && (
                              <span className="mr-2">{area.icon}</span>
                            )}
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="short_description">Descrizione Breve</Label>
                    <Input
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          short_description: e.target.value,
                        }))
                      }
                      placeholder="Una breve descrizione"
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrizione Completa</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Descrizione dettagliata del servizio..."
                      rows={4}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                        placeholder="Aggiungi tag..."
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Delivery Time */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="delivery_days">
                        Tempo Consegna Stimato
                      </Label>
                      <Input
                        id="delivery_days"
                        type="number"
                        min="0"
                        value={formData.estimated_delivery_days || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            estimated_delivery_days:
                              parseInt(e.target.value) || null,
                          }))
                        }
                        placeholder="Non specificato"
                      />
                    </div>
                    <div>
                      <Label htmlFor="delivery_unit">Unità Consegna</Label>
                      <Select
                        value={formData.delivery_unit}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            delivery_unit: value as DeliveryUnit,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Giorni</SelectItem>
                          <SelectItem value="weeks">Settimane</SelectItem>
                          <SelectItem value="months">Mesi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_active">Attivo</Label>
                      <p className="text-xs text-muted-foreground">
                        Visibile nel catalogo
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_active: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_featured">In Evidenza</Label>
                      <p className="text-xs text-muted-foreground">
                        Mostrato in primo piano
                      </p>
                    </div>
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_featured: checked,
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB: Pricing */}
        <TabsContent value="pricing" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurazione Prezzo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Tipo Pricing</Label>
                  <Select
                    value={formData.pricing_type}
                    onValueChange={(value) =>
                      handlePricingTypeChange(value as PricingType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRICING_TYPE_LABELS).map(
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
                  <Label htmlFor="base_price">
                    {formData.pricing_type === "range"
                      ? "Prezzo Minimo"
                      : "Prezzo Base"}{" "}
                    *
                  </Label>
                  <Input
                    id="base_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        base_price: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>

              {formData.pricing_type === "range" && (
                <div>
                  <Label htmlFor="max_price">Prezzo Massimo</Label>
                  <Input
                    id="max_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.max_price || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        max_price: parseFloat(e.target.value) || null,
                      }))
                    }
                  />
                </div>
              )}

              {formData.pricing_type === "recurring" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Intervallo Ricorrenza</Label>
                    <Select
                      value={formData.recurring_interval || "month"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          recurring_interval: value as RecurringInterval,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RECURRING_INTERVAL_LABELS).map(
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
                    <Label htmlFor="setup_fee">Setup Fee (opzionale)</Label>
                    <Input
                      id="setup_fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.setup_fee || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          setup_fee: parseFloat(e.target.value) || null,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {formData.pricing_type === "time_based" && (
                <div>
                  <Label>Unità di Tempo</Label>
                  <Select
                    value={formData.time_unit || "day"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        time_unit: value as TimeUnit,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIME_UNIT_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.pricing_type === "tiered" && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Scaglioni di Prezzo</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addTier}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Aggiungi Scaglione
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.pricing_tiers.map((tier, index) => (
                      <div
                        key={index}
                        className="flex gap-2 items-center p-3 bg-muted/50 rounded"
                      >
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Da</Label>
                            <Input
                              type="number"
                              min="1"
                              value={tier.min}
                              onChange={(e) =>
                                updateTier(
                                  index,
                                  "min",
                                  parseInt(e.target.value) || 1
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">A</Label>
                            <Input
                              type="number"
                              min="1"
                              value={tier.max}
                              onChange={(e) =>
                                updateTier(
                                  index,
                                  "max",
                                  parseInt(e.target.value) || 999
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">€/unità</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={tier.price_per_unit}
                              onChange={(e) =>
                                updateTier(
                                  index,
                                  "price_per_unit",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeTier(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity settings */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label htmlFor="requires_quantity">Richiede Quantità</Label>
                    <p className="text-xs text-muted-foreground">
                      L&apos;utente deve specificare una quantità
                    </p>
                  </div>
                  <Switch
                    id="requires_quantity"
                    checked={formData.requires_quantity_input}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        requires_quantity_input: checked,
                      }))
                    }
                  />
                </div>

                {formData.requires_quantity_input && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="min_quantity">Quantità Minima</Label>
                      <Input
                        id="min_quantity"
                        type="number"
                        min="1"
                        value={formData.min_quantity}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            min_quantity: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_quantity">Quantità Massima</Label>
                      <Input
                        id="max_quantity"
                        type="number"
                        min="1"
                        value={formData.max_quantity || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            max_quantity: parseInt(e.target.value) || null,
                          }))
                        }
                        placeholder="Illimitata"
                      />
                    </div>
                    <div>
                      <Label htmlFor="default_quantity">Default</Label>
                      <Input
                        id="default_quantity"
                        type="number"
                        min="1"
                        value={formData.default_quantity}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            default_quantity: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label htmlFor="requires_manual">Prezzo Manuale</Label>
                  <p className="text-xs text-muted-foreground">
                    Richiede inserimento manuale del prezzo
                  </p>
                </div>
                <Switch
                  id="requires_manual"
                  checked={formData.requires_manual_pricing}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      requires_manual_pricing: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Parameters */}
        <TabsContent value="parameters" className="space-y-6 mt-6">
          <Card>
            <CardContent className="pt-6">
              <ServicePricingParametersEditor
                parameters={formData.pricing_parameters}
                onChange={(params) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing_parameters: params,
                  }))
                }
                basePrice={formData.base_price}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Variants */}
        <TabsContent value="variants" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Varianti del Servizio
                </CardTitle>
                <Button onClick={() => openVariantDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuova Variante
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {variants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna variante definita</p>
                  <p className="text-sm">
                    Le varianti permettono di offrire versioni diverse dello
                    stesso servizio (es. Base, Standard, Premium)
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`border-2 rounded-lg p-4 ${
                        variant.is_default
                          ? "border-primary bg-primary/5"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{variant.name}</h4>
                        {variant.is_default && (
                          <Badge variant="default" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      {variant.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {variant.description}
                        </p>
                      )}
                      <p className="text-xl font-bold mb-2">
                        € {variant.price_modifier_value.toFixed(2)}
                      </p>
                      {variant.features.length > 0 && (
                        <ul className="space-y-1 mb-3">
                          {variant.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-muted-foreground flex items-center gap-1"
                            >
                              <span className="text-green-500">✓</span>{" "}
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openVariantDialog(variant)}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteVariant(variant.id!)}
                        >
                          Elimina
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Add-ons */}
        <TabsContent value="addons" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add-ons Disponibili
                </CardTitle>
                <Button onClick={() => openAddonDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuovo Add-on
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {addons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun add-on definito</p>
                  <p className="text-sm">
                    Gli add-on sono opzioni aggiuntive acquistabili con il
                    servizio
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addons.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{addon.name}</h4>
                        {addon.description && (
                          <p className="text-xs text-muted-foreground">
                            {addon.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-mono font-bold">
                            +€ {addon.price.toFixed(2)}
                          </p>
                          {addon.is_recurring && (
                            <span className="text-xs text-blue-600">
                              /
                              {RECURRING_INTERVAL_LABELS[
                                addon.recurring_interval!
                              ] || "periodo"}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAddonDialog(addon)}
                          >
                            Modifica
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteAddon(addon.id!)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Dependencies */}
        <TabsContent value="dependencies" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Relazioni con altri Servizi
                </CardTitle>
                <Button onClick={() => openDependencyDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuova Relazione
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dependencies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna relazione definita</p>
                  <p className="text-sm">
                    Definisci dipendenze obbligatorie, suggerimenti o
                    incompatibilità
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dependencies.map((dep) => (
                    <div
                      key={dep.id}
                      className={`flex justify-between items-center p-4 border-2 rounded-lg ${
                        dep.dependency_type === "required"
                          ? "border-red-500/50 bg-red-500/10 dark:bg-red-500/20"
                          : dep.dependency_type === "conflicts_with"
                          ? "border-orange-500/50 bg-orange-500/10 dark:bg-orange-500/20"
                          : dep.dependency_type === "suggested"
                          ? "border-blue-500/50 bg-blue-500/10 dark:bg-blue-500/20"
                          : "border-green-500/50 bg-green-500/10 dark:bg-green-500/20"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {dep.dependency_type === "conflicts_with" && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          <Link
                            href={`/servizi/${dep.depends_on_service_id}`}
                            className="font-semibold text-foreground hover:text-primary hover:underline transition-colors flex items-center gap-1.5"
                          >
                            {getServiceName(dep.depends_on_service_id)}
                            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                          </Link>
                          <Badge
                            variant={
                              dep.dependency_type === "required"
                                ? "destructive"
                                : dep.dependency_type === "conflicts_with"
                                ? "outline"
                                : "secondary"
                            }
                            className={
                              dep.dependency_type === "conflicts_with"
                                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                                : ""
                            }
                          >
                            {DEPENDENCY_TYPE_LABELS[dep.dependency_type]}
                          </Badge>
                          {dep.auto_add && (
                            <Badge variant="outline" className="text-xs">
                              Auto-add
                            </Badge>
                          )}
                        </div>
                        {dep.message && (
                          <p className="text-sm text-muted-foreground mt-1.5">
                            {dep.message}
                          </p>
                        )}
                        {dep.discount_percentage > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
                            🏷️ Sconto {dep.discount_percentage}% se acquistato
                            insieme
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDependencyDialog(dep)}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteDependency(dep.id!)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Variant Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariant?.id?.startsWith("temp-") || !editingVariant?.id
                ? "Nuova Variante"
                : "Modifica Variante"}
            </DialogTitle>
          </DialogHeader>
          {editingVariant && (
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={editingVariant.name}
                  onChange={(e) =>
                    setEditingVariant({
                      ...editingVariant,
                      name: e.target.value,
                    })
                  }
                  placeholder="es. Premium"
                />
              </div>
              <div>
                <Label>Descrizione</Label>
                <Textarea
                  value={editingVariant.description}
                  onChange={(e) =>
                    setEditingVariant({
                      ...editingVariant,
                      description: e.target.value,
                    })
                  }
                  placeholder="Descrizione della variante..."
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Tipo Modifica Prezzo</Label>
                  <Select
                    value={editingVariant.price_modifier_type}
                    onValueChange={(value) =>
                      setEditingVariant({
                        ...editingVariant,
                        price_modifier_type: value as
                          | "override"
                          | "add"
                          | "multiply",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="override">Prezzo Fisso</SelectItem>
                      <SelectItem value="add">Aggiungi al base</SelectItem>
                      <SelectItem value="multiply">Moltiplica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valore</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingVariant.price_modifier_value}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        price_modifier_value: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Features</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (featureInput.trim()) {
                          setEditingVariant({
                            ...editingVariant,
                            features: [
                              ...editingVariant.features,
                              featureInput.trim(),
                            ],
                          });
                          setFeatureInput("");
                        }
                      }
                    }}
                    placeholder="Aggiungi feature..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (featureInput.trim()) {
                        setEditingVariant({
                          ...editingVariant,
                          features: [
                            ...editingVariant.features,
                            featureInput.trim(),
                          ],
                        });
                        setFeatureInput("");
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {editingVariant.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingVariant.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {feature}
                        <button
                          type="button"
                          onClick={() =>
                            setEditingVariant({
                              ...editingVariant,
                              features: editingVariant.features.filter(
                                (_, i) => i !== idx
                              ),
                            })
                          }
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingVariant.is_default}
                  onCheckedChange={(checked) =>
                    setEditingVariant({
                      ...editingVariant,
                      is_default: checked,
                    })
                  }
                />
                <Label>Variante predefinita</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVariantDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button onClick={saveVariant}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Addon Dialog */}
      <Dialog open={addonDialogOpen} onOpenChange={setAddonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAddon?.id?.startsWith("temp-") || !editingAddon?.id
                ? "Nuovo Add-on"
                : "Modifica Add-on"}
            </DialogTitle>
          </DialogHeader>
          {editingAddon && (
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={editingAddon.name}
                  onChange={(e) =>
                    setEditingAddon({ ...editingAddon, name: e.target.value })
                  }
                  placeholder="es. Logo Animato"
                />
              </div>
              <div>
                <Label>Descrizione</Label>
                <Textarea
                  value={editingAddon.description}
                  onChange={(e) =>
                    setEditingAddon({
                      ...editingAddon,
                      description: e.target.value,
                    })
                  }
                  placeholder="Descrizione dell'add-on..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Prezzo</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingAddon.price}
                  onChange={(e) =>
                    setEditingAddon({
                      ...editingAddon,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingAddon.is_recurring}
                  onCheckedChange={(checked) =>
                    setEditingAddon({
                      ...editingAddon,
                      is_recurring: checked,
                      recurring_interval: checked ? "month" : null,
                    })
                  }
                />
                <Label>Prezzo ricorrente</Label>
              </div>
              {editingAddon.is_recurring && (
                <div>
                  <Label>Intervallo</Label>
                  <Select
                    value={editingAddon.recurring_interval || "month"}
                    onValueChange={(value) =>
                      setEditingAddon({
                        ...editingAddon,
                        recurring_interval: value as RecurringInterval,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(RECURRING_INTERVAL_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddonDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={saveAddon}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dependency Dialog */}
      <Dialog
        open={dependencyDialogOpen}
        onOpenChange={setDependencyDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDependency?.id?.startsWith("temp-") ||
              !editingDependency?.id
                ? "Nuova Relazione"
                : "Modifica Relazione"}
            </DialogTitle>
          </DialogHeader>
          {editingDependency && (
            <div className="space-y-4">
              <div>
                <Label>Servizio Correlato *</Label>
                <Select
                  value={editingDependency.depends_on_service_id}
                  onValueChange={(value) =>
                    setEditingDependency({
                      ...editingDependency,
                      depends_on_service_id: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona servizio" />
                  </SelectTrigger>
                  <SelectContent>
                    {allServices
                      .filter((s) => s.id !== id)
                      .map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo Relazione</Label>
                <Select
                  value={editingDependency.dependency_type}
                  onValueChange={(value) =>
                    setEditingDependency({
                      ...editingDependency,
                      dependency_type: value as DependencyType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DEPENDENCY_TYPE_LABELS).map(
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
                <Label>Messaggio</Label>
                <Input
                  value={editingDependency.message}
                  onChange={(e) =>
                    setEditingDependency({
                      ...editingDependency,
                      message: e.target.value,
                    })
                  }
                  placeholder="es. Questo servizio richiede un dominio registrato"
                />
              </div>
              {editingDependency.dependency_type === "required" && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingDependency.auto_add}
                    onCheckedChange={(checked) =>
                      setEditingDependency({
                        ...editingDependency,
                        auto_add: checked,
                      })
                    }
                  />
                  <Label>Aggiungi automaticamente al preventivo</Label>
                </div>
              )}
              {editingDependency.dependency_type === "suggested" && (
                <div>
                  <Label>Sconto se acquistato insieme (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editingDependency.discount_percentage}
                    onChange={(e) =>
                      setEditingDependency({
                        ...editingDependency,
                        discount_percentage: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDependencyDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button onClick={saveDependency}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
