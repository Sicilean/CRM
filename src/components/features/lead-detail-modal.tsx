"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CrmLead,
  CrmActivity,
  MarketingAttribution,
  MarketingSource,
  MarketingCampaign,
} from "@/types/database.types";
import {
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  CRM_ACTIVITY_TYPES,
  LEAD_STATUS_COLORS,
} from "@/lib/crm-constants";
import { formatDateItalian } from "@/lib/crm-utils";
import { useToast } from "@/components/ui/use-toast";
import {
  Save,
  Trash2,
  ArrowRight,
  Plus,
  Target,
  Link as LinkIcon,
} from "lucide-react";

interface LeadDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: CrmLead;
  onLeadUpdated?: () => void;
}

export default function LeadDetailModal({
  open,
  onOpenChange,
  lead,
  onLeadUpdated,
}: LeadDetailModalProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [attribution, setAttribution] = useState<MarketingAttribution | null>(
    null
  );
  const [marketingSource, setMarketingSource] =
    useState<MarketingSource | null>(null);
  const [marketingCampaign, setMarketingCampaign] =
    useState<MarketingCampaign | null>(null);
  const [loadingAttribution, setLoadingAttribution] = useState(false);

  const [formData, setFormData] = useState({
    nome_completo: lead.nome_completo,
    email: lead.email,
    telefono: lead.telefono || "",
    azienda: lead.azienda || "",
    ruolo: lead.ruolo || "",
    budget: lead.budget?.toString() || "",
    fonte: lead.fonte || "",
    status: lead.status,
    descrizione: lead.descrizione || "",
    note_interne: lead.note_interne || "",
    data_ultimo_contatto: lead.data_ultimo_contatto || "",
    metodo_ultimo_contatto: lead.metodo_ultimo_contatto || "",
    data_prossimo_contatto: lead.data_prossimo_contatto || "",
    metodo_prossimo_contatto: lead.metodo_prossimo_contatto || "",
  });

  const [newActivity, setNewActivity] = useState({
    activity_type: "nota" as CrmActivity["activity_type"],
    subject: "",
    description: "",
    outcome: "",
  });

  const loadActivities = useCallback(async () => {
    setLoadingActivities(true);
    try {
      const { data, error } = await supabase
        .from("crm_activities")
        .select("*")
        .eq("lead_id", lead.id)
        .order("activity_date", { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading activities:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le attività.",
        variant: "destructive",
      });
    } finally {
      setLoadingActivities(false);
    }
  }, [supabase, lead.id, toast]);

  const loadAttribution = useCallback(async () => {
    setLoadingAttribution(true);
    try {
      // Fetch attribution
      const { data: attrData } = await supabase
        .from("marketing_attribution")
        .select("*")
        .eq("lead_id", lead.id)
        .single();

      setAttribution(attrData);

      // Fetch marketing source
      if (lead.marketing_source_id) {
        const { data: sourceData } = await supabase
          .from("marketing_sources")
          .select("*")
          .eq("id", lead.marketing_source_id)
          .single();

        setMarketingSource(sourceData);
      }

      // Fetch marketing campaign
      if (lead.marketing_campaign_id) {
        const { data: campaignData } = await supabase
          .from("marketing_campaigns")
          .select("*")
          .eq("id", lead.marketing_campaign_id)
          .single();

        setMarketingCampaign(campaignData);
      }
    } catch (error) {
      console.error("Error loading attribution:", error);
    } finally {
      setLoadingAttribution(false);
    }
  }, [supabase, lead.id, lead.marketing_source_id, lead.marketing_campaign_id]);

  useEffect(() => {
    if (open) {
      loadActivities();
      loadAttribution();
    }
  }, [open, loadActivities, loadAttribution]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("crm_leads")
        .update({
          nome_completo: formData.nome_completo,
          email: formData.email,
          telefono: formData.telefono || null,
          azienda: formData.azienda || null,
          ruolo: formData.ruolo || null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          fonte: formData.fonte || null,
          status: formData.status,
          descrizione: formData.descrizione || null,
          note_interne: formData.note_interne || null,
          data_ultimo_contatto: formData.data_ultimo_contatto || null,
          metodo_ultimo_contatto: formData.metodo_ultimo_contatto || null,
          data_prossimo_contatto: formData.data_prossimo_contatto || null,
          metodo_prossimo_contatto: formData.metodo_prossimo_contatto || null,
        })
        .eq("id", lead.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Lead aggiornato con successo.",
      });

      if (onLeadUpdated) onLeadUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating lead:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il lead: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.description) {
      toast({
        title: "Attenzione",
        description: "La descrizione è obbligatoria.",
        variant: "destructive",
      });
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("crm_activities").insert({
        lead_id: lead.id,
        activity_type: newActivity.activity_type,
        subject: newActivity.subject || null,
        description: newActivity.description,
        outcome: newActivity.outcome || null,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Attività aggiunta con successo.",
      });

      setNewActivity({
        activity_type: "nota",
        subject: "",
        description: "",
        outcome: "",
      });

      loadActivities();
    } catch (error: any) {
      console.error("Error adding activity:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere l'attività: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleConvertToOpportunity = async () => {
    if (!confirm("Vuoi convertire questo lead in opportunità?")) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: newOpp, error: oppError } = await supabase
        .from("crm_opportunities")
        .insert({
          lead_id: lead.id,
          persona_fisica_id: lead.persona_fisica_id,
          persona_giuridica_id: lead.persona_giuridica_id,
          referente_id: lead.referente_id, // Aggiungi referente
          stage: "scoperta",
          created_by: user?.id,
          assigned_to: lead.assigned_to,
        })
        .select()
        .single();

      if (oppError) throw oppError;

      // Update lead status
      const { error: leadError } = await supabase
        .from("crm_leads")
        .update({ status: "convertito" })
        .eq("id", lead.id);

      if (leadError) throw leadError;

      toast({
        title: "Successo",
        description: "Lead convertito in opportunità con successo.",
      });

      if (onLeadUpdated) onLeadUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error converting to opportunity:", error);
      toast({
        title: "Errore",
        description: "Impossibile convertire il lead: " + error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Dettagli Lead
            <Badge variant={LEAD_STATUS_COLORS[lead.status] as any}>
              {LEAD_STATUS_LABELS[lead.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Dettagli</TabsTrigger>
            <TabsTrigger value="activities">
              Attività ({activities.length})
            </TabsTrigger>
            <TabsTrigger value="attribution">
              <Target className="mr-1 h-3 w-3" />
              Marketing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Info Cliente Collegato */}
            {(lead.persona_fisica_id || lead.persona_giuridica_id) && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Cliente Collegato
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Tipo: </span>
                      <Badge variant="outline">
                        {lead.persona_fisica_id
                          ? "Persona Fisica"
                          : "Persona Giuridica"}
                      </Badge>
                    </div>
                    {lead.referente_id && (
                      <div>
                        <span className="text-muted-foreground">
                          Referente ID:{" "}
                        </span>
                        <span className="font-mono text-xs">
                          {lead.referente_id}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) =>
                    setFormData({ ...formData, nome_completo: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="azienda">Azienda</Label>
                <Input
                  id="azienda"
                  value={formData.azienda}
                  onChange={(e) =>
                    setFormData({ ...formData, azienda: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ruolo">Ruolo</Label>
                <Input
                  id="ruolo"
                  value={formData.ruolo}
                  onChange={(e) =>
                    setFormData({ ...formData, ruolo: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="budget">Budget (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fonte">Fonte Lead</Label>
                <Select
                  value={formData.fonte}
                  onValueChange={(value) =>
                    setFormData({ ...formData, fonte: value })
                  }
                >
                  <SelectTrigger id="fonte">
                    <SelectValue placeholder="Seleziona fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Stato</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: CrmLead["status"]) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descrizione">Descrizione</Label>
              <Textarea
                id="descrizione"
                value={formData.descrizione}
                onChange={(e) =>
                  setFormData({ ...formData, descrizione: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="note_interne">Note Interne</Label>
              <Textarea
                id="note_interne"
                value={formData.note_interne}
                onChange={(e) =>
                  setFormData({ ...formData, note_interne: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Salvataggio..." : "Salva Modifiche"}
              </Button>

              {formData.status !== "convertito" && (
                <Button onClick={handleConvertToOpportunity} variant="outline">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Converti in Opportunità
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Nuova Attività</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={newActivity.activity_type}
                      onValueChange={(value: CrmActivity["activity_type"]) =>
                        setNewActivity({ ...newActivity, activity_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CRM_ACTIVITY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Oggetto</Label>
                    <Input
                      value={newActivity.subject}
                      onChange={(e) =>
                        setNewActivity({
                          ...newActivity,
                          subject: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Descrizione *</Label>
                  <Textarea
                    value={newActivity.description}
                    onChange={(e) =>
                      setNewActivity({
                        ...newActivity,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Esito</Label>
                  <Textarea
                    value={newActivity.outcome}
                    onChange={(e) =>
                      setNewActivity({
                        ...newActivity,
                        outcome: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>

                <Button onClick={handleAddActivity} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi Attività
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {loadingActivities ? (
                <p className="text-center text-muted-foreground py-4">
                  Caricamento attività...
                </p>
              ) : activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nessuna attività registrata
                </p>
              ) : (
                activities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">
                              {
                                CRM_ACTIVITY_TYPES.find(
                                  (t) => t.value === activity.activity_type
                                )?.label
                              }
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDateItalian(activity.activity_date)}
                            </span>
                          </div>
                          {activity.subject && (
                            <h4 className="font-semibold text-sm mb-1">
                              {activity.subject}
                            </h4>
                          )}
                          <p className="text-sm">{activity.description}</p>
                          {activity.outcome && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <strong>Esito:</strong> {activity.outcome}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="attribution" className="space-y-4 mt-4">
            {loadingAttribution ? (
              <p className="text-center text-muted-foreground py-8">
                Caricamento attribuzione...
              </p>
            ) : (
              <div className="space-y-4">
                {/* Marketing Source & Campaign */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Fonte & Campagna
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {marketingSource ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Fonte Marketing
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">
                              {marketingSource.name}
                            </Badge>
                            {marketingSource.is_paid && (
                              <Badge
                                variant="default"
                                className="bg-green-600 text-xs"
                              >
                                Paid
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {marketingSource.type.replace(/_/g, " ")}
                          </p>
                        </div>
                        {marketingSource.url && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              URL Fonte
                            </Label>
                            <a
                              href={marketingSource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              <LinkIcon className="h-3 w-3" />
                              {marketingSource.url}
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nessuna fonte marketing associata
                      </p>
                    )}

                    {marketingCampaign && (
                      <div className="pt-3 border-t">
                        <Label className="text-xs text-muted-foreground">
                          Campagna
                        </Label>
                        <div className="mt-1">
                          <p className="font-semibold">
                            {marketingCampaign.name}
                          </p>
                          {marketingCampaign.objective && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {marketingCampaign.objective}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={
                                marketingCampaign.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {marketingCampaign.status}
                            </Badge>
                            {marketingCampaign.budget_total && (
                              <span className="text-xs text-muted-foreground">
                                Budget: €
                                {marketingCampaign.budget_total.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* UTM Parameters */}
                {attribution &&
                  (attribution.utm_source ||
                    attribution.utm_medium ||
                    attribution.utm_campaign) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">
                          UTM Tracking
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {attribution.utm_source && (
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                UTM Source
                              </Label>
                              <p className="font-mono text-xs mt-1">
                                {attribution.utm_source}
                              </p>
                            </div>
                          )}
                          {attribution.utm_medium && (
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                UTM Medium
                              </Label>
                              <p className="font-mono text-xs mt-1">
                                {attribution.utm_medium}
                              </p>
                            </div>
                          )}
                          {attribution.utm_campaign && (
                            <div className="col-span-2">
                              <Label className="text-xs text-muted-foreground">
                                UTM Campaign
                              </Label>
                              <p className="font-mono text-xs mt-1">
                                {attribution.utm_campaign}
                              </p>
                            </div>
                          )}
                          {attribution.utm_content && (
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                UTM Content
                              </Label>
                              <p className="font-mono text-xs mt-1">
                                {attribution.utm_content}
                              </p>
                            </div>
                          )}
                          {attribution.utm_term && (
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                UTM Term
                              </Label>
                              <p className="font-mono text-xs mt-1">
                                {attribution.utm_term}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Context & Device */}
                {attribution && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        Contesto & Device
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {attribution.landing_page && (
                          <div className="col-span-2">
                            <Label className="text-xs text-muted-foreground">
                              Landing Page
                            </Label>
                            <a
                              href={attribution.landing_page}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 break-all"
                            >
                              <LinkIcon className="h-3 w-3 flex-shrink-0" />
                              {attribution.landing_page}
                            </a>
                          </div>
                        )}
                        {attribution.referrer && (
                          <div className="col-span-2">
                            <Label className="text-xs text-muted-foreground">
                              Referrer
                            </Label>
                            <p className="text-xs mt-1 break-all">
                              {attribution.referrer}
                            </p>
                          </div>
                        )}
                        {attribution.device_type && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Device
                            </Label>
                            <p className="text-xs mt-1 capitalize">
                              {attribution.device_type}
                            </p>
                          </div>
                        )}
                        {attribution.browser && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Browser
                            </Label>
                            <p className="text-xs mt-1">
                              {attribution.browser}
                            </p>
                          </div>
                        )}
                        {attribution.os && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              OS
                            </Label>
                            <p className="text-xs mt-1">{attribution.os}</p>
                          </div>
                        )}
                        {attribution.country && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Paese
                            </Label>
                            <p className="text-xs mt-1">
                              {attribution.country}
                            </p>
                          </div>
                        )}
                        {attribution.first_touch_date && (
                          <div className="col-span-2">
                            <Label className="text-xs text-muted-foreground">
                              First Touch
                            </Label>
                            <p className="text-xs mt-1">
                              {formatDateItalian(attribution.first_touch_date)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!attribution && !marketingSource && (
                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        Nessuna attribuzione marketing disponibile per questo
                        lead.
                      </p>
                      <p className="text-xs mt-1">
                        I lead creati tramite <code>/api/lead/intake</code>{" "}
                        hanno attribuzione automatica.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
