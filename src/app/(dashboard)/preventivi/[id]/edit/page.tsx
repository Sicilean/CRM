"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Service,
  MacroArea,
  ServiceVariant,
  ServiceAddon,
  QuoteStatus,
  QuoteItemConfiguration,
  QuotePublicToken,
  QuoteCommercialMetrics,
  RecurringInterval,
  QUOTE_STATUS_LABELS,
  PRICING_TYPE_LABELS,
  RECURRING_INTERVAL_LABELS,
  calculateCommercialMetrics,
  formatRecurringWithCount,
} from "@/types/quotes.types";
import ServiceConfigurationDialog from "@/components/features/service-configuration-dialog";
import { QuoteClientSelector } from "@/components/features/quote-client-selector";
import { QuoteReferenteSelector } from "@/components/features/quote-referente-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Search,
  Star,
  RefreshCw,
  ShoppingCart,
  Settings2,
  Calculator,
  Clock,
  Sparkles,
  Percent,
  Lightbulb,
  Share2,
  Link2,
  Copy,
  Check,
  Eye,
  Trash2,
  TrendingUp,
  Wallet,
  PiggyBank,
  BarChart3,
  ExternalLink,
  Lock,
  Calendar,
  Building2,
  User,
  Edit2,
  UserCircle,
} from "lucide-react";
import Link from "next/link";

interface QuoteItem {
  id: string;
  service_id: string;
  variant_id: string | null;
  service_name: string;
  service_description: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  is_recurring: boolean;
  recurring_interval: string | null;
  recurring_count: number | null;
  setup_fee: number;
  discount_percentage: number;
  discount_amount: number;
  notes: string | null;
  configuration: QuoteItemConfiguration;
  addons: {
    addon_id: string;
    addon_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    is_recurring?: boolean;
    recurring_interval?: string | null;
    recurring_count?: number | null;
  }[];
}

interface ServiceDependency {
  id: string;
  service_id: string;
  depends_on_service_id: string;
  dependency_type: "suggested" | "required";
  auto_add: boolean;
  message: string | null;
  discount_percentage: number | null;
}

interface ServiceWithDetails extends Service {
  macro_area: MacroArea | null;
  variants: ServiceVariant[];
  addons: ServiceAddon[];
}

export default function PreventivoEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";
  const supabase = createClient();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [macroAreas, setMacroAreas] = useState<MacroArea[]>([]);
  const [services, setServices] = useState<ServiceWithDetails[]>([]);
  const [serviceDependencies, setServiceDependencies] = useState<
    ServiceDependency[]
  >([]);
  const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [serviceToConfig, setServiceToConfig] =
    useState<ServiceWithDetails | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null); // ID dell'item da riconfigurare
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMacroArea, setSelectedMacroArea] = useState<string | null>(
    null
  );
  const [suggestedServices, setSuggestedServices] = useState<
    {
      service: ServiceWithDetails;
      discount: number;
      message: string | null;
    }[]
  >([]);

  // Stato per link pubblici
  const [publicTokens, setPublicTokens] = useState<
    (QuotePublicToken & { has_password?: boolean })[]
  >([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [creatingToken, setCreatingToken] = useState(false);
  const [tokenConfig, setTokenConfig] = useState({
    expires_in_days: 30,
    password: "",
    notes: "",
  });
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Stato per selezione cliente
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showReferenteSelector, setShowReferenteSelector] = useState(false);
  const [clientType, setClientType] = useState<
    "persona_fisica" | "persona_giuridica" | null
  >(null);
  const [selectedClientName, setSelectedClientName] = useState<string>("");

  const [formData, setFormData] = useState({
    quote_number: "",
    status: "draft" as QuoteStatus,
    client_name: "",
    client_email: "",
    client_company: "",
    client_phone: "",
    client_vat: "",
    client_fiscal_code: "",
    client_address: "",
    client_sdi_code: "",
    persona_fisica_id: null as string | null,
    persona_giuridica_id: null as string | null,
    referente_name: "",
    referente_role: "",
    discount_percentage: 0,
    tax_percentage: 22,
    payment_terms: "",
    estimated_delivery: "",
    notes: "",
    client_notes: "",
    valid_until: "",
    items: [] as QuoteItem[],
  });

  // Genera numero preventivo
  const generateQuoteNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0");
    return `SL${year}${month}${day}-${random}`;
  };

  useEffect(() => {
    // Carica macro areas
    const loadMacroAreas = async () => {
      const { data } = await (supabase as any)
        .from("macro_areas")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) setMacroAreas(data as MacroArea[]);
    };

    // Carica servizi
    const loadServices = async () => {
      const { data } = await (supabase as any)
        .from("services")
        .select("*, macro_area:macro_areas(*)")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (data) {
        // Carica varianti e addon per ogni servizio
        const servicesWithDetails = await Promise.all(
          (data as any[]).map(async (service: any) => {
            const [variantsRes, addonsRes] = await Promise.all([
              (supabase as any)
                .from("service_variants")
                .select("*")
                .eq("service_id", service.id)
                .eq("is_active", true)
                .order("sort_order"),
              (supabase as any)
                .from("service_addons")
                .select("*")
                .eq("service_id", service.id)
                .eq("is_active", true)
                .order("sort_order"),
            ]);
            return {
              ...service,
              variants: variantsRes.data || [],
              addons: addonsRes.data || [],
            };
          })
        );
        setServices(servicesWithDetails as ServiceWithDetails[]);
      }
    };

    // Carica dipendenze servizi
    const loadDependencies = async () => {
      const { data } = await (supabase as any)
        .from("service_dependencies")
        .select("*");
      if (data) setServiceDependencies(data as ServiceDependency[]);
    };

    loadMacroAreas();
    loadServices();
    loadDependencies();

    if (isNew) {
      // Imposta valori di default per nuovo preventivo
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      setFormData((prev) => ({
        ...prev,
        quote_number: generateQuoteNumber(),
        valid_until: validUntil.toISOString().split("T")[0],
      }));
    } else {
      loadPreventivo();
    }
  }, [id]);

  const loadPreventivo = async () => {
    const { data, error } = await (supabase as any)
      .from("quotes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Errore caricamento preventivo:", error);
      router.push("/preventivi");
      return;
    }

    // Carica items
    const { data: itemsData } = await (supabase as any)
      .from("quote_items")
      .select("*")
      .eq("quote_id", id)
      .order("sort_order");

    const items: QuoteItem[] = [];
    for (const item of itemsData || []) {
      const { data: addonsData } = await (supabase as any)
        .from("quote_item_addons")
        .select("*")
        .eq("quote_item_id", item.id);

      items.push({
        id: item.id,
        service_id: item.service_id,
        variant_id: item.variant_id,
        service_name: item.service_name,
        service_description: item.service_description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
        is_recurring: item.is_recurring,
        recurring_interval: item.recurring_interval,
        recurring_count: item.recurring_count || null,
        setup_fee: item.setup_fee || 0,
        discount_percentage: item.discount_percentage || 0,
        discount_amount: item.discount_amount || 0,
        notes: item.notes,
        configuration: item.configuration || {},
        addons: (addonsData || []).map((a: any) => ({
          addon_id: a.addon_id,
          addon_name: a.addon_name,
          quantity: a.quantity,
          unit_price: a.unit_price,
          line_total: a.line_total,
          is_recurring: a.is_recurring || false,
          recurring_interval: a.recurring_interval || null,
          recurring_count: a.recurring_count || null,
        })),
      });
    }

    setFormData({
      quote_number: data.quote_number,
      status: data.status as QuoteStatus,
      client_name: data.client_name || "",
      client_email: data.client_email || "",
      client_company: data.client_company || "",
      client_phone: data.client_phone || "",
      client_vat: data.client_vat || "",
      client_fiscal_code: data.client_fiscal_code || "",
      client_address: data.client_address || "",
      client_sdi_code: data.client_sdi_code || "",
      persona_fisica_id: data.persona_fisica_id,
      persona_giuridica_id: data.persona_giuridica_id,
      referente_name: data.referente_name || "",
      referente_role: data.referente_role || "",
      discount_percentage: data.discount_percentage || 0,
      tax_percentage: data.tax_percentage || 22,
      payment_terms: data.payment_terms || "",
      estimated_delivery: data.estimated_delivery || "",
      notes: data.notes || "",
      client_notes: data.client_notes || "",
      valid_until: data.valid_until || "",
      items,
    });

    // Imposta il tipo di cliente
    if (data.persona_giuridica_id) {
      setClientType("persona_giuridica");
      setSelectedClientName(data.client_company || data.client_name);
    } else if (data.persona_fisica_id) {
      setClientType("persona_fisica");
      setSelectedClientName(data.client_name);
    }

    setLoading(false);
  };

  // Calcola totali con breakdown dettagliato
  const calculateTotals = useCallback(() => {
    let subtotalOneTime = 0;
    let subtotalRecurringMonthly = 0;
    let subtotalRecurringQuarterly = 0;
    let subtotalRecurringYearly = 0;

    // Dettaglio voci ricorrenti per visualizzazione
    const recurringDetails: {
      name: string;
      amount: number;
      interval: RecurringInterval;
      isAddon: boolean;
      parentService?: string;
    }[] = [];

    formData.items.forEach((item) => {
      const itemTotal = item.line_total - item.discount_amount;

      // Calcola addons separatamente per one-time e ricorrenti
      let addonsOneTime = 0;
      let addonsRecurringMonthly = 0;
      let addonsRecurringQuarterly = 0;
      let addonsRecurringYearly = 0;

      item.addons.forEach((addon) => {
        if (addon.is_recurring && addon.recurring_interval) {
          // Addon ricorrente
          const interval = addon.recurring_interval as RecurringInterval;
          if (interval === "month") {
            addonsRecurringMonthly += addon.line_total;
          } else if (interval === "quarter") {
            addonsRecurringQuarterly += addon.line_total;
          } else if (interval === "year") {
            addonsRecurringYearly += addon.line_total;
          }
          // Aggiungi al dettaglio ricorrenti
          recurringDetails.push({
            name: addon.addon_name,
            amount: addon.line_total,
            interval,
            isAddon: true,
            parentService: item.service_name,
          });
        } else {
          // Addon one-time
          addonsOneTime += addon.line_total;
        }
      });

      if (item.is_recurring && item.recurring_interval) {
        // Servizio ricorrente
        const interval = item.recurring_interval as RecurringInterval;
        if (interval === "month") {
          subtotalRecurringMonthly += itemTotal + addonsOneTime;
        } else if (interval === "quarter") {
          subtotalRecurringQuarterly += itemTotal + addonsOneTime;
        } else if (interval === "year") {
          subtotalRecurringYearly += itemTotal + addonsOneTime;
        }
        // Aggiungi al dettaglio ricorrenti
        recurringDetails.push({
          name: item.service_name,
          amount: itemTotal + addonsOneTime,
          interval,
          isAddon: false,
        });
      } else {
        // Servizio one-time
        subtotalOneTime += itemTotal + item.setup_fee + addonsOneTime;
      }

      // Aggiungi sempre gli addons ricorrenti ai rispettivi totali
      subtotalRecurringMonthly += addonsRecurringMonthly;
      subtotalRecurringQuarterly += addonsRecurringQuarterly;
      subtotalRecurringYearly += addonsRecurringYearly;
    });

    const discountAmount =
      subtotalOneTime * (formData.discount_percentage / 100);
    const totalOneTime = subtotalOneTime - discountAmount;
    const taxAmount = totalOneTime * (formData.tax_percentage / 100);
    const grandTotal = totalOneTime + taxAmount;

    // Calcola metriche commerciali sull'imponibile totale
    // L'imponibile include one-time + stima annuale ricorrenti
    const annualRecurring =
      subtotalRecurringMonthly * 12 +
      subtotalRecurringQuarterly * 4 +
      subtotalRecurringYearly;
    const imponibileTotale = totalOneTime;
    const commercialMetrics = calculateCommercialMetrics(imponibileTotale);

    return {
      subtotalOneTime,
      subtotalRecurringMonthly,
      subtotalRecurringQuarterly,
      subtotalRecurringYearly,
      recurringDetails,
      discountAmount,
      totalOneTime,
      taxAmount,
      grandTotal,
      // Metriche commerciali
      commercialMetrics,
      // Stima annuale ricorrenti (per info)
      annualRecurring,
    };
  }, [formData.items, formData.discount_percentage, formData.tax_percentage]);

  const totals = calculateTotals();

  // Aggiungi servizio al preventivo
  const handleAddService = (
    service: ServiceWithDetails,
    variantId?: string
  ) => {
    // Se il servizio ha parametri, varianti o addons, apri il dialog di configurazione
    const hasParameters =
      service.pricing_parameters && service.pricing_parameters.length > 0;
    const hasVariants = service.variants && service.variants.length > 0;
    const hasAddons = service.addons && service.addons.length > 0;

    if (hasParameters || hasVariants || hasAddons) {
      setServiceToConfig(service);
      setConfigDialogOpen(true);
      setAddServiceDialogOpen(false);
      return;
    }

    // Aggiunta rapida senza configurazione
    addServiceDirectly(service, variantId);
  };

  // Funzione helper per aggiungere direttamente senza dialog
  const addServiceDirectly = (
    service: ServiceWithDetails,
    variantId?: string
  ) => {
    const variant = variantId
      ? service.variants.find((v) => v.id === variantId)
      : service.variants.find((v) => v.is_default) || service.variants[0];

    let unitPrice = service.base_price;
    if (variant) {
      if (variant.price_modifier_type === "override") {
        unitPrice = variant.price_modifier_value;
      } else if (variant.price_modifier_type === "add") {
        unitPrice = service.base_price + variant.price_modifier_value;
      } else if (variant.price_modifier_type === "multiply") {
        unitPrice = service.base_price * variant.price_modifier_value;
      }
    }

    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      service_id: service.id,
      variant_id: variant?.id || null,
      service_name: variant
        ? `${service.name} - ${variant.name}`
        : service.name,
      service_description: service.short_description,
      quantity: service.default_quantity || 1,
      unit_price: unitPrice,
      line_total: unitPrice * (service.default_quantity || 1),
      is_recurring: service.is_recurring,
      recurring_interval: service.recurring_interval,
      recurring_count: service.is_recurring
        ? getDefaultRecurringCount(service.recurring_interval)
        : null,
      setup_fee: service.setup_fee || 0,
      discount_percentage: 0,
      discount_amount: 0,
      notes: null,
      configuration: {},
      addons: [],
    };

    setFormData((prev) => {
      const newItems = [...prev.items, newItem];
      // Aggiorna suggerimenti dopo l'aggiunta
      setTimeout(() => updateSuggestions(newItems), 0);
      return {
        ...prev,
        items: newItems,
      };
    });
    setAddServiceDialogOpen(false);
  };

  // Aggiungi servizio suggerito con sconto
  const handleAddSuggestedService = (
    service: ServiceWithDetails,
    discountPercentage: number
  ) => {
    // Se il servizio ha parametri/varianti/addons, apri configurazione
    const hasParameters =
      service.pricing_parameters && service.pricing_parameters.length > 0;
    const hasVariants = service.variants && service.variants.length > 0;
    const hasAddons = service.addons && service.addons.length > 0;

    if (hasParameters || hasVariants || hasAddons) {
      setServiceToConfig(service);
      setConfigDialogOpen(true);
      // Salviamo lo sconto per applicarlo dopo
      (window as any).__pendingDiscount = discountPercentage;
      return;
    }

    // Aggiunta rapida con sconto
    const variant =
      service.variants.find((v) => v.is_default) || service.variants[0];
    let unitPrice = service.base_price;
    if (variant) {
      if (variant.price_modifier_type === "override") {
        unitPrice = variant.price_modifier_value;
      } else if (variant.price_modifier_type === "add") {
        unitPrice = service.base_price + variant.price_modifier_value;
      } else if (variant.price_modifier_type === "multiply") {
        unitPrice = service.base_price * variant.price_modifier_value;
      }
    }

    const qty = service.default_quantity || 1;
    const lineTotal = unitPrice * qty;
    const discountAmount = lineTotal * (discountPercentage / 100);

    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      service_id: service.id,
      variant_id: variant?.id || null,
      service_name: variant
        ? `${service.name} - ${variant.name}`
        : service.name,
      service_description: service.short_description,
      quantity: qty,
      unit_price: unitPrice,
      line_total: lineTotal, // Totale PRIMA dello sconto
      is_recurring: service.is_recurring,
      recurring_interval: service.recurring_interval,
      recurring_count: service.is_recurring
        ? getDefaultRecurringCount(service.recurring_interval)
        : null,
      setup_fee: service.setup_fee || 0,
      discount_percentage: discountPercentage,
      discount_amount: discountAmount, // Sconto calcolato sul totale
      notes:
        discountPercentage > 0 ? `Sconto bundle: ${discountPercentage}%` : null,
      configuration: {},
      addons: [],
    };

    setFormData((prev) => {
      const newItems = [...prev.items, newItem];
      setTimeout(() => updateSuggestions(newItems), 0);
      return {
        ...prev,
        items: newItems,
      };
    });
  };

  // Handler per conferma dalla configurazione
  const handleConfigurationConfirm = (config: {
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
      recurring_count?: number | null;
    }[];
    configuration: QuoteItemConfiguration;
  }) => {
    if (!serviceToConfig) return;

    // Verifica se c'è uno sconto pendente (da servizio suggerito) - solo per nuovi item
    const pendingDiscount = editingItemId
      ? 0
      : (window as any).__pendingDiscount || 0;
    if (!editingItemId) {
      delete (window as any).__pendingDiscount;
    }

    const addonsTotal = config.addons.reduce((sum, a) => sum + a.price, 0);
    const lineTotal = config.unit_price * config.quantity + addonsTotal;

    // Se stiamo modificando un item esistente, manteniamo lo sconto originale
    const existingItem = editingItemId
      ? formData.items.find((i) => i.id === editingItemId)
      : null;
    const discountPercentage =
      existingItem?.discount_percentage || pendingDiscount;
    const discountAmount = lineTotal * (discountPercentage / 100);

    const itemData: QuoteItem = {
      id: editingItemId || crypto.randomUUID(),
      service_id: serviceToConfig.id,
      variant_id: config.variant_id,
      service_name: config.variant_name
        ? `${serviceToConfig.name} - ${config.variant_name}`
        : serviceToConfig.name,
      service_description: serviceToConfig.short_description,
      quantity: config.quantity,
      unit_price: config.unit_price,
      line_total: lineTotal,
      is_recurring: serviceToConfig.is_recurring,
      recurring_interval: serviceToConfig.recurring_interval,
      recurring_count:
        existingItem?.recurring_count ||
        (serviceToConfig.is_recurring
          ? getDefaultRecurringCount(serviceToConfig.recurring_interval)
          : null),
      setup_fee: serviceToConfig.setup_fee || 0,
      discount_percentage: discountPercentage,
      discount_amount: discountAmount,
      notes:
        existingItem?.notes ||
        (discountPercentage > 0
          ? `Sconto bundle: ${discountPercentage}%`
          : null),
      configuration: config.configuration,
      addons: config.addons.map((a) => ({
        addon_id: a.addon_id,
        addon_name: a.addon_name,
        quantity: 1,
        unit_price: a.price,
        line_total: a.price,
        is_recurring: a.is_recurring,
        recurring_interval: a.recurring_interval,
        recurring_count: a.recurring_count || null,
      })),
    };

    setFormData((prev) => {
      let newItems: QuoteItem[];
      if (editingItemId) {
        // Aggiorna l'item esistente
        newItems = prev.items.map((i) =>
          i.id === editingItemId ? itemData : i
        );
      } else {
        // Aggiungi nuovo item
        newItems = [...prev.items, itemData];
      }
      setTimeout(() => updateSuggestions(newItems), 0);
      return {
        ...prev,
        items: newItems,
      };
    });
    setServiceToConfig(null);
    setEditingItemId(null);
    setConfigDialogOpen(false);
  };

  // Riconfigura servizio esistente
  const handleReconfigureItem = async (item: QuoteItem) => {
    // Trova il servizio originale
    const service = services.find((s) => s.id === item.service_id);
    if (!service) {
      // Se il servizio non è nei servizi caricati, caricalo
      const { data: serviceData } = await supabase
        .from("services")
        .select(
          `
          *,
          macro_area:macro_areas(*),
          variants:service_variants(*),
          addons:service_addons(*)
        `
        )
        .eq("id", item.service_id)
        .single();

      if (serviceData) {
        setServiceToConfig(serviceData as ServiceWithDetails);
        setEditingItemId(item.id);
        setConfigDialogOpen(true);
      }
    } else {
      setServiceToConfig(service);
      setEditingItemId(item.id);
      setConfigDialogOpen(true);
    }
  };

  // Rimuovi servizio
  const handleRemoveItem = (itemId: string) => {
    setFormData((prev) => {
      const newItems = prev.items.filter((i) => i.id !== itemId);
      setTimeout(() => updateSuggestions(newItems), 0);
      return {
        ...prev,
        items: newItems,
      };
    });
  };

  // Aggiorna quantità
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? { ...item, quantity, line_total: item.unit_price * quantity }
          : item
      ),
    }));
  };

  // Salva preventivo
  const handleSave = async () => {
    if (!formData.client_name.trim() || !formData.client_email.trim()) {
      alert("Nome e email cliente sono obbligatori");
      return;
    }

    setSaving(true);

    const totals = calculateTotals();

    const quoteData = {
      quote_number: formData.quote_number,
      status: formData.status,
      client_name: formData.client_name,
      client_email: formData.client_email,
      client_company: formData.client_company || null,
      client_phone: formData.client_phone || null,
      client_vat: formData.client_vat || null,
      client_fiscal_code: formData.client_fiscal_code || null,
      client_address: formData.client_address || null,
      client_sdi_code: formData.client_sdi_code || null,
      persona_fisica_id: formData.persona_fisica_id,
      persona_giuridica_id: formData.persona_giuridica_id,
      referente_name: formData.referente_name || null,
      referente_role: formData.referente_role || null,
      subtotal_one_time: totals.subtotalOneTime,
      subtotal_recurring_monthly: totals.subtotalRecurringMonthly,
      subtotal_recurring_yearly: totals.subtotalRecurringYearly,
      discount_amount: totals.discountAmount,
      discount_percentage: formData.discount_percentage,
      tax_amount: totals.taxAmount,
      tax_percentage: formData.tax_percentage,
      total_one_time: totals.totalOneTime + totals.taxAmount,
      total_recurring_monthly: totals.subtotalRecurringMonthly,
      total_recurring_yearly: totals.subtotalRecurringYearly,
      grand_total: totals.grandTotal,
      payment_terms: formData.payment_terms || null,
      estimated_delivery: formData.estimated_delivery || null,
      notes: formData.notes || null,
      client_notes: formData.client_notes || null,
      valid_until: formData.valid_until || null,
    };

    try {
      let quoteId = id;

      if (isNew) {
        const { data, error } = await (supabase as any)
          .from("quotes")
          .insert(quoteData)
          .select("id")
          .single();
        if (error) throw error;
        quoteId = data.id;
      } else {
        const { error } = await (supabase as any)
          .from("quotes")
          .update(quoteData)
          .eq("id", id);
        if (error) throw error;

        // Elimina vecchi items
        await (supabase as any)
          .from("quote_item_addons")
          .delete()
          .in(
            "quote_item_id",
            formData.items.map((i) => i.id)
          );
        await (supabase as any).from("quote_items").delete().eq("quote_id", id);
      }

      // Inserisci items
      for (let i = 0; i < formData.items.length; i++) {
        const item = formData.items[i];
        const { data: itemData, error: itemError } = await (supabase as any)
          .from("quote_items")
          .insert({
            quote_id: quoteId,
            service_id: item.service_id,
            variant_id: item.variant_id,
            service_name: item.service_name,
            service_description: item.service_description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            line_total: item.line_total,
            is_recurring: item.is_recurring,
            recurring_interval: item.recurring_interval,
            recurring_count: item.recurring_count,
            setup_fee: item.setup_fee,
            discount_percentage: item.discount_percentage,
            discount_amount: item.discount_amount,
            configuration: item.configuration || {},
            notes: item.notes,
            sort_order: i,
          })
          .select("id")
          .single();

        if (itemError) throw itemError;

        // Inserisci addons
        if (item.addons.length > 0) {
          await (supabase as any).from("quote_item_addons").insert(
            item.addons.map((addon) => ({
              quote_item_id: itemData.id,
              addon_id: addon.addon_id,
              addon_name: addon.addon_name,
              quantity: addon.quantity,
              unit_price: addon.unit_price,
              line_total: addon.line_total,
              is_recurring: addon.is_recurring || false,
              recurring_interval: addon.recurring_interval || null,
              recurring_count: addon.recurring_count || null,
            }))
          );
        }
      }

      router.push(`/preventivi/${quoteId}`);
    } catch (error: any) {
      console.error("Errore salvataggio:", error);
      alert("Errore durante il salvataggio: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Calcola suggerimenti basati sui servizi aggiunti
  const updateSuggestions = useCallback(
    (items: QuoteItem[]) => {
      if (items.length === 0) {
        setSuggestedServices([]);
        return;
      }

      const addedServiceIds = items.map((i) => i.service_id);
      const suggestions: {
        service: ServiceWithDetails;
        discount: number;
        message: string | null;
      }[] = [];

      // Per ogni servizio aggiunto, cerca le dipendenze
      addedServiceIds.forEach((serviceId) => {
        // Trova servizi che sono suggeriti quando si aggiunge questo servizio
        // (dove service_id = serviceId e dependency_type = 'suggested')
        const deps = serviceDependencies.filter(
          (d) => d.service_id === serviceId && d.dependency_type === "suggested"
        );

        deps.forEach((dep) => {
          // Non suggerire se già aggiunto
          if (addedServiceIds.includes(dep.depends_on_service_id)) return;
          // Non suggerire se già in lista suggerimenti
          if (
            suggestions.some((s) => s.service.id === dep.depends_on_service_id)
          )
            return;

          const suggestedService = services.find(
            (s) => s.id === dep.depends_on_service_id
          );
          if (suggestedService) {
            suggestions.push({
              service: suggestedService,
              discount: dep.discount_percentage || 0,
              message: dep.message,
            });
          }
        });
      });

      setSuggestedServices(suggestions);
    },
    [services, serviceDependencies]
  );

  // Calcola tempi totali di consegna
  const calculateTotalDeliveryDays = useCallback(() => {
    let totalDays = 0;
    formData.items.forEach((item) => {
      const service = services.find((s) => s.id === item.service_id);
      if (service?.estimated_delivery_days) {
        // Usa il max tra i servizi per lavori paralleli, o somma per sequenziali
        // Per semplicità, prendiamo il max
        totalDays = Math.max(totalDays, service.estimated_delivery_days);
      }
    });
    return totalDays;
  }, [formData.items, services]);

  const estimatedDays = calculateTotalDeliveryDays();

  // Funzioni per gestione link pubblici
  const loadPublicTokens = useCallback(async () => {
    if (isNew) return;
    try {
      const res = await fetch(`/api/quotes/${id}/public-token`);
      const data = await res.json();
      if (data.tokens) {
        setPublicTokens(data.tokens);
      }
    } catch (error) {
      console.error("Errore caricamento token:", error);
    }
  }, [id, isNew]);

  const createPublicToken = async () => {
    if (isNew) {
      alert("Salva prima il preventivo per creare un link pubblico");
      return;
    }
    setCreatingToken(true);
    try {
      const res = await fetch(`/api/quotes/${id}/public-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokenConfig),
      });
      const data = await res.json();
      if (data.success) {
        setPublicTokens((prev) => [data.token, ...prev]);
        setTokenConfig({ expires_in_days: 30, password: "", notes: "" });
        // Copia automaticamente l'URL
        navigator.clipboard.writeText(data.public_url);
        setCopiedTokenId(data.token.id);
        setTimeout(() => setCopiedTokenId(null), 2000);
      } else {
        alert(data.error || "Errore creazione link");
      }
    } catch (error: any) {
      alert("Errore: " + error.message);
    } finally {
      setCreatingToken(false);
    }
  };

  const deletePublicToken = async (tokenId: string) => {
    if (!confirm("Disattivare questo link? Non sarà più utilizzabile.")) return;
    try {
      const res = await fetch(
        `/api/quotes/${id}/public-token?tokenId=${tokenId}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setPublicTokens((prev) => prev.filter((t) => t.id !== tokenId));
      }
    } catch (error) {
      console.error("Errore eliminazione token:", error);
    }
  };

  const copyTokenUrl = (token: string) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/preventivo/${token}`;
    navigator.clipboard.writeText(url);
    const tokenData = publicTokens.find((t) => t.token === token);
    if (tokenData) {
      setCopiedTokenId(tokenData.id);
      setTimeout(() => setCopiedTokenId(null), 2000);
    }
  };

  // Carica token pubblici quando si carica il preventivo
  useEffect(() => {
    if (!isNew && id) {
      loadPublicTokens();
    }
  }, [isNew, id, loadPublicTokens]);

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea =
      !selectedMacroArea || s.macro_area_id === selectedMacroArea;
    return matchesSearch && matchesArea;
  });

  // Helper per determinare il numero di ricorrenze di default
  const getDefaultRecurringCount = (interval: string | null): number => {
    switch (interval) {
      case "monthly":
        return 12; // 1 anno
      case "quarterly":
        return 4; // 1 anno
      case "yearly":
        return 1;
      default:
        return 12;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
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
          <Link href={isNew ? "/preventivi" : `/preventivi/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {isNew ? "Nuovo Preventivo" : "Modifica Preventivo"}
            </h1>
            <p className="text-muted-foreground mt-1">
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {formData.quote_number}
              </code>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={isNew ? "/preventivi" : `/preventivi/${id}`}>
              Annulla
            </Link>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonna Principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {clientType === "persona_fisica" ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                  Informazioni Cliente
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClientSelector(true)}
                >
                  {formData.persona_fisica_id ||
                  formData.persona_giuridica_id ? (
                    <>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Cambia
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Seleziona Cliente
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Indicatore tipo cliente */}
              {(formData.persona_fisica_id ||
                formData.persona_giuridica_id) && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Badge
                    variant={
                      clientType === "persona_giuridica"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {clientType === "persona_giuridica" ? (
                      <>
                        <Building2 className="h-3 w-3 mr-1" /> Azienda
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 mr-1" /> Persona Fisica
                      </>
                    )}
                  </Badge>
                  <span className="text-sm font-medium">
                    {selectedClientName || formData.client_name}
                  </span>
                  {formData.persona_giuridica_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setShowReferenteSelector(true)}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      {formData.referente_name
                        ? "Cambia Referente"
                        : "Aggiungi Referente"}
                    </Button>
                  )}
                </div>
              )}

              {/* Referente (solo per persona giuridica) */}
              {clientType === "persona_giuridica" &&
                formData.referente_name && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <UserCircle className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Referente: {formData.referente_name}
                      </p>
                      {formData.referente_role && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {formData.referente_role}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          referente_name: "",
                          referente_role: "",
                        }))
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

              {/* Campi cliente */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="client_name">
                    {clientType === "persona_giuridica"
                      ? "Ragione Sociale *"
                      : "Nome *"}
                  </Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        client_name: e.target.value,
                      }))
                    }
                    placeholder={
                      clientType === "persona_giuridica"
                        ? "Ragione sociale"
                        : "Nome cliente"
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="client_email">Email *</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        client_email: e.target.value,
                      }))
                    }
                    placeholder="email@esempio.com"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {clientType === "persona_giuridica" && (
                  <div>
                    <Label htmlFor="client_company">Azienda</Label>
                    <Input
                      id="client_company"
                      value={formData.client_company}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          client_company: e.target.value,
                        }))
                      }
                      placeholder="Nome azienda"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="client_phone">Telefono</Label>
                  <Input
                    id="client_phone"
                    value={formData.client_phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        client_phone: e.target.value,
                      }))
                    }
                    placeholder="+39 123 456 7890"
                  />
                </div>
                {clientType !== "persona_giuridica" && (
                  <div>
                    <Label htmlFor="client_fiscal_code">Codice Fiscale</Label>
                    <Input
                      id="client_fiscal_code"
                      value={formData.client_fiscal_code}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          client_fiscal_code: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="RSSMRA80A01H501X"
                    />
                  </div>
                )}
              </div>
              {clientType === "persona_giuridica" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="client_vat">P.IVA</Label>
                    <Input
                      id="client_vat"
                      value={formData.client_vat}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          client_vat: e.target.value,
                        }))
                      }
                      placeholder="12345678901"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_sdi_code">Codice SDI</Label>
                    <Input
                      id="client_sdi_code"
                      value={formData.client_sdi_code}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          client_sdi_code: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="XXXXXXX"
                      maxLength={7}
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="client_address">Indirizzo</Label>
                <Textarea
                  id="client_address"
                  value={formData.client_address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      client_address: e.target.value,
                    }))
                  }
                  placeholder="Via, CAP, Città, Provincia"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Servizi */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Servizi ({formData.items.length})
                </CardTitle>
                <Dialog
                  open={addServiceDialogOpen}
                  onOpenChange={setAddServiceDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Aggiungi Servizio
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Aggiungi Servizio</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Filtri */}
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Cerca servizi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select
                          value={selectedMacroArea || "__all__"}
                          onValueChange={(v) =>
                            setSelectedMacroArea(v === "__all__" ? null : v)
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Tutte le aree" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all__">
                              Tutte le aree
                            </SelectItem>
                            {macroAreas.map((area) => (
                              <SelectItem key={area.id} value={area.id}>
                                {area.icon} {area.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Lista servizi */}
                      <ScrollArea className="h-[400px]">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {filteredServices.map((service) => {
                            const hasParams =
                              service.pricing_parameters &&
                              service.pricing_parameters.length > 0;
                            const hasVariants =
                              service.variants && service.variants.length > 0;
                            const hasAddons =
                              service.addons && service.addons.length > 0;
                            const needsConfig =
                              hasParams || hasVariants || hasAddons;

                            return (
                              <div
                                key={service.id}
                                className={`border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors ${
                                  needsConfig ? "bg-muted/20" : ""
                                }`}
                                onClick={() => handleAddService(service)}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">
                                        {service.name}
                                      </h4>
                                      {service.is_featured && (
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                      )}
                                      {needsConfig && (
                                        <span title="Richiede configurazione">
                                          <Settings2 className="h-4 w-4 text-blue-500" />
                                        </span>
                                      )}
                                    </div>
                                    {service.short_description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {service.short_description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {
                                          PRICING_TYPE_LABELS[
                                            service.pricing_type
                                          ]
                                        }
                                      </Badge>
                                      {service.is_recurring && (
                                        <RefreshCw className="h-3 w-3 text-blue-500" />
                                      )}
                                      {hasParams && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          <Calculator className="h-3 w-3 mr-1" />
                                          {service.pricing_parameters!.length}{" "}
                                          param
                                        </Badge>
                                      )}
                                      {hasAddons && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          {service.addons.length} add-on
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-lg">
                                      {formatCurrency(service.base_price)}
                                    </p>
                                    {hasParams && (
                                      <p className="text-xs text-muted-foreground">
                                        + parametri
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {/* Varianti (quick select solo se non ci sono parametri) */}
                                {service.variants.length > 0 && !hasParams && (
                                  <div className="flex gap-2 mt-3 pt-3 border-t">
                                    {service.variants.map((variant) => (
                                      <Button
                                        key={variant.id}
                                        size="sm"
                                        variant={
                                          variant.is_default
                                            ? "default"
                                            : "outline"
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddService(service, variant.id);
                                        }}
                                      >
                                        {variant.name}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                                {/* Indicatore configurazione necessaria */}
                                {needsConfig && (
                                  <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                                    <span>Clicca per configurare</span>
                                    <Settings2 className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {formData.items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun servizio aggiunto</p>
                  <p className="text-sm">
                    Clicca &quot;Aggiungi Servizio&quot; per iniziare
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.service_name}</h4>
                          {item.service_description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.service_description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {item.is_recurring && (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  {RECURRING_INTERVAL_LABELS[
                                    item.recurring_interval as keyof typeof RECURRING_INTERVAL_LABELS
                                  ] || "Ricorrente"}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs">
                                  <span className="text-muted-foreground">
                                    ×
                                  </span>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={item.recurring_count || 12}
                                    onChange={(e) => {
                                      const count =
                                        parseInt(e.target.value) || 1;
                                      setFormData((prev) => ({
                                        ...prev,
                                        items: prev.items.map((i) =>
                                          i.id === item.id
                                            ? { ...i, recurring_count: count }
                                            : i
                                        ),
                                      }));
                                    }}
                                    className="w-14 h-6 text-xs text-center px-1"
                                  />
                                  <span className="text-muted-foreground">
                                    {item.recurring_interval === "monthly"
                                      ? "mesi"
                                      : item.recurring_interval === "quarterly"
                                      ? "trim."
                                      : "anni"}
                                  </span>
                                </div>
                              </div>
                            )}
                            {item.configuration?.pricing_parameters &&
                              item.configuration.pricing_parameters.length >
                                0 && (
                                <Badge variant="outline" className="text-xs">
                                  <Calculator className="h-3 w-3 mr-1" />
                                  {
                                    item.configuration.pricing_parameters.length
                                  }{" "}
                                  parametr
                                  {item.configuration.pricing_parameters
                                    .length === 1
                                    ? "o"
                                    : "i"}
                                </Badge>
                              )}
                            {item.addons && item.addons.length > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs text-blue-600 border-blue-200"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                {item.addons.length} add-on
                              </Badge>
                            )}
                            {item.discount_percentage > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs text-green-600 border-green-200 bg-green-50"
                              >
                                <Percent className="h-3 w-3 mr-1" />-
                                {item.discount_percentage}% bundle
                              </Badge>
                            )}
                          </div>

                          {/* Mostra dettagli configurazione */}
                          {item.configuration?.pricing_parameters &&
                            item.configuration.pricing_parameters.length >
                              0 && (
                              <div className="mt-2 p-2 bg-muted/30 rounded text-xs space-y-1">
                                {item.configuration.pricing_parameters
                                  .filter((p) => p.show_in_summary !== false)
                                  .map((param, i) => (
                                    <div
                                      key={i}
                                      className="flex justify-between"
                                    >
                                      <span className="text-muted-foreground">
                                        {param.parameter_name}:
                                      </span>
                                      <span className="font-mono">
                                        {typeof param.value === "boolean"
                                          ? param.value
                                            ? "✓"
                                            : "✗"
                                          : param.value}
                                        {param.calculated_price_impact > 0 && (
                                          <span className="text-green-600 ml-2">
                                            (+
                                            {formatCurrency(
                                              param.calculated_price_impact
                                            )}
                                            )
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            )}

                          {/* Mostra add-ons con dettaglio ricorrenza */}
                          {item.addons && item.addons.length > 0 && (
                            <div className="mt-2 text-xs space-y-1 border-l-2 border-blue-200 pl-2">
                              <p className="text-muted-foreground font-medium">
                                Add-ons:
                              </p>
                              {item.addons.map((addon, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between items-center"
                                >
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <Plus className="h-3 w-3 text-blue-500" />
                                    {addon.addon_name}
                                    {addon.is_recurring &&
                                      addon.recurring_interval && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] px-1 py-0 text-blue-600 border-blue-200"
                                        >
                                          <RefreshCw className="h-2 w-2 mr-0.5" />
                                          {RECURRING_INTERVAL_LABELS[
                                            addon.recurring_interval as keyof typeof RECURRING_INTERVAL_LABELS
                                          ] || addon.recurring_interval}
                                        </Badge>
                                      )}
                                  </span>
                                  <span className="font-mono text-muted-foreground">
                                    {formatCurrency(addon.unit_price)}
                                    {addon.is_recurring &&
                                      addon.recurring_interval && (
                                        <span className="text-blue-600">
                                          /
                                          {RECURRING_INTERVAL_LABELS[
                                            addon.recurring_interval as keyof typeof RECURRING_INTERVAL_LABELS
                                          ]?.toLowerCase() ||
                                            addon.recurring_interval}
                                        </span>
                                      )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReconfigureItem(item)}
                            title="Riconfigura servizio"
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            title="Rimuovi servizio"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="w-24">
                          <Label className="text-xs">Quantità</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                item.id,
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">Prezzo Unitario</Label>
                          <p className="font-mono">
                            {formatCurrency(item.unit_price)}
                            {item.configuration?.total_params_impact &&
                              item.configuration.total_params_impact > 0 && (
                                <span className="text-xs text-green-600 ml-1">
                                  (incl. +
                                  {formatCurrency(
                                    item.configuration.total_params_impact
                                  )}
                                  )
                                </span>
                              )}
                          </p>
                        </div>
                        <div className="text-right">
                          <Label className="text-xs">Totale</Label>
                          <p className="font-bold text-lg">
                            {formatCurrency(item.line_total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totali con breakdown dettagliato */}
              {formData.items.length > 0 && (
                <div className="mt-6 pt-6 border-t space-y-4">
                  {/* Sezione One-Time */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Subtotale Una Tantum</span>
                      <span className="font-mono">
                        {formatCurrency(totals.subtotalOneTime)}
                      </span>
                    </div>
                    {totals.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span>Sconto ({formData.discount_percentage}%)</span>
                        <span className="font-mono">
                          -{formatCurrency(totals.discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>IVA ({formData.tax_percentage}%)</span>
                      <span className="font-mono">
                        {formatCurrency(totals.taxAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Totale Una Tantum</span>
                      <span className="font-mono text-primary">
                        {formatCurrency(totals.grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Sezione Ricorrenti */}
                  {(totals.subtotalRecurringMonthly > 0 ||
                    totals.subtotalRecurringQuarterly > 0 ||
                    totals.subtotalRecurringYearly > 0) && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 space-y-3">
                      <p className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <RefreshCw className="h-4 w-4" />
                        Costi Ricorrenti
                      </p>

                      {/* Dettaglio voci ricorrenti */}
                      {totals.recurringDetails &&
                        totals.recurringDetails.length > 0 && (
                          <div className="space-y-1 text-sm">
                            {totals.recurringDetails.map((item, i) => (
                              <div
                                key={i}
                                className="flex justify-between text-muted-foreground"
                              >
                                <span className="flex items-center gap-1">
                                  {item.isAddon && (
                                    <Plus className="h-3 w-3 text-blue-500" />
                                  )}
                                  {item.name}
                                  {item.isAddon && item.parentService && (
                                    <span className="text-xs opacity-60">
                                      ({item.parentService})
                                    </span>
                                  )}
                                </span>
                                <span className="font-mono">
                                  {formatCurrency(item.amount)}/
                                  {RECURRING_INTERVAL_LABELS[
                                    item.interval
                                  ]?.toLowerCase() || item.interval}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                      <div className="border-t border-blue-200 dark:border-blue-800 pt-2 space-y-1">
                        {totals.subtotalRecurringMonthly > 0 && (
                          <div className="flex justify-between font-medium text-blue-700 dark:text-blue-300">
                            <span>Totale Mensile</span>
                            <span className="font-mono">
                              {formatCurrency(totals.subtotalRecurringMonthly)}
                              /mese
                            </span>
                          </div>
                        )}
                        {totals.subtotalRecurringQuarterly > 0 && (
                          <div className="flex justify-between font-medium text-indigo-700 dark:text-indigo-300">
                            <span>Totale Trimestrale</span>
                            <span className="font-mono">
                              {formatCurrency(
                                totals.subtotalRecurringQuarterly
                              )}
                              /trimestre
                            </span>
                          </div>
                        )}
                        {totals.subtotalRecurringYearly > 0 && (
                          <div className="flex justify-between font-medium text-purple-700 dark:text-purple-300">
                            <span>Totale Annuale</span>
                            <span className="font-mono">
                              {formatCurrency(totals.subtotalRecurringYearly)}
                              /anno
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stima annuale */}
                      {totals.annualRecurring > 0 && (
                        <div className="text-xs text-muted-foreground pt-2 border-t border-blue-200 dark:border-blue-800">
                          Stima costi ricorrenti annuali:{" "}
                          {formatCurrency(totals.annualRecurring)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metriche Commerciali (solo per uso interno) */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3 border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <BarChart3 className="h-4 w-4" />
                      Metriche Commerciali
                      <Badge variant="outline" className="text-[10px] ml-auto">
                        Solo uso interno
                      </Badge>
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Wallet className="h-4 w-4 text-orange-500" />
                          <span className="text-muted-foreground">
                            Budget Costi Variabili (40%)
                          </span>
                        </div>
                        <p className="font-mono font-bold text-orange-600">
                          {formatCurrency(
                            totals.commercialMetrics.budgetCostiVariabili
                          )}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <PiggyBank className="h-4 w-4 text-amber-500" />
                          <span className="text-muted-foreground">
                            Budget Strumenti/Ads (10%)
                          </span>
                        </div>
                        <p className="font-mono font-bold text-amber-600">
                          {formatCurrency(
                            totals.commercialMetrics.budgetStrumentazione
                          )}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calculator className="h-4 w-4 text-gray-500" />
                          <span className="text-muted-foreground">
                            IVA (22%)
                          </span>
                        </div>
                        <p className="font-mono font-bold">
                          {formatCurrency(totals.commercialMetrics.iva)}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">
                            Margine Atteso (50%)
                          </span>
                        </div>
                        <p className="font-mono font-bold text-green-600">
                          {formatCurrency(
                            totals.commercialMetrics.margineAtteso
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Imponibile Totale
                        </span>
                        <span className="font-mono font-semibold">
                          {formatCurrency(
                            totals.commercialMetrics.totalImponibile
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Prezzo Finale al Cliente</span>
                        <span className="font-mono text-primary">
                          {formatCurrency(
                            totals.commercialMetrics.prezzoFinaleCliente
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Servizi Suggeriti */}
          {suggestedServices.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Lightbulb className="h-5 w-5" />
                  Servizi Suggeriti
                </CardTitle>
                <p className="text-sm text-amber-600">
                  Basati sui servizi che hai aggiunto, potresti essere
                  interessato a:
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {suggestedServices.map(({ service, discount, message }) => (
                    <div
                      key={service.id}
                      className="border border-amber-200 rounded-lg p-4 bg-white hover:border-amber-400 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {service.name}
                            {discount > 0 && (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                <Percent className="h-3 w-3 mr-1" />-{discount}%
                              </Badge>
                            )}
                          </h4>
                          {service.short_description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {service.short_description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {discount > 0 ? (
                            <>
                              <p className="text-xs line-through text-muted-foreground">
                                {formatCurrency(service.base_price)}
                              </p>
                              <p className="font-bold text-green-600">
                                {formatCurrency(
                                  service.base_price * (1 - discount / 100)
                                )}
                              </p>
                            </>
                          ) : (
                            <p className="font-bold">
                              {formatCurrency(service.base_price)}
                            </p>
                          )}
                        </div>
                      </div>
                      {message && (
                        <p className="text-xs text-amber-700 mb-3 italic">
                          💡 {message}
                        </p>
                      )}
                      <Button
                        size="sm"
                        className="w-full"
                        variant="outline"
                        onClick={() =>
                          handleAddSuggestedService(service, discount)
                        }
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Aggiungi {discount > 0 ? `con ${discount}% sconto` : ""}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Note */}
          <Card>
            <CardHeader>
              <CardTitle>Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client_notes">Note per il Cliente</Label>
                <Textarea
                  id="client_notes"
                  value={formData.client_notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      client_notes: e.target.value,
                    }))
                  }
                  placeholder="Note visibili al cliente..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Note Interne</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Note interne non visibili al cliente..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonna Laterale */}
        <div className="space-y-6">
          {/* Stato */}
          <Card>
            <CardHeader>
              <CardTitle>Stato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Stato Preventivo</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value as QuoteStatus,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QUOTE_STATUS_LABELS).map(
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
                <Label htmlFor="valid_until">Valido fino al</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      valid_until: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Link Pubblico */}
          {!isNew && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Condividi con il Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista token esistenti */}
                {publicTokens.length > 0 && (
                  <div className="space-y-2">
                    {publicTokens
                      .filter((t) => t.is_active)
                      .map((token) => (
                        <div
                          key={token.id}
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm"
                        >
                          <Link2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs truncate">
                              {window.location.origin}/preventivo/
                              {token.token.slice(0, 8)}...
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {token.has_password && (
                                <span className="flex items-center gap-0.5">
                                  <Lock className="h-3 w-3" /> Protetto
                                </span>
                              )}
                              {token.expires_at && (
                                <span className="flex items-center gap-0.5">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(token.expires_at) < new Date()
                                    ? "Scaduto"
                                    : `Scade ${new Date(
                                        token.expires_at
                                      ).toLocaleDateString("it-IT")}`}
                                </span>
                              )}
                              <span>Viste: {token.usage_count}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => copyTokenUrl(token.token)}
                            >
                              {copiedTokenId === token.id ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                window.open(
                                  `/preventivo/${token.token}`,
                                  "_blank"
                                )
                              }
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => deletePublicToken(token.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Form creazione nuovo token */}
                <Dialog
                  open={showShareDialog}
                  onOpenChange={setShowShareDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Nuovo Link Pubblico
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crea Link Pubblico</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Scadenza (giorni)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="365"
                          value={tokenConfig.expires_in_days}
                          onChange={(e) =>
                            setTokenConfig((prev) => ({
                              ...prev,
                              expires_in_days: parseInt(e.target.value) || 30,
                            }))
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          0 = nessuna scadenza
                        </p>
                      </div>

                      <div>
                        <Label>Password (opzionale)</Label>
                        <Input
                          type="password"
                          placeholder="Lascia vuoto per nessuna password"
                          value={tokenConfig.password}
                          onChange={(e) =>
                            setTokenConfig((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <Label>Note interne (opzionale)</Label>
                        <Input
                          placeholder="es. Link per Mario Rossi"
                          value={tokenConfig.notes}
                          onChange={(e) =>
                            setTokenConfig((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <Button
                        className="w-full"
                        onClick={createPublicToken}
                        disabled={creatingToken}
                      >
                        {creatingToken ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creazione...
                          </>
                        ) : (
                          <>
                            <Link2 className="mr-2 h-4 w-4" />
                            Genera Link
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <p className="text-xs text-muted-foreground">
                  Il cliente vedrà solo le info commerciali, non i dati interni
                  (costi, margini).
                </p>
              </CardContent>
            </Card>
          )}

          {/* Configurazione */}
          <Card>
            <CardHeader>
              <CardTitle>Configurazione</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="discount_percentage">Sconto (%)</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discount_percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount_percentage: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="tax_percentage">IVA (%)</Label>
                <Input
                  id="tax_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.tax_percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tax_percentage: parseFloat(e.target.value) || 22,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="payment_terms">Termini di Pagamento</Label>
                <Textarea
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment_terms: e.target.value,
                    }))
                  }
                  placeholder="es. 50% anticipo, 50% a consegna"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="estimated_delivery">Consegna Stimata</Label>
                <div className="space-y-2">
                  <Input
                    id="estimated_delivery"
                    value={formData.estimated_delivery}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        estimated_delivery: e.target.value,
                      }))
                    }
                    placeholder="es. 6-8 settimane"
                  />
                  {estimatedDays > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      <Clock className="h-4 w-4" />
                      <span>
                        Stima automatica: <strong>{estimatedDays}</strong>{" "}
                        giorni
                        {estimatedDays > 30 && (
                          <span className="ml-1">
                            (~{Math.ceil(estimatedDays / 7)} settimane)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Configurazione Servizio */}
      {serviceToConfig && (
        <ServiceConfigurationDialog
          open={configDialogOpen}
          onOpenChange={(open) => {
            setConfigDialogOpen(open);
            if (!open) {
              setServiceToConfig(null);
              setEditingItemId(null);
            }
          }}
          service={serviceToConfig}
          onConfirm={handleConfigurationConfirm}
          initialValues={
            editingItemId
              ? (() => {
                  const existingItem = formData.items.find(
                    (i) => i.id === editingItemId
                  );
                  if (!existingItem) return undefined;
                  return {
                    variant_id: existingItem.variant_id,
                    quantity: existingItem.quantity,
                    selectedAddons: existingItem.addons.map((a) => a.addon_id),
                    parameterValues:
                      existingItem.configuration?.pricing_parameters?.reduce(
                        (acc, p) => ({ ...acc, [p.id]: p.value }),
                        {}
                      ) || {},
                  };
                })()
              : undefined
          }
        />
      )}

      {/* Dialog Selezione Cliente */}
      <QuoteClientSelector
        open={showClientSelector}
        onOpenChange={setShowClientSelector}
        initialType={clientType || "persona_giuridica"}
        onSelect={(client) => {
          setClientType(client.type);
          setSelectedClientName(client.name);
          setFormData((prev) => ({
            ...prev,
            persona_fisica_id:
              client.type === "persona_fisica" ? client.id : null,
            persona_giuridica_id:
              client.type === "persona_giuridica" ? client.id : null,
            client_name: client.name,
            client_email: client.email,
            client_phone: client.phone,
            client_company: client.company,
            client_address: client.address,
            client_vat: client.vat,
            client_fiscal_code: client.fiscalCode,
            client_sdi_code: client.sdiCode,
            // Reset referente quando si cambia cliente
            referente_name: "",
            referente_role: "",
          }));
        }}
      />

      {/* Dialog Selezione Referente */}
      <QuoteReferenteSelector
        open={showReferenteSelector}
        onOpenChange={setShowReferenteSelector}
        personaGiuridicaId={formData.persona_giuridica_id}
        personaGiuridicaNome={formData.client_company || formData.client_name}
        onSelect={(referente) => {
          setFormData((prev) => ({
            ...prev,
            referente_name: referente.name,
            referente_role: referente.role,
          }));
        }}
      />
    </div>
  );
}
