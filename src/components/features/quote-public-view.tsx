"use client";

import { useState, useEffect, useCallback } from "react";
/* eslint-disable @next/next/no-img-element */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  QUOTE_STATUS_LABELS,
  RECURRING_INTERVAL_LABELS,
  RecurringInterval,
} from "@/types/quotes.types";
import {
  Loader2,
  Lock,
  AlertCircle,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  Calendar,
  CalendarDays,
  RefreshCw,
  Clock,
  FileText,
  Euro,
  Plus,
  Percent,
  Target,
  ListChecks,
  Receipt,
  Info,
  MapPin,
  Globe,
  User,
  Pen,
} from "lucide-react";

interface QuotePublicViewProps {
  token: string;
}

interface QuoteAddon {
  id: string;
  addon_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  is_recurring: boolean;
  recurring_interval: RecurringInterval | null;
  recurring_count: number | null;
}

interface QuoteItem {
  id: string;
  service_name: string;
  service_description: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  is_recurring: boolean;
  recurring_interval: RecurringInterval | null;
  recurring_count: number | null;
  setup_fee: number;
  discount_percentage: number;
  discount_amount: number;
  custom_name: string | null;
  custom_description: string | null;
  configuration: any;
  addons: QuoteAddon[];
}

interface BillingScheduleItem {
  date: Date;
  label: string;
  items: {
    name: string;
    amount: number;
    type: "one_time" | "recurring";
  }[];
  subtotal: number;
  vat: number;
  total: number;
}

interface PublicQuote {
  id: string;
  quote_number: string;
  version: number;
  client_name: string;
  client_company: string | null;
  client_email: string;
  client_phone: string | null;
  client_address: string | null;
  client_vat: string | null;
  client_fiscal_code: string | null;
  client_sdi_code: string | null;
  referente_name: string | null;
  referente_role: string | null;
  subtotal_one_time: number;
  subtotal_recurring_monthly: number;
  subtotal_recurring_yearly: number;
  discount_amount: number;
  discount_percentage: number;
  tax_percentage: number;
  tax_amount: number;
  total_one_time: number;
  total_recurring_monthly: number;
  total_recurring_yearly: number;
  grand_total: number;
  status: string;
  valid_until: string | null;
  client_notes: string | null;
  terms_and_conditions: string | null;
  payment_terms: string | null;
  estimated_delivery: string | null;
  project_name: string | null;
  vision_summary: string | null;
  objectives: string | null;
  timeline: any[] | null;
  created_at: string;
  updated_at: string;
  items: QuoteItem[];
  bundles_applied: {
    id: string;
    bundle_name: string;
    discount_amount: number;
  }[];
}

interface CompanyInfo {
  company_name: string;
  legal_name: string | null;
  vat_number: string | null;
  fiscal_code: string | null;
  sdi_code: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  province: string | null;
  phone: string | null;
  email: string | null;
  pec: string | null;
  website: string | null;
  footer_text: string | null;
}

interface QuoteTerm {
  id: string;
  name: string;
  content: string;
}

interface BankAccount {
  account_name: string;
  iban: string | null;
  swift: string | null;
  bank_name: string | null;
}

export function QuotePublicView({ token }: QuotePublicViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [settings, setSettings] = useState<{
    company: CompanyInfo | null;
    terms: QuoteTerm[];
    bankAccount: BankAccount | null;
  } | null>(null);

  // Carica impostazioni
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/quotes/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error("Errore caricamento settings:", e);
    }
  }, []);

  const validateToken = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/quotes/public/${token}`);
      const data = await res.json();

      if (!data.valid) {
        setError(data.error || "Link non valido");
        return;
      }

      if (data.requires_password) {
        setRequiresPassword(true);
        return;
      }

      setQuote(data.quote);
    } catch (e) {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handlePasswordSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/quotes/public/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!data.valid) {
        setError(data.error || "Password non corretta");
        return;
      }

      setQuote(data.quote);
      setRequiresPassword(false);
    } catch (e) {
      setError("Errore di connessione");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    validateToken();
    loadSettings();
  }, [validateToken, loadSettings]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getRecurringLabel = (interval: RecurringInterval) => {
    return RECURRING_INTERVAL_LABELS[interval] || interval;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Caricamento offerta...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Impossibile accedere all&apos;offerta
            </h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password required state
  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Offerta Protetta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Inserisci la password per visualizzare l&apos;offerta
            </p>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                placeholder="Inserisci la password"
              />
            </div>
            <Button
              onClick={handlePasswordSubmit}
              disabled={submitting || !password}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifica...
                </>
              ) : (
                "Accedi"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quote) return null;

  const isExpired =
    quote.valid_until && new Date(quote.valid_until) < new Date();
  const taxRate = quote.tax_percentage / 100;
  const company = settings?.company;

  // Calcola breakdown ricorrenti
  const recurringItems: {
    name: string;
    amount: number;
    interval: string;
    isAddon: boolean;
    count: number | null;
  }[] = [];

  quote.items.forEach((item) => {
    if (item.is_recurring && item.recurring_interval) {
      recurringItems.push({
        name: item.custom_name || item.service_name,
        amount: item.line_total - item.discount_amount,
        interval: item.recurring_interval,
        isAddon: false,
        count: item.recurring_count,
      });
    }

    item.addons.forEach((addon) => {
      if (addon.is_recurring && addon.recurring_interval) {
        recurringItems.push({
          name: `${addon.addon_name} (${
            item.custom_name || item.service_name
          })`,
          amount: addon.line_total,
          interval: addon.recurring_interval,
          isAddon: true,
          count: addon.recurring_count,
        });
      }
    });
  });

  // Genera calendario di fatturazione
  const generateBillingSchedule = (): BillingScheduleItem[] => {
    const schedule: BillingScheduleItem[] = [];
    const startDate = new Date();

    // Costi una tantum
    const oneTimeItems: { name: string; amount: number }[] = [];
    quote.items.forEach((item) => {
      if (!item.is_recurring) {
        oneTimeItems.push({
          name: item.custom_name || item.service_name,
          amount: item.line_total - item.discount_amount,
        });
      }
      if (item.setup_fee > 0) {
        oneTimeItems.push({
          name: `Setup: ${item.custom_name || item.service_name}`,
          amount: item.setup_fee,
        });
      }
    });

    // Primo pagamento
    if (oneTimeItems.length > 0) {
      const subtotal = oneTimeItems.reduce((sum, i) => sum + i.amount, 0);
      const vat = subtotal * taxRate;
      schedule.push({
        date: new Date(startDate),
        label: "Pagamento iniziale (alla firma)",
        items: oneTimeItems.map((i) => ({
          name: i.name,
          amount: i.amount,
          type: "one_time" as const,
        })),
        subtotal,
        vat,
        total: subtotal + vat,
      });
    }

    // Pagamenti ricorrenti
    const maxRecurrences = Math.max(
      ...recurringItems.map((r) => r.count || 12),
      1
    );

    for (let i = 0; i < maxRecurrences; i++) {
      const paymentItems: {
        name: string;
        amount: number;
        type: "recurring";
      }[] = [];

      recurringItems.forEach((recItem) => {
        const count = recItem.count || 12;
        if (i >= count) return;

        paymentItems.push({
          name: recItem.name,
          amount: recItem.amount,
          type: "recurring",
        });
      });

      if (paymentItems.length > 0) {
        const paymentDate = new Date(startDate);
        const primaryInterval = recurringItems[0]?.interval || "monthly";

        if (primaryInterval === "monthly") {
          paymentDate.setMonth(paymentDate.getMonth() + i + 1);
        } else if (primaryInterval === "quarterly") {
          paymentDate.setMonth(paymentDate.getMonth() + (i + 1) * 3);
        } else if (primaryInterval === "yearly") {
          paymentDate.setFullYear(paymentDate.getFullYear() + i + 1);
        }

        const subtotal = paymentItems.reduce(
          (sum, item) => sum + item.amount,
          0
        );
        const vat = subtotal * taxRate;

        schedule.push({
          date: paymentDate,
          label: `Pagamento #${i + 1}`,
          items: paymentItems,
          subtotal,
          vat,
          total: subtotal + vat,
        });
      }
    }

    return schedule;
  };

  const billingSchedule = generateBillingSchedule();
  const totalContractValue = billingSchedule.reduce(
    (sum, p) => sum + p.total,
    0
  );

  return (
    <>
      {/* Stili per la stampa - molto aggressivi per garantire un PDF pulito */}
      <style jsx global>{`
        @media print {
          /* Reset pagina */
          @page {
            size: A4 portrait;
            margin: 12mm 12mm 15mm 12mm;
          }

          /* Reset body e html */
          html,
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            background: white !important;
            color: black !important;
            font-size: 9pt !important;
            line-height: 1.4 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Nascondi TUTTO ciò che non serve */
          /* React Query Devtools, toast, modali, overlay, etc. */
          [data-rq-devtools],
          [class*="ReactQueryDevtools"],
          [class*="devtools"],
          [class*="Toaster"],
          [class*="toast"],
          [role="dialog"],
          [role="alertdialog"],
          [data-radix-portal],
          [data-radix-popper-content-wrapper],
          .fixed,
          .sticky,
          nav,
          header:not(.print-header),
          footer:not(.print-footer),
          aside,
          .no-print,
          button,
          [type="button"],
          .cursor-pointer,
          iframe,
          script,
          noscript {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            left: -9999px !important;
          }

          /* Container principale - occupa tutto lo spazio */
          .print-document {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }

          /* Card senza ombre e bordi leggeri */
          .print-document [class*="Card"],
          .print-document .print-card {
            border: 1px solid #e0e0e0 !important;
            border-radius: 4px !important;
            box-shadow: none !important;
            background: white !important;
            margin-bottom: 8mm !important;
            page-break-inside: avoid;
          }

          /* Assicura che il contenuto sia visibile */
          .print-document * {
            visibility: visible !important;
            color: inherit !important;
          }

          /* Gestione page breaks */
          .print-break-before {
            page-break-before: always !important;
            break-before: page !important;
          }

          .print-break-after {
            page-break-after: always !important;
            break-after: page !important;
          }

          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Typography per stampa */
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            color: black !important;
            page-break-after: avoid !important;
          }

          p,
          li,
          td,
          th {
            orphans: 3;
            widows: 3;
          }

          /* Tabelle */
          table {
            border-collapse: collapse !important;
          }

          th,
          td {
            border: 1px solid #ddd !important;
            padding: 4px 8px !important;
          }

          /* Link - mostra solo testo */
          a {
            color: black !important;
            text-decoration: none !important;
          }

          /* Badge e tag */
          .print-document [class*="Badge"],
          .print-document [class*="badge"] {
            border: 1px solid #999 !important;
            background: #f5f5f5 !important;
            color: #333 !important;
            padding: 1px 4px !important;
            font-size: 7pt !important;
          }

          /* Separatori */
          hr,
          [class*="Separator"] {
            border: none !important;
            border-top: 1px solid #ddd !important;
            margin: 4mm 0 !important;
          }

          /* Alert e info box */
          [class*="Alert"] {
            border: 1px solid #ccc !important;
            background: #fafafa !important;
            padding: 8px !important;
          }

          /* Flex e grid funzionano in stampa */
          .flex {
            display: flex !important;
          }

          .grid {
            display: grid !important;
          }

          /* Nascondi elementi interattivi nel documento */
          .print-document input,
          .print-document select,
          .print-document textarea {
            display: none !important;
          }

          /* Footer fisso */
          .print-page-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 7pt;
            color: #666;
            border-top: 1px solid #ddd;
            padding: 2mm 0;
            background: white;
          }
        }
      `}</style>

      <div className="min-h-screen print:bg-white print-document">
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 print:max-w-none print:py-0 print:px-0 print:space-y-4">
          {/* Header con Logo e Info Azienda/Cliente */}
          <div className="print-header print-avoid-break">
            <div className="flex justify-between items-start gap-6 mb-6">
              {/* Logo e Info Azienda */}
              <div className="flex-1">
                <div className="mb-4">
                  <img
                    src="/LogoFont_Sicilean_Black.svg"
                    alt="Sicilean"
                    width={160}
                    height={36}
                    className="dark:invert print:dark:invert-0"
                  />
                </div>
                {company && (
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p className="font-semibold text-foreground">
                      {company.legal_name || company.company_name}
                    </p>
                    {company.address && (
                      <p>
                        {company.address}
                        {company.postal_code && `, ${company.postal_code}`}
                        {company.city && ` ${company.city}`}
                        {company.province && ` (${company.province})`}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                      {company.vat_number && (
                        <span>P.IVA: {company.vat_number}</span>
                      )}
                      {company.fiscal_code && (
                        <span>C.F.: {company.fiscal_code}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                      {company.sdi_code && <span>SDI: {company.sdi_code}</span>}
                      {company.pec && <span>PEC: {company.pec}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                      {company.phone && <span>Tel: {company.phone}</span>}
                      {company.email && <span>Email: {company.email}</span>}
                    </div>
                    {company.website && <p>Web: {company.website}</p>}
                  </div>
                )}
              </div>

              {/* Info Offerta */}
              <div className="text-right">
                <h1 className="text-2xl font-bold mb-2">OFFERTA</h1>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">N°:</span>{" "}
                    <strong>{quote.quote_number}</strong>
                    {quote.version > 1 && (
                      <span className="text-muted-foreground ml-1">
                        (v{quote.version})
                      </span>
                    )}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Data:</span>{" "}
                    {formatDate(quote.created_at)}
                  </p>
                  {quote.valid_until && (
                    <p className={isExpired ? "text-muted-foreground line-through" : ""}>
                      <span className="text-muted-foreground">
                        Valida fino al:
                      </span>{" "}
                      {formatDate(quote.valid_until)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Info Cliente */}
            <div className="bg-muted/50 rounded-lg p-4 border print:bg-gray-50 print:border-gray-300">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Destinatario
              </h3>
              <div className="text-sm space-y-0.5">
                <p className="font-semibold text-lg">
                  {quote.client_company || quote.client_name}
                </p>
                {quote.client_company && quote.referente_name && (
                  <p className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Alla c.a. di {quote.referente_name}
                    {quote.referente_role && (
                      <span className="text-muted-foreground">
                        ({quote.referente_role})
                      </span>
                    )}
                  </p>
                )}
                {quote.client_address && (
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {quote.client_address}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  {quote.client_vat && <span>P.IVA: {quote.client_vat}</span>}
                  {quote.client_fiscal_code && (
                    <span>C.F.: {quote.client_fiscal_code}</span>
                  )}
                  {quote.client_sdi_code && (
                    <span>SDI: {quote.client_sdi_code}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                  {quote.client_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {quote.client_email}
                    </span>
                  )}
                  {quote.client_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {quote.client_phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progetto (se presente) */}
          {(quote.project_name || quote.vision_summary || quote.objectives) && (
            <Card className="print-card print-avoid-break">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {quote.project_name || "Progetto"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {quote.vision_summary && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Vision</h4>
                    <p className="text-muted-foreground">
                      {quote.vision_summary}
                    </p>
                  </div>
                )}
                {quote.objectives && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Obiettivi</h4>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {quote.objectives}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Servizi Inclusi */}
          <Card className="print-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Servizi Inclusi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="print-avoid-break border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.custom_name || item.service_name}
                          </span>
                          {item.is_recurring && item.recurring_interval && (
                            <Badge
                              variant="secondary"
                              className="text-xs print:border print:border-gray-300"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              {getRecurringLabel(item.recurring_interval)}
                              {item.recurring_count &&
                                ` ×${item.recurring_count}`}
                            </Badge>
                          )}
                        </div>
                        {(item.custom_description ||
                          item.service_description) && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.custom_description ||
                              item.service_description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">
                          {formatCurrency(
                            (item.line_total - item.discount_amount) *
                              (1 + taxRate)
                          )}
                          {item.is_recurring && item.recurring_interval && (
                            <span className="text-xs text-muted-foreground font-normal">
                              /{getRecurringLabel(item.recurring_interval)}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          IVA {quote.tax_percentage}% inclusa
                        </p>
                        {item.discount_percentage > 0 && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            Sconto {item.discount_percentage}%
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Addon */}
                    {item.addons.length > 0 && (
                      <div className="mt-2 pl-4 border-l-2 border-muted space-y-1">
                        {item.addons.map((addon) => (
                          <div
                            key={addon.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Plus className="h-3 w-3 text-primary" />
                              {addon.addon_name}
                              {addon.is_recurring &&
                                addon.recurring_interval && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1 py-0 ml-1"
                                  >
                                    <RefreshCw className="h-2 w-2 mr-0.5" />
                                    {getRecurringLabel(
                                      addon.recurring_interval
                                    )}
                                  </Badge>
                                )}
                            </span>
                            <span className="font-mono text-muted-foreground">
                              {formatCurrency(addon.line_total * (1 + taxRate))}
                              {addon.is_recurring &&
                                addon.recurring_interval && (
                                  <span className="text-xs">
                                    /
                                    {getRecurringLabel(
                                      addon.recurring_interval
                                    )}
                                  </span>
                                )}
                              <span className="text-[10px] ml-1">
                                (IVA incl.)
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Riepilogo Economico */}
          <Card className="print-card print-avoid-break">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Riepilogo Economico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Una tantum */}
                {quote.subtotal_one_time > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Costi Una Tantum
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Imponibile</span>
                        <span className="font-mono">
                          {formatCurrency(
                            quote.subtotal_one_time - quote.discount_amount
                          )}
                        </span>
                      </div>
                      {quote.discount_amount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>Sconto applicato</span>
                          <span className="font-mono">
                            -{formatCurrency(quote.discount_amount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-muted-foreground">
                        <span>IVA ({quote.tax_percentage}%)</span>
                        <span className="font-mono">
                          {formatCurrency(
                            (quote.subtotal_one_time - quote.discount_amount) *
                              taxRate
                          )}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Totale Una Tantum</span>
                        <span className="font-mono">
                          {formatCurrency(
                            (quote.subtotal_one_time - quote.discount_amount) *
                              (1 + taxRate)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ricorrenti */}
                {recurringItems.length > 0 && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3 print:bg-gray-50 print:border-gray-300">
                    <h4 className="font-semibold text-sm text-primary uppercase tracking-wide flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Costi Ricorrenti
                    </h4>

                    <div className="space-y-1 text-sm">
                      {recurringItems.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-muted-foreground"
                        >
                          <span className="flex items-center gap-1">
                            {item.isAddon && (
                              <Plus className="h-3 w-3 text-primary" />
                            )}
                            {item.name}
                            {item.count && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1 py-0"
                              >
                                ×{item.count}
                              </Badge>
                            )}
                          </span>
                          <span className="font-mono">
                            {formatCurrency(item.amount * (1 + taxRate))}/
                            {RECURRING_INTERVAL_LABELS[
                              item.interval as RecurringInterval
                            ] || item.interval}
                            <span className="text-[10px] ml-1">
                              (IVA incl.)
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-primary/20" />

                    {quote.total_recurring_monthly > 0 && (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Imponibile mensile</span>
                          <span className="font-mono">
                            {formatCurrency(quote.total_recurring_monthly)}
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>IVA ({quote.tax_percentage}%)</span>
                          <span className="font-mono">
                            {formatCurrency(
                              quote.total_recurring_monthly * taxRate
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold text-primary">
                          <span>Totale Mensile (IVA incl.)</span>
                          <span className="font-mono">
                            {formatCurrency(
                              quote.total_recurring_monthly * (1 + taxRate)
                            )}
                            /mese
                          </span>
                        </div>
                      </div>
                    )}

                    {quote.total_recurring_yearly > 0 && (
                      <div className="flex justify-between font-semibold text-primary pt-2">
                        <span>Totale Annuale (IVA incl.)</span>
                        <span className="font-mono">
                          {formatCurrency(
                            quote.total_recurring_yearly * (1 + taxRate)
                          )}
                          /anno
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Calendario Pagamenti */}
          {billingSchedule.length > 0 && (
            <Card className="print-card print-break-before">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Piano di Fatturazione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 print:border print:border-gray-300">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Simulazione basata sulla data di emissione dell&apos;offerta
                    ({formatDate(new Date())}). Le date effettive potrebbero
                    variare in base alla data di firma o per cause non previste.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {billingSchedule.map((payment, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border print-avoid-break ${
                        index === 0
                          ? "bg-primary/5 border-primary/30 print:bg-gray-50 print:border-gray-300"
                          : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                              index === 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {payment.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(payment.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold">
                            {formatCurrency(payment.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            IVA incl.
                          </p>
                        </div>
                      </div>

                      <div className="text-xs space-y-0.5 border-t border-dashed pt-2">
                        {payment.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex justify-between text-muted-foreground"
                          >
                            <span className="flex items-center gap-1">
                              {item.type === "recurring" ? (
                                <RefreshCw className="h-2.5 w-2.5 text-primary" />
                              ) : (
                                <Receipt className="h-2.5 w-2.5" />
                              )}
                              {item.name}
                            </span>
                            <span className="font-mono">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between text-muted-foreground">
                          <span>IVA ({quote.tax_percentage}%)</span>
                          <span className="font-mono">
                            {formatCurrency(payment.vat)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totale Contratto */}
                <div className="mt-4 p-4 bg-primary/10 rounded-lg border-2 border-primary/30 print:bg-gray-100 print:border-gray-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-primary">
                        Valore Totale Contratto
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {billingSchedule.length} pagamenti previsti
                      </p>
                    </div>
                    <p className="font-mono font-bold text-2xl text-primary">
                      {formatCurrency(totalContractValue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Termini di Pagamento e Consegna */}
          {(quote.payment_terms || quote.estimated_delivery) && (
            <Card className="print-card print-avoid-break">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Termini
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                {quote.payment_terms && (
                  <div>
                    <h4 className="font-semibold mb-1">
                      Modalità di Pagamento
                    </h4>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {quote.payment_terms}
                    </p>
                  </div>
                )}
                {settings?.bankAccount?.iban && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-1">Coordinate Bancarie</h4>
                    <div className="text-muted-foreground space-y-0.5">
                      {settings.bankAccount.bank_name && (
                        <p>Banca: {settings.bankAccount.bank_name}</p>
                      )}
                      <p>IBAN: {settings.bankAccount.iban}</p>
                      {settings.bankAccount.swift && (
                        <p>BIC/SWIFT: {settings.bankAccount.swift}</p>
                      )}
                      <p>
                        Intestatario:{" "}
                        {company?.legal_name || company?.company_name}
                      </p>
                    </div>
                  </div>
                )}
                {quote.estimated_delivery && (
                  <div>
                    <h4 className="font-semibold mb-1">Tempi di Consegna</h4>
                    <p className="text-muted-foreground">
                      {quote.estimated_delivery}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Note per il Cliente */}
          {quote.client_notes && (
            <Card className="print-card print-avoid-break">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {quote.client_notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Termini e Condizioni */}
          {settings?.terms && settings.terms.length > 0 && (
            <Card className="print-card print-break-before">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Termini e Condizioni</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  {settings.terms.map((term, index) => (
                    <div key={term.id} className="print-avoid-break">
                      <h4 className="font-semibold mb-1">
                        {index + 1}. {term.name}
                      </h4>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {term.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Spazio Firma */}
          <Card className="print-card print-avoid-break">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pen className="h-5 w-5" />
                Accettazione Offerta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                Con la firma del presente documento, il Cliente dichiara di aver
                preso visione e di accettare integralmente i termini, le
                condizioni e i prezzi indicati nella presente offerta.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Firma Fornitore */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Il Fornitore
                  </h4>
                  <div className="border-b-2 border-gray-300 h-16"></div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {company?.legal_name ||
                        company?.company_name ||
                        "Sicilean"}
                    </p>
                    <p className="mt-4">Data: ____________________</p>
                  </div>
                </div>

                {/* Firma Cliente */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Il Cliente
                  </h4>
                  <div className="border-b-2 border-gray-300 h-16"></div>
                  <div className="text-sm text-muted-foreground">
                    <p>{quote.client_company || quote.client_name}</p>
                    <p className="mt-4">Data: ____________________</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-8 text-center">
                Timbro e firma per accettazione
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-6 border-t print:hidden">
            <img
              src="/LogoFont_Sicilean_Black.svg"
              alt="Sicilean"
              width={100}
              height={24}
              className="mx-auto opacity-50 dark:invert"
            />
            {company?.footer_text && (
              <p className="text-xs text-muted-foreground mt-2">
                {company.footer_text}
              </p>
            )}
          </div>

          {/* Footer per stampa - appare su ogni pagina */}
          <div className="hidden print:block print-page-footer">
            <span>
              {company?.footer_text ||
                `${company?.legal_name || company?.company_name} - P.IVA ${
                  company?.vat_number
                } - ${company?.website}`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
