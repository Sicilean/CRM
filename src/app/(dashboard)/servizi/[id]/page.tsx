"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Service,
  ServiceVariant,
  ServiceAddon,
  ServiceDependency,
  MacroArea,
  PRICING_TYPE_LABELS,
  RECURRING_INTERVAL_LABELS,
  TIME_UNIT_LABELS,
  DEPENDENCY_TYPE_LABELS,
  DEPENDENCY_TYPE_COLORS,
} from "@/types/quotes.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Loader2,
  Star,
  RefreshCw,
  Clock,
  Package,
  Link2,
  Layers,
  Plus,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface ServiceWithRelations extends Service {
  macro_area: MacroArea | null;
  variants: ServiceVariant[];
  addons: ServiceAddon[];
}

interface DependencyWithService
  extends Omit<ServiceDependency, "depends_on_service"> {
  depends_on_service: { id: string; name: string; slug: string } | null;
}

export default function ServizioDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [servizio, setServizio] = useState<ServiceWithRelations | null>(null);
  const [dependencies, setDependencies] = useState<DependencyWithService[]>([]);

  const loadServizio = useCallback(async () => {
    // Carica servizio con macro_area
    const { data, error } = await (supabase as any)
      .from("services")
      .select("*, macro_area:macro_areas(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Errore caricamento servizio:", error);
      router.push("/servizi");
      return;
    }

    // Carica varianti
    const { data: variantsData } = await (supabase as any)
      .from("service_variants")
      .select("*")
      .eq("service_id", id)
      .order("sort_order", { ascending: true });

    // Carica addon
    const { data: addonsData } = await (supabase as any)
      .from("service_addons")
      .select("*")
      .eq("service_id", id)
      .order("sort_order", { ascending: true });

    // Carica dipendenze
    const { data: depsData } = await (supabase as any)
      .from("service_dependencies")
      .select(
        "*, depends_on_service:services!service_dependencies_depends_on_service_id_fkey(id, name, slug)"
      )
      .eq("service_id", id);

    setServizio({
      ...data,
      variants: variantsData || [],
      addons: addonsData || [],
    } as ServiceWithRelations);
    setDependencies((depsData || []) as DependencyWithService[]);
    setLoading(false);
  }, [supabase, id, router]);

  useEffect(() => {
    loadServizio();
  }, [loadServizio]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!servizio) {
    return null;
  }

  const formatPrice = (service: Service) => {
    switch (service.pricing_type) {
      case "fixed":
        return `€ ${service.base_price.toFixed(2)}`;
      case "range":
        return `€ ${service.base_price.toFixed(0)} - € ${
          service.max_price?.toFixed(0) || "?"
        }`;
      case "recurring":
        return `€ ${service.base_price.toFixed(2)}/${
          RECURRING_INTERVAL_LABELS[service.recurring_interval!] || "periodo"
        }`;
      case "time_based":
        return `€ ${service.base_price.toFixed(2)}/${
          TIME_UNIT_LABELS[service.time_unit!] || "unità"
        }`;
      case "tiered":
        return `Da € ${service.base_price.toFixed(2)}`;
      case "composite":
        return `Da € ${service.base_price.toFixed(2)}`;
      default:
        return `€ ${service.base_price.toFixed(2)}`;
    }
  };

  const requiredDeps = dependencies.filter(
    (d) => d.dependency_type === "required"
  );
  const suggestedDeps = dependencies.filter(
    (d) => d.dependency_type === "suggested"
  );
  const conflictDeps = dependencies.filter(
    (d) => d.dependency_type === "conflicts_with"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/servizi">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{servizio.name}</h1>
              {servizio.is_featured && (
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Slug:{" "}
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {servizio.slug}
              </code>
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/servizi/${servizio.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonna Principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informazioni Base */}
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Generali</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Macro-Area
                  </label>
                  <div className="mt-1">
                    {servizio.macro_area ? (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: servizio.macro_area.color || "#ccc",
                          color: servizio.macro_area.color || "#666",
                        }}
                      >
                        {servizio.macro_area.icon && (
                          <span className="mr-1">
                            {servizio.macro_area.icon}
                          </span>
                        )}
                        {servizio.macro_area.name}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Non assegnata
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tipo Pricing
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="default">
                      {PRICING_TYPE_LABELS[servizio.pricing_type]}
                    </Badge>
                    {servizio.is_recurring && (
                      <RefreshCw className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>

              {servizio.short_description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Descrizione Breve
                  </label>
                  <p className="mt-1 text-sm">{servizio.short_description}</p>
                </div>
              )}

              {servizio.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Descrizione Completa
                  </label>
                  <p className="mt-1 text-sm whitespace-pre-line">
                    {servizio.description}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Prezzo
                  </label>
                  <p className="mt-1 text-2xl font-bold">
                    {formatPrice(servizio)}
                  </p>
                  {servizio.setup_fee && servizio.setup_fee > 0 && (
                    <p className="text-sm text-muted-foreground">
                      + € {servizio.setup_fee.toFixed(2)} setup
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tempo Consegna
                  </label>
                  <p className="mt-1 text-sm">
                    {servizio.estimated_delivery_days ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {servizio.estimated_delivery_days}{" "}
                        {servizio.delivery_unit || "giorni"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Quantità
                  </label>
                  <p className="mt-1 text-sm">
                    {servizio.requires_quantity_input ? (
                      <span>
                        Min: {servizio.min_quantity} | Max:{" "}
                        {servizio.max_quantity || "∞"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Non richiesta
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Tiers (se tiered) */}
          {servizio.pricing_type === "tiered" &&
            servizio.pricing_tiers &&
            servizio.pricing_tiers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Scaglioni di Prezzo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {servizio.pricing_tiers.map((tier, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-sm">
                          Da {tier.min} a {tier.max === 9999 ? "∞" : tier.max}{" "}
                          unità
                        </span>
                        <span className="font-mono font-bold">
                          € {tier.price_per_unit.toFixed(2)}/unità
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Varianti */}
          {servizio.variants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Varianti ({servizio.variants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {servizio.variants.map((variant) => (
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
                      <p className="text-xl font-bold">
                        € {variant.price_modifier_value.toFixed(2)}
                      </p>
                      {variant.features && variant.features.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {(variant.features as string[]).map(
                            (feature, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-muted-foreground flex items-center gap-1"
                              >
                                <span className="text-green-500">✓</span>{" "}
                                {feature}
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add-ons */}
          {servizio.addons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add-ons ({servizio.addons.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {servizio.addons.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{addon.name}</h4>
                        {addon.description && (
                          <p className="text-xs text-muted-foreground">
                            {addon.description}
                          </p>
                        )}
                      </div>
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dipendenze */}
          {dependencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Dipendenze e Relazioni ({dependencies.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Required */}
                {requiredDeps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-600 mb-2">
                      🔒 Obbligatori
                    </h4>
                    <div className="space-y-2">
                      {requiredDeps.map((dep) => (
                        <div
                          key={dep.id}
                          className={`p-3 rounded-lg border ${DEPENDENCY_TYPE_COLORS.required}`}
                        >
                          <div className="flex justify-between items-center">
                            <Link
                              href={`/servizi/${dep.depends_on_service?.id}`}
                              className="font-medium hover:underline"
                            >
                              {dep.depends_on_service?.name}
                            </Link>
                            {dep.auto_add && (
                              <Badge variant="outline">Auto-add</Badge>
                            )}
                          </div>
                          {dep.message && (
                            <p className="text-xs mt-1">{dep.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested */}
                {suggestedDeps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-blue-600 mb-2">
                      💡 Suggeriti
                    </h4>
                    <div className="space-y-2">
                      {suggestedDeps.map((dep) => (
                        <div
                          key={dep.id}
                          className={`p-3 rounded-lg border ${DEPENDENCY_TYPE_COLORS.suggested}`}
                        >
                          <div className="flex justify-between items-center">
                            <Link
                              href={`/servizi/${dep.depends_on_service?.id}`}
                              className="font-medium hover:underline"
                            >
                              {dep.depends_on_service?.name}
                            </Link>
                            {dep.discount_percentage > 0 && (
                              <Badge variant="secondary">
                                -{dep.discount_percentage}% sconto
                              </Badge>
                            )}
                          </div>
                          {dep.message && (
                            <p className="text-xs mt-1">{dep.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conflicts */}
                {conflictDeps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-orange-600 mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Incompatibili
                    </h4>
                    <div className="space-y-2">
                      {conflictDeps.map((dep) => (
                        <div
                          key={dep.id}
                          className={`p-3 rounded-lg border ${DEPENDENCY_TYPE_COLORS.conflicts_with}`}
                        >
                          <Link
                            href={`/servizi/${dep.depends_on_service?.id}`}
                            className="font-medium hover:underline"
                          >
                            {dep.depends_on_service?.name}
                          </Link>
                          {dep.message && (
                            <p className="text-xs mt-1">{dep.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonna Laterale */}
        <div className="space-y-6">
          {/* Stato */}
          <Card>
            <CardHeader>
              <CardTitle>Stato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Stato Attuale
                </label>
                <div className="mt-1">
                  <Badge variant={servizio.is_active ? "default" : "secondary"}>
                    {servizio.is_active ? "Attivo" : "Disattivato"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  In Evidenza
                </label>
                <div className="mt-1">
                  {servizio.is_featured ? (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Star className="h-4 w-4 fill-yellow-600" /> Sì
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ricorrente
                </label>
                <div className="mt-1">
                  {servizio.is_recurring ? (
                    <span className="flex items-center gap-1 text-blue-600">
                      <RefreshCw className="h-4 w-4" /> Sì
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {servizio.tags && servizio.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {servizio.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {servizio.created_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Creato il
                  </label>
                  <p className="mt-1 text-sm">
                    {new Date(servizio.created_at).toLocaleDateString("it-IT")}
                  </p>
                </div>
              )}
              {servizio.updated_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ultimo aggiornamento
                  </label>
                  <p className="mt-1 text-sm">
                    {new Date(servizio.updated_at).toLocaleDateString("it-IT")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
