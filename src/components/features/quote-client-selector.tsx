"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  User,
  Building2,
  Loader2,
  Plus,
  Check,
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";

// Tipi
interface PersonaFisica {
  notion_id: string;
  nome_completo: string;
  codice_fiscale: string | null;
  indirizzo: string | null;
  contatti: { id: number; tipo: string; valore: string }[] | null;
}

interface PersonaGiuridica {
  notion_id: string;
  ragione_sociale: string;
  p_iva: string | null;
  codice_fiscale: string | null;
  sdi_code: string | null;
  sede_legale: string | null;
  email: { id: number; tipo: string; valore: string }[] | null;
  contatti_telefonici: { id: number; tipo: string; valore: string }[] | null;
}

interface ClientData {
  type: "persona_fisica" | "persona_giuridica";
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  vat: string;
  fiscalCode: string;
  sdiCode: string;
  company: string;
}

interface QuoteClientSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (client: ClientData) => void;
  initialType?: "persona_fisica" | "persona_giuridica";
}

export function QuoteClientSelector({
  open,
  onOpenChange,
  onSelect,
  initialType = "persona_giuridica",
}: QuoteClientSelectorProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<
    "persona_fisica" | "persona_giuridica"
  >(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [personeFisiche, setPersoneFisiche] = useState<PersonaFisica[]>([]);
  const [personeGiuridiche, setPersoneGiuridiche] = useState<
    PersonaGiuridica[]
  >([]);

  // Quick add state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    nome: "",
    email: "",
    telefono: "",
    piva: "",
    codiceFiscale: "",
    indirizzo: "",
    sdiCode: "",
  });
  const [saving, setSaving] = useState(false);

  // Carica dati
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "persona_fisica") {
        const { data } = await supabase
          .from("persone_fisiche")
          .select(
            "notion_id, nome_completo, codice_fiscale, indirizzo, contatti"
          )
          .ilike("nome_completo", `%${searchQuery}%`)
          .order("nome_completo")
          .limit(50);
        setPersoneFisiche(data || []);
      } else {
        const { data } = await supabase
          .from("persone_giuridiche")
          .select(
            "notion_id, ragione_sociale, p_iva, codice_fiscale, sdi_code, sede_legale, email, contatti_telefonici"
          )
          .ilike("ragione_sociale", `%${searchQuery}%`)
          .order("ragione_sociale")
          .limit(50);
        setPersoneGiuridiche(data || []);
      }
    } catch (error) {
      console.error("Errore caricamento:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, activeTab, searchQuery]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  // Helper per estrarre contatto
  const extractContact = (
    contacts: { tipo: string; valore: string }[] | null,
    types: string[]
  ): string => {
    if (!contacts) return "";
    const contact = contacts.find((c) => types.includes(c.tipo.toLowerCase()));
    return contact?.valore || "";
  };

  // Seleziona persona fisica
  const handleSelectPersonaFisica = (pf: PersonaFisica) => {
    const email = extractContact(pf.contatti, ["email", "principale"]);
    const phone = extractContact(pf.contatti, [
      "cellulare",
      "telefono",
      "fisso",
    ]);

    onSelect({
      type: "persona_fisica",
      id: pf.notion_id,
      name: pf.nome_completo,
      email,
      phone,
      address: pf.indirizzo || "",
      vat: "",
      fiscalCode: pf.codice_fiscale || "",
      sdiCode: "",
      company: "",
    });
    onOpenChange(false);
  };

  // Seleziona persona giuridica
  const handleSelectPersonaGiuridica = (pg: PersonaGiuridica) => {
    const email = extractContact(pg.email, ["principale", "email", "pec"]);
    const phone = extractContact(pg.contatti_telefonici, [
      "fisso",
      "cellulare",
      "principale",
    ]);

    onSelect({
      type: "persona_giuridica",
      id: pg.notion_id,
      name: pg.ragione_sociale,
      email,
      phone,
      address: pg.sede_legale || "",
      vat: pg.p_iva || "",
      fiscalCode: pg.codice_fiscale || "",
      sdiCode: pg.sdi_code || "",
      company: pg.ragione_sociale,
    });
    onOpenChange(false);
  };

  // Quick add
  const handleQuickAdd = async () => {
    if (!quickAddData.nome.trim()) {
      alert("Il nome è obbligatorio");
      return;
    }

    setSaving(true);
    try {
      if (activeTab === "persona_fisica") {
        // Genera ID univoco
        const newId = `pf-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        const contatti: { id: number; tipo: string; valore: string }[] = [];
        if (quickAddData.email) {
          contatti.push({ id: 1, tipo: "email", valore: quickAddData.email });
        }
        if (quickAddData.telefono) {
          contatti.push({
            id: 2,
            tipo: "cellulare",
            valore: quickAddData.telefono,
          });
        }

        const { error } = await supabase.from("persone_fisiche").insert({
          notion_id: newId,
          nome_completo: quickAddData.nome.toUpperCase(),
          codice_fiscale: quickAddData.codiceFiscale || null,
          indirizzo: quickAddData.indirizzo || null,
          contatti: contatti.length > 0 ? contatti : null,
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString(),
        });

        if (error) throw error;

        // Seleziona automaticamente
        onSelect({
          type: "persona_fisica",
          id: newId,
          name: quickAddData.nome.toUpperCase(),
          email: quickAddData.email,
          phone: quickAddData.telefono,
          address: quickAddData.indirizzo,
          vat: "",
          fiscalCode: quickAddData.codiceFiscale,
          sdiCode: "",
          company: "",
        });
        onOpenChange(false);
      } else {
        // Persona giuridica
        const newId = `pg-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        const emailArray: { id: number; tipo: string; valore: string }[] = [];
        if (quickAddData.email) {
          emailArray.push({
            id: 1,
            tipo: "principale",
            valore: quickAddData.email,
          });
        }

        const telefonoArray: { id: number; tipo: string; valore: string }[] =
          [];
        if (quickAddData.telefono) {
          telefonoArray.push({
            id: 1,
            tipo: "fisso",
            valore: quickAddData.telefono,
          });
        }

        const { error } = await supabase.from("persone_giuridiche").insert({
          notion_id: newId,
          ragione_sociale: quickAddData.nome.toUpperCase(),
          p_iva: quickAddData.piva || null,
          codice_fiscale: quickAddData.codiceFiscale || null,
          sdi_code: quickAddData.sdiCode || null,
          sede_legale: quickAddData.indirizzo || null,
          email: emailArray.length > 0 ? emailArray : null,
          contatti_telefonici: telefonoArray.length > 0 ? telefonoArray : null,
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString(),
        });

        if (error) throw error;

        // Seleziona automaticamente
        onSelect({
          type: "persona_giuridica",
          id: newId,
          name: quickAddData.nome.toUpperCase(),
          email: quickAddData.email,
          phone: quickAddData.telefono,
          address: quickAddData.indirizzo,
          vat: quickAddData.piva,
          fiscalCode: quickAddData.codiceFiscale,
          sdiCode: quickAddData.sdiCode,
          company: quickAddData.nome.toUpperCase(),
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Errore creazione:", error);
      alert("Errore durante la creazione: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const resetQuickAdd = () => {
    setQuickAddData({
      nome: "",
      email: "",
      telefono: "",
      piva: "",
      codiceFiscale: "",
      indirizzo: "",
      sdiCode: "",
    });
    setShowQuickAdd(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) resetQuickAdd();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {activeTab === "persona_fisica" ? (
              <User className="h-5 w-5" />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
            Seleziona Cliente
          </DialogTitle>
          <DialogDescription>
            Cerca o crea un nuovo cliente per il preventivo
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as any);
            setShowQuickAdd(false);
            setSearchQuery("");
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="persona_giuridica" className="gap-2">
              <Building2 className="h-4 w-4" />
              Azienda
            </TabsTrigger>
            <TabsTrigger value="persona_fisica" className="gap-2">
              <User className="h-4 w-4" />
              Persona Fisica
            </TabsTrigger>
          </TabsList>

          {/* Form Quick Add */}
          {showQuickAdd ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crea nuovo{" "}
                  {activeTab === "persona_fisica" ? "contatto" : "azienda"}
                </h4>
                <Button variant="ghost" size="sm" onClick={resetQuickAdd}>
                  Annulla
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="nome">
                    {activeTab === "persona_fisica"
                      ? "Nome Completo *"
                      : "Ragione Sociale *"}
                  </Label>
                  <Input
                    id="nome"
                    value={quickAddData.nome}
                    onChange={(e) =>
                      setQuickAddData((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    placeholder={
                      activeTab === "persona_fisica"
                        ? "Mario Rossi"
                        : "Azienda S.r.l."
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={quickAddData.email}
                    onChange={(e) =>
                      setQuickAddData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="email@esempio.com"
                  />
                </div>

                <div>
                  <Label htmlFor="telefono">Telefono</Label>
                  <Input
                    id="telefono"
                    value={quickAddData.telefono}
                    onChange={(e) =>
                      setQuickAddData((prev) => ({
                        ...prev,
                        telefono: e.target.value,
                      }))
                    }
                    placeholder="+39 123 456 7890"
                  />
                </div>

                {activeTab === "persona_giuridica" && (
                  <>
                    <div>
                      <Label htmlFor="piva">P.IVA</Label>
                      <Input
                        id="piva"
                        value={quickAddData.piva}
                        onChange={(e) =>
                          setQuickAddData((prev) => ({
                            ...prev,
                            piva: e.target.value,
                          }))
                        }
                        placeholder="12345678901"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sdiCode">Codice SDI</Label>
                      <Input
                        id="sdiCode"
                        value={quickAddData.sdiCode}
                        onChange={(e) =>
                          setQuickAddData((prev) => ({
                            ...prev,
                            sdiCode: e.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="XXXXXXX"
                        maxLength={7}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="codiceFiscale">Codice Fiscale</Label>
                  <Input
                    id="codiceFiscale"
                    value={quickAddData.codiceFiscale}
                    onChange={(e) =>
                      setQuickAddData((prev) => ({
                        ...prev,
                        codiceFiscale: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder={
                      activeTab === "persona_fisica"
                        ? "RSSMRA80A01H501X"
                        : "12345678901"
                    }
                  />
                </div>

                <div
                  className={
                    activeTab === "persona_giuridica" ? "" : "sm:col-span-2"
                  }
                >
                  <Label htmlFor="indirizzo">Indirizzo</Label>
                  <Input
                    id="indirizzo"
                    value={quickAddData.indirizzo}
                    onChange={(e) =>
                      setQuickAddData((prev) => ({
                        ...prev,
                        indirizzo: e.target.value,
                      }))
                    }
                    placeholder="Via Roma 1, 00100 Roma RM"
                  />
                </div>
              </div>

              <Button
                onClick={handleQuickAdd}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creazione...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Crea e Seleziona
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              {/* Barra di ricerca */}
              <div className="mt-4 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Cerca ${
                      activeTab === "persona_fisica" ? "persona" : "azienda"
                    }...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={() => setShowQuickAdd(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuovo
                </Button>
              </div>

              {/* Lista risultati */}
              <TabsContent value="persona_fisica" className="mt-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : personeFisiche.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nessun risultato trovato</p>
                    <Button
                      variant="link"
                      onClick={() => setShowQuickAdd(true)}
                    >
                      Crea nuovo contatto
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {personeFisiche.map((pf) => (
                        <Card
                          key={pf.notion_id}
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => handleSelectPersonaFisica(pf)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">
                                  {pf.nome_completo}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                  {extractContact(pf.contatti, [
                                    "email",
                                    "principale",
                                  ]) && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {extractContact(pf.contatti, [
                                        "email",
                                        "principale",
                                      ])}
                                    </span>
                                  )}
                                  {extractContact(pf.contatti, [
                                    "cellulare",
                                    "telefono",
                                  ]) && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {extractContact(pf.contatti, [
                                        "cellulare",
                                        "telefono",
                                      ])}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {pf.codice_fiscale && (
                                <Badge variant="outline" className="text-xs">
                                  CF: {pf.codice_fiscale.slice(0, 6)}...
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="persona_giuridica" className="mt-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : personeGiuridiche.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nessun risultato trovato</p>
                    <Button
                      variant="link"
                      onClick={() => setShowQuickAdd(true)}
                    >
                      Crea nuova azienda
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {personeGiuridiche.map((pg) => (
                        <Card
                          key={pg.notion_id}
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => handleSelectPersonaGiuridica(pg)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">
                                  {pg.ragione_sociale}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                  {extractContact(pg.email, [
                                    "principale",
                                    "email",
                                    "pec",
                                  ]) && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {extractContact(pg.email, [
                                        "principale",
                                        "email",
                                        "pec",
                                      ])}
                                    </span>
                                  )}
                                  {extractContact(pg.contatti_telefonici, [
                                    "fisso",
                                    "cellulare",
                                  ]) && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {extractContact(pg.contatti_telefonici, [
                                        "fisso",
                                        "cellulare",
                                      ])}
                                    </span>
                                  )}
                                  {pg.sede_legale && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {pg.sede_legale.split(",")[0]}...
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                {pg.p_iva && (
                                  <Badge variant="outline" className="text-xs">
                                    P.IVA: {pg.p_iva}
                                  </Badge>
                                )}
                                {pg.sdi_code && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    SDI: {pg.sdi_code}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
