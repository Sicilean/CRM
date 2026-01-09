"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  Palette,
  Server,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ServiceMappingsManagerProps {
  serviceId: string;
  serviceName?: string;
  serviceType?: string; // software, brand, managed_service
}

export default function ServiceMappingsManager({
  serviceId,
  serviceName,
  serviceType,
}: ServiceMappingsManagerProps) {
  const supabase = createClient();

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [loading, setLoading] = useState(true);
  const [requirementsMappings, setRequirementsMappings] = useState<any[]>([]);
  const [brandAssetsMappings, setBrandAssetsMappings] = useState<any[]>([]);
  const [managedServicesMappings, setManagedServicesMappings] = useState<any[]>(
    []
  );

  // Form states per Requirements
  const [reqForm, setReqForm] = useState({
    requirement_name: "",
    requirement_description: "",
    requirement_category: "frontend",
    requirement_priority: "media",
    moscow_priority: "must",
    stima_ore: 0,
    display_order: 0,
  });
  const [editingReqId, setEditingReqId] = useState<string | null>(null);

  // Form states per Brand Assets
  const [brandForm, setBrandForm] = useState({
    asset_name: "",
    asset_descrizione: "",
    categoria: "logo",
    formati_richiesti: [] as string[],
    quantita: 1,
    display_order: 0,
  });
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);

  // Form states per Managed Services
  const [managedForm, setManagedForm] = useState({
    service_nome: "",
    service_descrizione: "",
    service_tipo: "hosting",
    canone_mensile: 0,
    rinnovo_periodicita: "",
    giorni_offset_da_contratto: 0,
    rinnovo_automatico: true,
    display_order: 0,
  });
  const [editingManagedId, setEditingManagedId] = useState<string | null>(null);

  // ========================================
  // LOAD DATA
  // ========================================

  const loadMappings = useCallback(async () => {
    setLoading(true);

    // Load Requirements
    const { data: reqData } = await supabase
      .from("service_to_requirements_mapping")
      .select("*")
      .eq("service_id", serviceId)
      .order("display_order", { ascending: true });

    // Load Brand Assets
    const { data: brandData } = await supabase
      .from("service_to_brand_assets_mapping")
      .select("*")
      .eq("service_id", serviceId)
      .order("display_order", { ascending: true});

    // Load Managed Services
    const { data: managedData } = await supabase
      .from("service_to_managed_services_mapping")
      .select("*")
      .eq("service_id", serviceId)
      .order("display_order", { ascending: true });

    setRequirementsMappings(reqData || []);
    setBrandAssetsMappings(brandData || []);
    setManagedServicesMappings(managedData || []);
    setLoading(false);
  }, [serviceId, supabase]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  // ========================================
  // REQUIREMENTS CRUD
  // ========================================

  const handleSaveRequirement = async () => {
    if (!reqForm.requirement_name) {
      alert("Nome requirement obbligatorio");
      return;
    }

    const dataToSave = {
      service_id: serviceId,
      ...reqForm,
    };

    try {
      if (editingReqId) {
        const { error } = await supabase
          .from("service_to_requirements_mapping")
          .update(dataToSave)
          .eq("id", editingReqId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("service_to_requirements_mapping")
          .insert([dataToSave]);
        if (error) throw error;
      }

      resetReqForm();
      loadMappings();
    } catch (error: any) {
      alert("Errore: " + error.message);
    }
  };

  const handleEditRequirement = (mapping: any) => {
    setReqForm({
      requirement_name: mapping.requirement_name,
      requirement_description: mapping.requirement_description || "",
      requirement_category: mapping.requirement_category || "frontend",
      requirement_priority: mapping.requirement_priority || "media",
      moscow_priority: mapping.moscow_priority || "must",
      stima_ore: mapping.stima_ore || 0,
      display_order: mapping.display_order || 0,
    });
    setEditingReqId(mapping.id);
  };

  const handleDeleteRequirement = async (id: string) => {
    if (!confirm("Eliminare questo requisito?")) return;

    const { error } = await supabase
      .from("service_to_requirements_mapping")
      .delete()
      .eq("id", id);

    if (!error) {
      loadMappings();
    } else {
      alert("Errore eliminazione: " + error.message);
    }
  };

  const resetReqForm = () => {
    setReqForm({
      requirement_name: "",
      requirement_description: "",
      requirement_category: "frontend",
      requirement_priority: "media",
      moscow_priority: "must",
      stima_ore: 0,
      display_order: 0,
    });
    setEditingReqId(null);
  };

  // ========================================
  // BRAND ASSETS CRUD
  // ========================================

  const handleSaveBrandAsset = async () => {
    if (!brandForm.asset_name) {
      alert("Nome asset obbligatorio");
      return;
    }

    const dataToSave = {
      service_id: serviceId,
      ...brandForm,
    };

    try {
      if (editingBrandId) {
        const { error } = await supabase
          .from("service_to_brand_assets_mapping")
          .update(dataToSave)
          .eq("id", editingBrandId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("service_to_brand_assets_mapping")
          .insert([dataToSave]);
        if (error) throw error;
      }

      resetBrandForm();
      loadMappings();
    } catch (error: any) {
      alert("Errore: " + error.message);
    }
  };

  const handleEditBrandAsset = (mapping: any) => {
    setBrandForm({
      asset_name: mapping.asset_name,
      asset_descrizione: mapping.asset_descrizione || "",
      categoria: mapping.categoria || "logo",
      formati_richiesti: mapping.formati_richiesti || [],
      quantita: mapping.quantita || 1,
      display_order: mapping.display_order || 0,
    });
    setEditingBrandId(mapping.id);
  };

  const handleDeleteBrandAsset = async (id: string) => {
    if (!confirm("Eliminare questo asset?")) return;

    const { error } = await supabase
      .from("service_to_brand_assets_mapping")
      .delete()
      .eq("id", id);

    if (!error) {
      loadMappings();
    } else {
      alert("Errore eliminazione: " + error.message);
    }
  };

  const resetBrandForm = () => {
    setBrandForm({
      asset_name: "",
      asset_descrizione: "",
      categoria: "logo",
      formati_richiesti: [],
      quantita: 1,
      display_order: 0,
    });
    setEditingBrandId(null);
  };

  // ========================================
  // MANAGED SERVICES CRUD
  // ========================================

  const handleSaveManagedService = async () => {
    if (!managedForm.service_nome) {
      alert("Nome servizio obbligatorio");
      return;
    }

    const dataToSave = {
      service_id: serviceId,
      ...managedForm,
    };

    try {
      if (editingManagedId) {
        const { error } = await supabase
          .from("service_to_managed_services_mapping")
          .update(dataToSave)
          .eq("id", editingManagedId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("service_to_managed_services_mapping")
          .insert([dataToSave]);
        if (error) throw error;
      }

      resetManagedForm();
      loadMappings();
    } catch (error: any) {
      alert("Errore: " + error.message);
    }
  };

  const handleEditManagedService = (mapping: any) => {
    setManagedForm({
      service_nome: mapping.service_nome,
      service_descrizione: mapping.service_descrizione || "",
      service_tipo: mapping.service_tipo || "hosting",
      canone_mensile: mapping.canone_mensile || 0,
      rinnovo_periodicita: mapping.rinnovo_periodicita || "",
      giorni_offset_da_contratto: mapping.giorni_offset_da_contratto || 0,
      rinnovo_automatico: mapping.rinnovo_automatico !== false,
      display_order: mapping.display_order || 0,
    });
    setEditingManagedId(mapping.id);
  };

  const handleDeleteManagedService = async (id: string) => {
    if (!confirm("Eliminare questo servizio gestito?")) return;

    const { error } = await supabase
      .from("service_to_managed_services_mapping")
      .delete()
      .eq("id", id);

    if (!error) {
      loadMappings();
    } else {
      alert("Errore eliminazione: " + error.message);
    }
  };

  const resetManagedForm = () => {
    setManagedForm({
      service_nome: "",
      service_descrizione: "",
      service_tipo: "hosting",
      canone_mensile: 0,
      rinnovo_periodicita: "",
      giorni_offset_da_contratto: 0,
      rinnovo_automatico: true,
      display_order: 0,
    });
    setEditingManagedId(null);
  };

  // ========================================
  // RENDER
  // ========================================

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Caricamento mapping...
      </div>
    );
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 Output Operativi - Auto-Generazione
        </CardTitle>
        <CardDescription>
          Configura cosa viene generato automaticamente quando questo servizio
          viene convertito da offerta a progetto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="ml-2 text-blue-900 text-sm">
            <strong>Sistema Quote → Project</strong>: Quando un cliente firma un
            preventivo, questi mapping determinano quali requisiti, materiali
            brand e servizi gestiti vengono creati automaticamente nel progetto.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="requirements" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requirements">
              <Code className="mr-2 h-4 w-4" />
              Requisiti ({requirementsMappings.length})
            </TabsTrigger>
            <TabsTrigger value="brand_assets">
              <Palette className="mr-2 h-4 w-4" />
              Brand Assets ({brandAssetsMappings.length})
            </TabsTrigger>
            <TabsTrigger value="managed_services">
              <Server className="mr-2 h-4 w-4" />
              Servizi Gestiti ({managedServicesMappings.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB: Requirements */}
          <TabsContent value="requirements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Requisiti Funzionali Software
                </CardTitle>
                <CardDescription className="text-xs">
                  Requisiti tecnici che verranno aggiunti al progetto software
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Form Add/Edit */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-3 border-2 border-dashed">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Nome Requirement *</Label>
                      <Input
                        value={reqForm.requirement_name}
                        onChange={(e) =>
                          setReqForm({
                            ...reqForm,
                            requirement_name: e.target.value,
                          })
                        }
                        placeholder="es. Blog Post Listing Page"
                      />
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Select
                        value={reqForm.requirement_category}
                        onValueChange={(value) =>
                          setReqForm({
                            ...reqForm,
                            requirement_category: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frontend">Frontend</SelectItem>
                          <SelectItem value="backend">Backend</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="integrazione">
                            Integrazione
                          </SelectItem>
                          <SelectItem value="ui_ux">UI/UX</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="performance">
                            Performance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Descrizione</Label>
                    <Textarea
                      value={reqForm.requirement_description}
                      onChange={(e) =>
                        setReqForm({
                          ...reqForm,
                          requirement_description: e.target.value,
                        })
                      }
                      placeholder="Descrizione dettagliata..."
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <Label>Priorità</Label>
                      <Select
                        value={reqForm.requirement_priority}
                        onValueChange={(value) =>
                          setReqForm({
                            ...reqForm,
                            requirement_priority: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bassa">Bassa</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>MoSCoW</Label>
                      <Select
                        value={reqForm.moscow_priority}
                        onValueChange={(value) =>
                          setReqForm({ ...reqForm, moscow_priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="must">Must</SelectItem>
                          <SelectItem value="should">Should</SelectItem>
                          <SelectItem value="could">Could</SelectItem>
                          <SelectItem value="wont">Won&apos;t</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Stima Ore</Label>
                      <Input
                        type="number"
                        value={reqForm.stima_ore}
                        onChange={(e) =>
                          setReqForm({
                            ...reqForm,
                            stima_ore: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Ordine</Label>
                      <Input
                        type="number"
                        value={reqForm.display_order}
                        onChange={(e) =>
                          setReqForm({
                            ...reqForm,
                            display_order: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveRequirement}>
                      <Plus className="mr-2 h-4 w-4" />
                      {editingReqId ? "Aggiorna" : "Aggiungi"}
                    </Button>
                    {editingReqId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetReqForm}
                      >
                        Annulla
                      </Button>
                    )}
                  </div>
                </div>

                {/* List */}
                <div className="space-y-2">
                  {requirementsMappings.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      Nessun requisito configurato. Aggiungi il primo!
                    </div>
                  ) : (
                    requirementsMappings.map((mapping) => (
                      <div
                        key={mapping.id}
                        className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">
                              {mapping.requirement_name}
                            </div>
                            {mapping.requirement_description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {mapping.requirement_description}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {mapping.requirement_category}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {mapping.requirement_priority}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {mapping.moscow_priority}
                              </Badge>
                              {mapping.stima_ore > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {mapping.stima_ore}h
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-3">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditRequirement(mapping)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                handleDeleteRequirement(mapping.id)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Brand Assets */}
          <TabsContent value="brand_assets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Materiali Brand</CardTitle>
                <CardDescription className="text-xs">
                  Materiali grafici che verranno aggiunti al brand kit del
                  progetto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Form Add/Edit */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-3 border-2 border-dashed">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Nome Asset *</Label>
                      <Input
                        value={brandForm.asset_name}
                        onChange={(e) =>
                          setBrandForm({
                            ...brandForm,
                            asset_name: e.target.value,
                          })
                        }
                        placeholder="es. Logo Vettoriale Principale"
                      />
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Select
                        value={brandForm.categoria}
                        onValueChange={(value) =>
                          setBrandForm({ ...brandForm, categoria: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="logo">Logo</SelectItem>
                          <SelectItem value="palette">Palette</SelectItem>
                          <SelectItem value="typography">Typography</SelectItem>
                          <SelectItem value="images">Images</SelectItem>
                          <SelectItem value="documents">Documents</SelectItem>
                          <SelectItem value="templates">Templates</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Descrizione</Label>
                    <Textarea
                      value={brandForm.asset_descrizione}
                      onChange={(e) =>
                        setBrandForm({
                          ...brandForm,
                          asset_descrizione: e.target.value,
                        })
                      }
                      placeholder="Descrizione asset..."
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <Label>Formati (separati da virgola)</Label>
                      <Input
                        value={brandForm.formati_richiesti.join(", ")}
                        onChange={(e) =>
                          setBrandForm({
                            ...brandForm,
                            formati_richiesti: e.target.value
                              .split(",")
                              .map((f) => f.trim())
                              .filter((f) => f),
                          })
                        }
                        placeholder="SVG, PNG, PDF"
                      />
                    </div>

                    <div>
                      <Label>Quantità</Label>
                      <Input
                        type="number"
                        value={brandForm.quantita}
                        onChange={(e) =>
                          setBrandForm({
                            ...brandForm,
                            quantita: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Ordine</Label>
                      <Input
                        type="number"
                        value={brandForm.display_order}
                        onChange={(e) =>
                          setBrandForm({
                            ...brandForm,
                            display_order: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveBrandAsset}>
                      <Plus className="mr-2 h-4 w-4" />
                      {editingBrandId ? "Aggiorna" : "Aggiungi"}
                    </Button>
                    {editingBrandId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetBrandForm}
                      >
                        Annulla
                      </Button>
                    )}
                  </div>
                </div>

                {/* List */}
                <div className="space-y-2">
                  {brandAssetsMappings.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      Nessun asset configurato. Aggiungi il primo!
                    </div>
                  ) : (
                    brandAssetsMappings.map((mapping) => (
                      <div
                        key={mapping.id}
                        className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">
                              {mapping.asset_name}
                            </div>
                            {mapping.asset_descrizione && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {mapping.asset_descrizione}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {mapping.categoria}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Qty: {mapping.quantita}
                              </Badge>
                              {mapping.formati_richiesti &&
                                mapping.formati_richiesti.length > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {mapping.formati_richiesti.join(", ")}
                                  </Badge>
                                )}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-3">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditBrandAsset(mapping)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteBrandAsset(mapping.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Managed Services */}
          <TabsContent value="managed_services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Servizi Gestiti</CardTitle>
                <CardDescription className="text-xs">
                  Servizi ricorrenti che verranno creati per il cliente
                  (hosting, domini, ssl, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Form Add/Edit */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-3 border-2 border-dashed">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Nome Servizio *</Label>
                      <Input
                        value={managedForm.service_nome}
                        onChange={(e) =>
                          setManagedForm({
                            ...managedForm,
                            service_nome: e.target.value,
                          })
                        }
                        placeholder="es. Hosting WordPress"
                      />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Select
                        value={managedForm.service_tipo}
                        onValueChange={(value) =>
                          setManagedForm({
                            ...managedForm,
                            service_tipo: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hosting">Hosting</SelectItem>
                          <SelectItem value="domain">Domain</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="backup">Backup</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="maintenance">
                            Maintenance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Descrizione</Label>
                    <Textarea
                      value={managedForm.service_descrizione}
                      onChange={(e) =>
                        setManagedForm({
                          ...managedForm,
                          service_descrizione: e.target.value,
                        })
                      }
                      placeholder="Descrizione servizio..."
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <Label>Canone Mensile (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={managedForm.canone_mensile}
                        onChange={(e) =>
                          setManagedForm({
                            ...managedForm,
                            canone_mensile: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Periodicità</Label>
                      <Input
                        value={managedForm.rinnovo_periodicita || ""}
                        onChange={(e) =>
                          setManagedForm({
                            ...managedForm,
                            rinnovo_periodicita: e.target.value,
                          })
                        }
                        placeholder="mensile"
                      />
                    </div>

                    <div>
                      <Label>Offset Giorni</Label>
                      <Input
                        type="number"
                        value={managedForm.giorni_offset_da_contratto}
                        onChange={(e) =>
                          setManagedForm({
                            ...managedForm,
                            giorni_offset_da_contratto:
                              parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Ordine</Label>
                      <Input
                        type="number"
                        value={managedForm.display_order}
                        onChange={(e) =>
                          setManagedForm({
                            ...managedForm,
                            display_order: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="rinnovo_auto"
                      checked={managedForm.rinnovo_automatico}
                      onCheckedChange={(checked) =>
                        setManagedForm({
                          ...managedForm,
                          rinnovo_automatico: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="rinnovo_auto" className="cursor-pointer">
                      Rinnovo Automatico
                    </Label>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveManagedService}>
                      <Plus className="mr-2 h-4 w-4" />
                      {editingManagedId ? "Aggiorna" : "Aggiungi"}
                    </Button>
                    {editingManagedId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetManagedForm}
                      >
                        Annulla
                      </Button>
                    )}
                  </div>
                </div>

                {/* List */}
                <div className="space-y-2">
                  {managedServicesMappings.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      Nessun servizio gestito configurato. Aggiungi il primo!
                    </div>
                  ) : (
                    managedServicesMappings.map((mapping) => (
                      <div
                        key={mapping.id}
                        className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">
                              {mapping.service_nome}
                            </div>
                            {mapping.service_descrizione && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {mapping.service_descrizione}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {mapping.service_tipo}
                              </Badge>
                              {mapping.canone_mensile > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  €{mapping.canone_mensile}/mese
                                </Badge>
                              )}
                              {mapping.rinnovo_periodicita &&
                                mapping.rinnovo_periodicita.length > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {mapping.rinnovo_periodicita}
                                  </Badge>
                                )}
                              {mapping.rinnovo_automatico && (
                                <Badge variant="secondary" className="text-xs">
                                  Auto-rinnovo
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-3">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditManagedService(mapping)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                handleDeleteManagedService(mapping.id)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
