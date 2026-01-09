"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Save, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QuoteTerm {
  id: string;
  name: string;
  content: string;
  is_active: boolean | null;
  display_order: number | null;
}

interface CompanyInfo {
  id: string;
  company_name: string;
  legal_name: string | null;
  vat_number: string | null;
  fiscal_code: string | null;
  sdi_code: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  province: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  pec: string | null;
  website: string | null;
  default_bank_account_id: string | null;
  footer_text: string | null;
}

interface BankAccount {
  id: string;
  account_name: string;
  iban: string | null;
  currency: string;
  balance: number | null;
}

export default function QuoteSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [terms, setTerms] = useState<QuoteTerm[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [editingTerm, setEditingTerm] = useState<QuoteTerm | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    // Carica termini
    const { data: termsData } = await supabase
      .from("quote_terms")
      .select("*")
      .order("display_order", { ascending: true });

    if (termsData) setTerms(termsData);

    // Carica info azienda
    const { data: companyData } = await supabase
      .from("company_info")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .single();

    if (companyData) setCompanyInfo(companyData);

    // Carica account bancari
    const { data: accountsData } = await supabase
      .from("bank_accounts")
      .select("id, account_name, iban, currency, balance")
      .eq("is_active", true)
      .order("account_name", { ascending: true });

    if (accountsData) setBankAccounts(accountsData);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveCompanyInfo = async () => {
    if (!companyInfo) return;

    setSaving(true);
    const { error } = await (supabase.from("company_info") as any)
      .update({
        ...companyInfo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", companyInfo.id);

    setSaving(false);

    if (error) {
      alert("Errore durante il salvataggio");
    } else {
      alert("Informazioni aziendali salvate con successo");
    }
  };

  const handleSaveTerm = async () => {
    if (!editingTerm) return;

    setSaving(true);

    if (editingTerm.id === "new") {
      // Nuovo termine
      const maxOrder = Math.max(...terms.map((t) => t.display_order ?? 0), 0);
      const { error } = await (supabase.from("quote_terms") as any).insert({
        name: editingTerm.name,
        content: editingTerm.content,
        is_active: true,
        display_order: maxOrder + 1,
      });

      if (error) {
        alert("Errore durante il salvataggio");
      } else {
        await loadData();
        setDialogOpen(false);
        setEditingTerm(null);
      }
    } else {
      // Aggiorna termine esistente
      const { error } = await (supabase.from("quote_terms") as any)
        .update({
          name: editingTerm.name,
          content: editingTerm.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingTerm.id);

      if (error) {
        alert("Errore durante il salvataggio");
      } else {
        await loadData();
        setDialogOpen(false);
        setEditingTerm(null);
      }
    }

    setSaving(false);
  };

  const handleDeleteTerm = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo termine?")) return;

    const { error } = await supabase.from("quote_terms").delete().eq("id", id);

    if (error) {
      alert("Errore durante l'eliminazione");
    } else {
      await loadData();
    }
  };

  const handleToggleActive = async (term: QuoteTerm) => {
    const { error } = await (supabase.from("quote_terms") as any)
      .update({ is_active: !term.is_active })
      .eq("id", term.id);

    if (!error) await loadData();
  };

  const handleReorder = async (term: QuoteTerm, direction: "up" | "down") => {
    const currentIndex = terms.findIndex((t) => t.id === term.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (swapIndex < 0 || swapIndex >= terms.length) return;

    const termToSwap = terms[swapIndex];

    // Scambia gli ordini
    await (supabase.from("quote_terms") as any)
      .update({ display_order: termToSwap.display_order })
      .eq("id", term.id);

    await (supabase.from("quote_terms") as any)
      .update({ display_order: term.display_order })
      .eq("id", termToSwap.id);

    await loadData();
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
      <div>
        <h1 className="text-3xl font-bold">Impostazioni Preventivi</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci le informazioni aziendali e i termini e condizioni per i
          preventivi
        </p>
      </div>

      {/* Informazioni Aziendali */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Aziendali</CardTitle>
          <CardDescription>
            Questi dati verranno visualizzati nei preventivi PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {companyInfo && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="company_name">Nome Commerciale</Label>
                  <Input
                    id="company_name"
                    value={companyInfo.company_name}
                    onChange={(e) =>
                      setCompanyInfo({
                        ...companyInfo,
                        company_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="legal_name">Ragione Sociale</Label>
                  <Input
                    id="legal_name"
                    value={companyInfo.legal_name || ""}
                    onChange={(e) =>
                      setCompanyInfo({
                        ...companyInfo,
                        legal_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="vat_number">Partita IVA</Label>
                  <Input
                    id="vat_number"
                    value={companyInfo.vat_number || ""}
                    onChange={(e) =>
                      setCompanyInfo({
                        ...companyInfo,
                        vat_number: e.target.value,
                      })
                    }
                    placeholder="IT12345678901"
                  />
                </div>
                <div>
                  <Label htmlFor="fiscal_code">Codice Fiscale</Label>
                  <Input
                    id="fiscal_code"
                    value={companyInfo.fiscal_code || ""}
                    onChange={(e) =>
                      setCompanyInfo({
                        ...companyInfo,
                        fiscal_code: e.target.value,
                      })
                    }
                    placeholder="12345678901"
                  />
                </div>
                <div>
                  <Label htmlFor="sdi_code">Codice SDI</Label>
                  <Input
                    id="sdi_code"
                    value={companyInfo.sdi_code || ""}
                    onChange={(e) =>
                      setCompanyInfo({
                        ...companyInfo,
                        sdi_code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="XXXXXXX"
                    maxLength={7}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Codice Univoco per fatturazione elettronica
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  value={companyInfo.address || ""}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, address: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="postal_code">CAP</Label>
                  <Input
                    id="postal_code"
                    value={companyInfo.postal_code || ""}
                    onChange={(e) =>
                      setCompanyInfo({
                        ...companyInfo,
                        postal_code: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="city">Città</Label>
                  <Input
                    id="city"
                    value={companyInfo.city || ""}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="province">Provincia</Label>
                  <Input
                    id="province"
                    value={companyInfo.province || ""}
                    onChange={(e) =>
                      setCompanyInfo({
                        ...companyInfo,
                        province: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={companyInfo.phone || ""}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyInfo.email || ""}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="pec">PEC</Label>
                  <Input
                    id="pec"
                    type="email"
                    value={companyInfo.pec || ""}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, pec: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="website">Sito Web</Label>
                  <Input
                    id="website"
                    value={companyInfo.website || ""}
                    onChange={(e) =>
                      setCompanyInfo({
                        ...companyInfo,
                        website: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="default_bank_account">
                  Account Bancario Predefinito
                </Label>
                <select
                  id="default_bank_account"
                  value={companyInfo.default_bank_account_id || ""}
                  onChange={(e) =>
                    setCompanyInfo({
                      ...companyInfo,
                      default_bank_account_id: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">Nessuno</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_name} ({account.currency})
                      {account.iban && ` - ${account.iban}`}
                      {` - Saldo: ${new Intl.NumberFormat("it-IT", {
                        style: "currency",
                        currency: account.currency,
                      }).format(account.balance ?? 0)}`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Seleziona l&apos;account bancario da mostrare nei preventivi.
                  {bankAccounts.length === 0 && " (Nessun account disponibile)"}
                </p>
              </div>

              <div>
                <Label htmlFor="footer_text">Testo Footer</Label>
                <Input
                  id="footer_text"
                  value={companyInfo.footer_text || ""}
                  onChange={(e) =>
                    setCompanyInfo({
                      ...companyInfo,
                      footer_text: e.target.value,
                    })
                  }
                />
              </div>

              <Button onClick={handleSaveCompanyInfo} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salva Informazioni
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Termini e Condizioni */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Termini e Condizioni</CardTitle>
              <CardDescription>
                Gestisci i termini e condizioni che appariranno nei preventivi
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingTerm({
                      id: "new",
                      name: "",
                      content: "",
                      is_active: true,
                      display_order: 0,
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi Termine
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTerm?.id === "new"
                      ? "Nuovo Termine"
                      : "Modifica Termine"}
                  </DialogTitle>
                </DialogHeader>
                {editingTerm && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="term_name">Titolo</Label>
                      <Input
                        id="term_name"
                        value={editingTerm.name}
                        onChange={(e) =>
                          setEditingTerm({
                            ...editingTerm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="term_content">Contenuto</Label>
                      <Textarea
                        id="term_content"
                        value={editingTerm.content}
                        onChange={(e) =>
                          setEditingTerm({
                            ...editingTerm,
                            content: e.target.value,
                          })
                        }
                        rows={6}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Annulla
                      </Button>
                      <Button onClick={handleSaveTerm} disabled={saving}>
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
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {terms.map((term, index) => (
              <div
                key={term.id}
                className={`border rounded-lg p-4 ${
                  !term.is_active ? "opacity-50 bg-muted/50" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{term.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {term.content}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorder(term, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorder(term, "down")}
                      disabled={index === terms.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTerm(term);
                        setDialogOpen(true);
                      }}
                    >
                      Modifica
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(term)}
                    >
                      {term.is_active ? "Disattiva" : "Attiva"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTerm(term.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
