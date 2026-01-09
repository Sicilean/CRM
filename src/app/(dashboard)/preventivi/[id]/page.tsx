"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Quote,
  QuoteItem,
  QuoteItemAddon,
  QuoteModifierApplied,
  QuoteBundleApplied,
  QuotePublicToken,
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_COLORS,
  RECURRING_INTERVAL_LABELS,
  calculateCommercialMetrics,
} from "@/types/quotes.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Loader2,
  FileText,
  RefreshCw,
  Calendar,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Share2,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Lock,
  BarChart3,
  Wallet,
  PiggyBank,
  TrendingUp,
  Calculator,
} from "lucide-react";
import Link from "next/link";

interface QuoteWithItems extends Quote {
  items: (QuoteItem & { addons: QuoteItemAddon[] })[];
  modifiers_applied: QuoteModifierApplied[];
  bundles_applied: QuoteBundleApplied[];
}

export default function PreventivoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [preventivo, setPreventivo] = useState<QuoteWithItems | null>(null);
  const [publicTokens, setPublicTokens] = useState<
    (QuotePublicToken & { has_password?: boolean })[]
  >([]);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  const loadPreventivo = useCallback(async () => {
    // Carica preventivo
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

    // Carica items con addons
    const { data: itemsData } = await (supabase as any)
      .from("quote_items")
      .select("*")
      .eq("quote_id", id)
      .order("sort_order", { ascending: true });

    const items = itemsData || [];

    // Carica addons per ogni item
    for (const item of items) {
      const { data: addonsData } = await (supabase as any)
        .from("quote_item_addons")
        .select("*")
        .eq("quote_item_id", item.id);

      (item as any).addons = addonsData || [];
    }

    // Carica modificatori applicati
    const { data: modifiersData } = await (supabase as any)
      .from("quote_modifiers_applied")
      .select("*")
      .eq("quote_id", id);

    // Carica bundle applicati
    const { data: bundlesData } = await (supabase as any)
      .from("quote_bundles_applied")
      .select("*")
      .eq("quote_id", id);

    setPreventivo({
      ...data,
      items: items as any,
      modifiers_applied: modifiersData || [],
      bundles_applied: bundlesData || [],
    });
    setLoading(false);
  }, [supabase, id, router]);

  useEffect(() => {
    loadPreventivo();
  }, [loadPreventivo]);

  // Carica token pubblici
  useEffect(() => {
    const loadPublicTokens = async () => {
      try {
        const res = await fetch(`/api/quotes/${id}/public-token`);
        const data = await res.json();
        if (data.tokens) {
          setPublicTokens(data.tokens);
        }
      } catch (error) {
        console.error("Errore caricamento token:", error);
      }
    };
    loadPublicTokens();
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!preventivo) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const isExpired =
    preventivo.valid_until && new Date(preventivo.valid_until) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/preventivi">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">
                Preventivo {preventivo.quote_number}
              </h1>
              {preventivo.version > 1 && (
                <Badge variant="outline">v{preventivo.version}</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Cliente: {preventivo.client_name}
              {preventivo.client_company && ` - ${preventivo.client_company}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Scarica PDF
          </Button>
          <Button asChild>
            <Link href={`/preventivi/${preventivo.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifica
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonna Principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informazioni Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {preventivo.client_company ? (
                  <Building2 className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
                Informazioni Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nome
                  </label>
                  <p className="mt-1 font-medium">{preventivo.client_name}</p>
                </div>
                {preventivo.client_company && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Azienda
                    </label>
                    <p className="mt-1">{preventivo.client_company}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </label>
                  <p className="mt-1">{preventivo.client_email}</p>
                </div>
                {preventivo.client_phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Telefono
                    </label>
                    <p className="mt-1">{preventivo.client_phone}</p>
                  </div>
                )}
              </div>
              {preventivo.client_address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Indirizzo
                  </label>
                  <p className="mt-1 text-sm">{preventivo.client_address}</p>
                </div>
              )}
              {(preventivo.client_vat || preventivo.client_fiscal_code) && (
                <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
                  {preventivo.client_vat && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        P.IVA
                      </label>
                      <p className="mt-1 font-mono text-sm">
                        {preventivo.client_vat}
                      </p>
                    </div>
                  )}
                  {preventivo.client_fiscal_code && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Codice Fiscale
                      </label>
                      <p className="mt-1 font-mono text-sm">
                        {preventivo.client_fiscal_code}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Servizi */}
          <Card>
            <CardHeader>
              <CardTitle>Servizi Inclusi ({preventivo.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {preventivo.items.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Nessun servizio aggiunto
                </p>
              ) : (
                <div className="space-y-4">
                  {preventivo.items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {item.custom_name || item.service_name}
                          </h4>
                          {item.service_description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {item.custom_description ||
                                item.service_description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {item.is_recurring && (
                              <Badge variant="secondary" className="text-xs">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                {RECURRING_INTERVAL_LABELS[
                                  item.recurring_interval!
                                ] || "Ricorrente"}
                              </Badge>
                            )}
                            {item.discount_percentage > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs text-green-600"
                              >
                                -{item.discount_percentage}% sconto
                              </Badge>
                            )}
                          </div>

                          {/* Add-ons */}
                          {item.addons && item.addons.length > 0 && (
                            <div className="mt-3 pl-4 border-l-2 border-primary/20">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Add-ons:
                              </p>
                              {item.addons.map((addon) => (
                                <div
                                  key={addon.id}
                                  className="flex justify-between text-sm"
                                >
                                  <span>+ {addon.addon_name}</span>
                                  <span className="font-mono">
                                    {formatCurrency(addon.line_total)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {formatCurrency(item.unit_price)}
                          </p>
                          <p className="text-lg font-bold">
                            {formatCurrency(item.line_total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totali */}
              {preventivo.items.length > 0 && (
                <div className="mt-6 pt-6 border-t space-y-2">
                  {/* One-time */}
                  <div className="flex justify-between text-sm">
                    <span>Subtotale One-Time</span>
                    <span className="font-mono">
                      {formatCurrency(preventivo.subtotal_one_time)}
                    </span>
                  </div>

                  {/* Ricorrenti */}
                  {preventivo.subtotal_recurring_monthly > 0 && (
                    <div className="flex justify-between text-sm text-blue-600">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" /> Ricorrente Mensile
                      </span>
                      <span className="font-mono">
                        {formatCurrency(preventivo.subtotal_recurring_monthly)}
                        /mese
                      </span>
                    </div>
                  )}
                  {preventivo.subtotal_recurring_yearly > 0 && (
                    <div className="flex justify-between text-sm text-purple-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Ricorrente Annuale
                      </span>
                      <span className="font-mono">
                        {formatCurrency(preventivo.subtotal_recurring_yearly)}
                        /anno
                      </span>
                    </div>
                  )}

                  {/* Bundle applicati */}
                  {preventivo.bundles_applied.length > 0 && (
                    <div className="pt-2">
                      {preventivo.bundles_applied.map((bundle) => (
                        <div
                          key={bundle.id}
                          className="flex justify-between text-sm text-green-600"
                        >
                          <span>Bundle: {bundle.bundle_name}</span>
                          <span className="font-mono">
                            -{formatCurrency(bundle.discount_amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Modificatori */}
                  {preventivo.modifiers_applied.length > 0 && (
                    <div className="pt-2">
                      {preventivo.modifiers_applied.map((mod) => (
                        <div
                          key={mod.id}
                          className={`flex justify-between text-sm ${
                            mod.calculated_amount >= 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          <span>{mod.modifier_name}</span>
                          <span className="font-mono">
                            {mod.calculated_amount >= 0 ? "+" : ""}
                            {formatCurrency(mod.calculated_amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sconto */}
                  {preventivo.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Sconto ({preventivo.discount_percentage}%)</span>
                      <span className="font-mono">
                        -{formatCurrency(preventivo.discount_amount)}
                      </span>
                    </div>
                  )}

                  {/* IVA */}
                  <div className="flex justify-between text-sm">
                    <span>IVA ({preventivo.tax_percentage}%)</span>
                    <span className="font-mono">
                      {formatCurrency(preventivo.tax_amount)}
                    </span>
                  </div>

                  {/* Totale */}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Totale One-Time</span>
                    <span className="font-mono">
                      {formatCurrency(preventivo.total_one_time)}
                    </span>
                  </div>

                  {(preventivo.total_recurring_monthly > 0 ||
                    preventivo.total_recurring_yearly > 0) && (
                    <>
                      {preventivo.total_recurring_monthly > 0 && (
                        <div className="flex justify-between font-medium text-blue-600">
                          <span>+ Canone Mensile</span>
                          <span className="font-mono">
                            {formatCurrency(preventivo.total_recurring_monthly)}
                            /mese
                          </span>
                        </div>
                      )}
                      {preventivo.total_recurring_yearly > 0 && (
                        <div className="flex justify-between font-medium text-purple-600">
                          <span>+ Canone Annuale</span>
                          <span className="font-mono">
                            {formatCurrency(preventivo.total_recurring_yearly)}
                            /anno
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metriche Commerciali */}
          <Card className="border border-dashed border-gray-300 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <BarChart3 className="h-5 w-5" />
                Metriche Commerciali
                <Badge variant="outline" className="text-[10px] ml-auto">
                  Solo uso interno
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const metrics = calculateCommercialMetrics(
                  preventivo.subtotal_one_time - preventivo.discount_amount
                );
                return (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Wallet className="h-4 w-4 text-orange-500" />
                        <span className="text-muted-foreground">
                          Budget Costi Variabili (40%)
                        </span>
                      </div>
                      <p className="font-mono font-bold text-lg text-orange-600">
                        {formatCurrency(metrics.budgetCostiVariabili)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <PiggyBank className="h-4 w-4 text-amber-500" />
                        <span className="text-muted-foreground">
                          Budget Strumenti/Ads (10%)
                        </span>
                      </div>
                      <p className="font-mono font-bold text-lg text-amber-600">
                        {formatCurrency(metrics.budgetStrumentazione)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calculator className="h-4 w-4 text-gray-500" />
                        <span className="text-muted-foreground">IVA (22%)</span>
                      </div>
                      <p className="font-mono font-bold text-lg">
                        {formatCurrency(metrics.iva)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">
                          Margine Atteso (50%)
                        </span>
                      </div>
                      <p className="font-mono font-bold text-lg text-green-600">
                        {formatCurrency(metrics.margineAtteso)}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="text-muted-foreground">
                  Prezzo Finale al Cliente
                </span>
                <span className="font-mono font-bold text-xl text-primary">
                  {formatCurrency(
                    calculateCommercialMetrics(
                      preventivo.subtotal_one_time - preventivo.discount_amount
                    ).prezzoFinaleCliente
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          {(preventivo.notes || preventivo.client_notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {preventivo.client_notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Note per il Cliente
                    </label>
                    <p className="mt-1 text-sm whitespace-pre-wrap">
                      {preventivo.client_notes}
                    </p>
                  </div>
                )}
                {preventivo.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Note Interne
                    </label>
                    <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                      {preventivo.notes}
                    </p>
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
                  <Badge className={QUOTE_STATUS_COLORS[preventivo.status]}>
                    {QUOTE_STATUS_LABELS[preventivo.status]}
                  </Badge>
                  {isExpired && preventivo.status === "sent" && (
                    <Badge variant="destructive" className="ml-2">
                      Scaduto
                    </Badge>
                  )}
                </div>
              </div>
              {preventivo.valid_until && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Valido fino al
                  </label>
                  <p className="mt-1 text-sm">
                    {new Date(preventivo.valid_until).toLocaleDateString(
                      "it-IT"
                    )}
                  </p>
                </div>
              )}
              {preventivo.payment_terms && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Termini di Pagamento
                  </label>
                  <p className="mt-1 text-sm">{preventivo.payment_terms}</p>
                </div>
              )}
              {preventivo.estimated_delivery && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Consegna Stimata
                  </label>
                  <p className="mt-1 text-sm">
                    {preventivo.estimated_delivery}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Link Pubblici */}
          {publicTokens.filter((t) => t.is_active).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Link Pubblici
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
                          /preventivo/{token.token.slice(0, 8)}...
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {token.has_password && (
                            <span className="flex items-center gap-0.5">
                              <Lock className="h-3 w-3" /> Protetto
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
                            window.open(`/preventivo/${token.token}`, "_blank")
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
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Creato il
                </label>
                <p className="mt-1 text-sm">
                  {new Date(preventivo.created_at).toLocaleDateString("it-IT")}
                </p>
              </div>
              {preventivo.sent_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Inviato il
                  </label>
                  <p className="mt-1 text-sm">
                    {new Date(preventivo.sent_at).toLocaleDateString("it-IT")}
                  </p>
                </div>
              )}
              {preventivo.accepted_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Accettato il
                  </label>
                  <p className="mt-1 text-sm">
                    {new Date(preventivo.accepted_at).toLocaleDateString(
                      "it-IT"
                    )}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ultimo Aggiornamento
                </label>
                <p className="mt-1 text-sm">
                  {new Date(preventivo.updated_at).toLocaleDateString("it-IT")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
