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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  User,
  Loader2,
  Plus,
  Check,
  Mail,
  Phone,
  Briefcase,
  Link2,
  UserPlus,
} from "lucide-react";

interface PersonaFisica {
  notion_id: string;
  nome_completo: string;
  codice_fiscale: string | null;
  indirizzo: string | null;
  contatti: { id: number; tipo: string; valore: string }[] | null;
}

interface Relazione {
  id: number;
  persona_fisica_id: string;
  tipo_relazione: string;
  persona_fisica?: PersonaFisica;
}

interface ReferenteData {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface QuoteReferenteSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (referente: ReferenteData) => void;
  personaGiuridicaId: string | null;
  personaGiuridicaNome: string;
}

export function QuoteReferenteSelector({
  open,
  onOpenChange,
  onSelect,
  personaGiuridicaId,
  personaGiuridicaNome,
}: QuoteReferenteSelectorProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [relazioni, setRelazioni] = useState<Relazione[]>([]);
  const [altrePersone, setAltrePersone] = useState<PersonaFisica[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [showLinkExisting, setShowLinkExisting] = useState(false);

  // Quick add state
  const [quickAddData, setQuickAddData] = useState({
    nome: "",
    email: "",
    telefono: "",
    ruolo: "",
  });
  const [saving, setSaving] = useState(false);

  // Carica persone collegate
  const loadRelazioni = useCallback(async () => {
    if (!personaGiuridicaId) return;

    setLoading(true);
    try {
      // Carica relazioni esistenti
      const { data: relazioniData } = await supabase
        .from("persone_fisiche_relazioni")
        .select("id, persona_fisica_id, tipo_relazione")
        .eq("persona_giuridica_id", personaGiuridicaId);

      if (relazioniData && relazioniData.length > 0) {
        // Carica dettagli persone fisiche
        const personaIds = relazioniData.map((r) => r.persona_fisica_id);
        const { data: personeData } = await supabase
          .from("persone_fisiche")
          .select(
            "notion_id, nome_completo, codice_fiscale, indirizzo, contatti"
          )
          .in("notion_id", personaIds);

        const relazioniComplete = relazioniData.map((rel) => ({
          ...rel,
          persona_fisica: personeData?.find(
            (p) => p.notion_id === rel.persona_fisica_id
          ),
        }));

        setRelazioni(relazioniComplete);
      } else {
        setRelazioni([]);
      }
    } catch (error) {
      console.error("Errore caricamento relazioni:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, personaGiuridicaId]);

  // Cerca altre persone per collegamento
  const searchAltrePersone = useCallback(async () => {
    if (!searchQuery.trim()) {
      setAltrePersone([]);
      return;
    }

    const { data } = await supabase
      .from("persone_fisiche")
      .select("notion_id, nome_completo, codice_fiscale, indirizzo, contatti")
      .ilike("nome_completo", `%${searchQuery}%`)
      .limit(20);

    // Escludi le persone già collegate
    const collegateIds = relazioni.map((r) => r.persona_fisica_id);
    const filtered =
      data?.filter((p) => !collegateIds.includes(p.notion_id)) || [];
    setAltrePersone(filtered);
  }, [supabase, searchQuery, relazioni]);

  useEffect(() => {
    if (open) {
      loadRelazioni();
    }
  }, [open, loadRelazioni]);

  useEffect(() => {
    if (showLinkExisting) {
      const timer = setTimeout(searchAltrePersone, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, showLinkExisting, searchAltrePersone]);

  // Helper per estrarre contatto
  const extractContact = (
    contacts: { tipo: string; valore: string }[] | null,
    types: string[]
  ): string => {
    if (!contacts) return "";
    const contact = contacts.find((c) => types.includes(c.tipo.toLowerCase()));
    return contact?.valore || "";
  };

  // Seleziona referente esistente
  const handleSelectReferente = (rel: Relazione) => {
    if (!rel.persona_fisica) return;

    const email = extractContact(rel.persona_fisica.contatti, [
      "email",
      "principale",
    ]);
    const phone = extractContact(rel.persona_fisica.contatti, [
      "cellulare",
      "telefono",
      "fisso",
    ]);

    onSelect({
      id: rel.persona_fisica.notion_id,
      name: rel.persona_fisica.nome_completo,
      role: rel.tipo_relazione,
      email,
      phone,
    });
    onOpenChange(false);
  };

  // Collega persona esistente
  const handleLinkPersona = async (pf: PersonaFisica, ruolo: string) => {
    if (!personaGiuridicaId) return;

    setSaving(true);
    try {
      // Crea relazione
      const { error } = await supabase
        .from("persone_fisiche_relazioni")
        .insert({
          persona_fisica_id: pf.notion_id,
          persona_giuridica_id: personaGiuridicaId,
          tipo_relazione: ruolo || "Referente",
        });

      if (error) throw error;

      const email = extractContact(pf.contatti, ["email", "principale"]);
      const phone = extractContact(pf.contatti, [
        "cellulare",
        "telefono",
        "fisso",
      ]);

      onSelect({
        id: pf.notion_id,
        name: pf.nome_completo,
        role: ruolo || "Referente",
        email,
        phone,
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Errore collegamento:", error);
      alert("Errore durante il collegamento: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Crea nuovo referente
  const handleQuickAdd = async () => {
    if (!quickAddData.nome.trim()) {
      alert("Il nome è obbligatorio");
      return;
    }
    if (!personaGiuridicaId) {
      alert("Nessuna azienda selezionata");
      return;
    }

    setSaving(true);
    try {
      // Crea persona fisica
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

      const { error: pfError } = await supabase.from("persone_fisiche").insert({
        notion_id: newId,
        nome_completo: quickAddData.nome.toUpperCase(),
        contatti: contatti.length > 0 ? contatti : null,
        created_time: new Date().toISOString(),
        last_edited_time: new Date().toISOString(),
      });

      if (pfError) throw pfError;

      // Crea relazione
      const { error: relError } = await supabase
        .from("persone_fisiche_relazioni")
        .insert({
          persona_fisica_id: newId,
          persona_giuridica_id: personaGiuridicaId,
          tipo_relazione: quickAddData.ruolo || "Referente",
        });

      if (relError) throw relError;

      onSelect({
        id: newId,
        name: quickAddData.nome.toUpperCase(),
        role: quickAddData.ruolo || "Referente",
        email: quickAddData.email,
        phone: quickAddData.telefono,
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Errore creazione:", error);
      alert("Errore durante la creazione: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const resetState = () => {
    setShowAddNew(false);
    setShowLinkExisting(false);
    setSearchQuery("");
    setQuickAddData({ nome: "", email: "", telefono: "", ruolo: "" });
  };

  if (!personaGiuridicaId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleziona Referente</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Seleziona prima un&apos;azienda cliente</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) resetState();
      }}
    >
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Seleziona Referente
          </DialogTitle>
          <DialogDescription>
            Scegli il referente per <strong>{personaGiuridicaNome}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Form nuovo referente */}
        {showAddNew ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Nuovo Referente
              </h4>
              <Button variant="ghost" size="sm" onClick={resetState}>
                Annulla
              </Button>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={quickAddData.nome}
                  onChange={(e) =>
                    setQuickAddData((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  placeholder="Mario Rossi"
                />
              </div>

              <div>
                <Label htmlFor="ruolo">Ruolo in Azienda</Label>
                <Input
                  id="ruolo"
                  value={quickAddData.ruolo}
                  onChange={(e) =>
                    setQuickAddData((prev) => ({
                      ...prev,
                      ruolo: e.target.value,
                    }))
                  }
                  placeholder="es. Amministratore, Responsabile IT, Marketing Manager"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    placeholder="email@azienda.it"
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
        ) : showLinkExisting ? (
          /* Cerca persona esistente da collegare */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Collega Persona Esistente
              </h4>
              <Button variant="ghost" size="sm" onClick={resetState}>
                Annulla
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca persona..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            <ScrollArea className="h-[250px]">
              {altrePersone.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {searchQuery ? "Nessun risultato" : "Cerca una persona..."}
                </div>
              ) : (
                <div className="space-y-2">
                  {altrePersone.map((pf) => (
                    <Card
                      key={pf.notion_id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleLinkPersona(pf, "Referente")}
                    >
                      <CardContent className="p-3">
                        <p className="font-medium">{pf.nome_completo}</p>
                        <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                          {extractContact(pf.contatti, ["email"]) && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {extractContact(pf.contatti, ["email"])}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          /* Lista referenti collegati */
          <>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : relazioni.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nessun referente collegato a questa azienda</p>
              </div>
            ) : (
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {relazioni.map((rel) =>
                    rel.persona_fisica ? (
                      <Card
                        key={rel.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleSelectReferente(rel)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">
                                {rel.persona_fisica.nome_completo}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                {extractContact(rel.persona_fisica.contatti, [
                                  "email",
                                ]) && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {extractContact(
                                      rel.persona_fisica.contatti,
                                      ["email"]
                                    )}
                                  </span>
                                )}
                                {extractContact(rel.persona_fisica.contatti, [
                                  "cellulare",
                                  "telefono",
                                ]) && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {extractContact(
                                      rel.persona_fisica.contatti,
                                      ["cellulare", "telefono"]
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {rel.tipo_relazione}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null
                  )}
                </div>
              </ScrollArea>
            )}

            <Separator />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLinkExisting(true)}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Collega Esistente
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddNew(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuovo Referente
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
