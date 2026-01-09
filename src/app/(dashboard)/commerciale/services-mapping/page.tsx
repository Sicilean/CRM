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
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Code,
  Palette,
  Server,
  Plus,
  AlertCircle,
  Edit,
  Trash2,
  Search,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Pagina Commerciale: Gestione Mapping Servizi → Output Operativi
 *
 * Permette di configurare:
 * - service_to_requirements_mapping (servizi → requisiti software)
 * - service_to_brand_assets_mapping (servizi → materiali brand)
 * - service_to_managed_services_mapping (servizi → servizi gestiti)
 */
export default function ServicesMappingAdminPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [requirementsMappings, setRequirementsMappings] = useState<any[]>([]);
  const [brandAssetsMappings, setBrandAssetsMappings] = useState<any[]>([]);
  const [managedServicesMappings, setManagedServicesMappings] = useState<any[]>(
    []
  );

  // Dialog states
  const [requirementDialogOpen, setRequirementDialogOpen] = useState(false);
  const [brandAssetDialogOpen, setBrandAssetDialogOpen] = useState(false);
  const [managedServiceDialogOpen, setManagedServiceDialogOpen] =
    useState(false);

  // Edit mode states
  const [editingRequirement, setEditingRequirement] = useState<any>(null);
  const [editingBrandAsset, setEditingBrandAsset] = useState<any>(null);
  const [editingManagedService, setEditingManagedService] = useState<any>(null);

  // Filter state
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [requirementForm, setRequirementForm] = useState({
    service_id: "",
    requirement_name: "",
    requirement_description: "",
    requirement_category: "frontend",
    requirement_priority: "media",
    moscow_priority: "must",
    stima_ore: 0,
    display_order: 0,
  });

  const [brandAssetForm, setBrandAssetForm] = useState({
    service_id: "",
    asset_name: "",
    asset_descrizione: "",
    categoria: "logo",
    formati_richiesti: [] as string[],
    quantita: 1,
    display_order: 0,
  });

  const [managedServiceForm, setManagedServiceForm] = useState({
    service_id: "",
    service_nome: "",
    service_descrizione: "",
    service_tipo: "hosting",
    canone_mensile: 0,
    rinnovo_periodicita: "",
    giorni_offset_da_contratto: 0,
    rinnovo_automatico: true,
    display_order: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);

    // Carica tutti i servizi
    const { data: servicesData } = await supabase
      .from("services")
      .select("*")
      .order("name", { ascending: true });

    // Carica tutti i mapping
    const { data: reqMappings } = await supabase
      .from("service_to_requirements_mapping")
      .select("*, services(name)")
      .order("display_order", { ascending: true });

    const { data: brandMappings } = await supabase
      .from("service_to_brand_assets_mapping")
      .select("*, services(name)")
      .order("display_order", { ascending: true });

    const { data: managedMappings } = await supabase
      .from("service_to_managed_services_mapping")
      .select("*, services(name)")
      .order("display_order", { ascending: true });

    setServices(servicesData || []);
    setRequirementsMappings(reqMappings || []);
    setBrandAssetsMappings(brandMappings || []);
    setManagedServicesMappings(managedMappings || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ========================================
  // CRUD FUNCTIONS - Requirements
  // ========================================

  const openRequirementDialog = (mapping: any = null) => {
    if (mapping) {
      setEditingRequirement(mapping);
      setRequirementForm({
        service_id: mapping.service_id,
        requirement_name: mapping.requirement_name,
        requirement_description: mapping.requirement_description || "",
        requirement_category: mapping.requirement_category || "frontend",
        requirement_priority: mapping.requirement_priority || "media",
        moscow_priority: mapping.moscow_priority || "must",
        stima_ore: mapping.stima_ore || 0,
        display_order: mapping.display_order || 0,
      });
    } else {
      setEditingRequirement(null);
      setRequirementForm({
        service_id: "",
        requirement_name: "",
        requirement_description: "",
        requirement_category: "frontend",
        requirement_priority: "media",
        moscow_priority: "must",
        stima_ore: 0,
        display_order: 0,
      });
    }
    setRequirementDialogOpen(true);
  };

  const handleSaveRequirement = async () => {
    if (!requirementForm.service_id || !requirementForm.requirement_name) {
      toast({
        title: "Errore",
        description: "Servizio e nome requirement sono obbligatori",
        variant: "destructive",
      });
      return;
    }

    let error;
    if (editingRequirement) {
      // Update
      const { error: updateError } = await (
        supabase.from("service_to_requirements_mapping") as any
      )
        .update(requirementForm)
        .eq("id", editingRequirement.id);
      error = updateError;
    } else {
      // Insert
      const { error: insertError } = await (
        supabase.from("service_to_requirements_mapping") as any
      ).insert([requirementForm]);
      error = insertError;
    }

    if (error) {
      toast({
        title: "Errore",
        description: `Impossibile salvare: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo!",
        description: editingRequirement
          ? "Requirement aggiornato"
          : "Requirement creato",
      });
      setRequirementDialogOpen(false);
      setEditingRequirement(null);
      loadData();
    }
  };

  const handleDeleteRequirement = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo mapping?")) return;

    const { error } = await supabase
      .from("service_to_requirements_mapping")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Errore",
        description: `Impossibile eliminare: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Eliminato",
        description: "Mapping eliminato con successo",
      });
      loadData();
    }
  };

  // ========================================
  // CRUD FUNCTIONS - Brand Assets
  // ========================================

  const openBrandAssetDialog = (mapping: any = null) => {
    if (mapping) {
      setEditingBrandAsset(mapping);
      setBrandAssetForm({
        service_id: mapping.service_id,
        asset_name: mapping.asset_name,
        asset_descrizione: mapping.asset_descrizione || "",
        categoria: mapping.categoria || "logo",
        formati_richiesti: mapping.formati_richiesti || [],
        quantita: mapping.quantita || 1,
        display_order: mapping.display_order || 0,
      });
    } else {
      setEditingBrandAsset(null);
      setBrandAssetForm({
        service_id: "",
        asset_name: "",
        asset_descrizione: "",
        categoria: "logo",
        formati_richiesti: [],
        quantita: 1,
        display_order: 0,
      });
    }
    setBrandAssetDialogOpen(true);
  };

  const handleSaveBrandAsset = async () => {
    if (!brandAssetForm.service_id || !brandAssetForm.asset_name) {
      toast({
        title: "Errore",
        description: "Servizio e nome asset sono obbligatori",
        variant: "destructive",
      });
      return;
    }

    let error;
    if (editingBrandAsset) {
      const { error: updateError } = await (
        supabase.from("service_to_brand_assets_mapping") as any
      )
        .update(brandAssetForm)
        .eq("id", editingBrandAsset.id);
      error = updateError;
    } else {
      const { error: insertError } = await (
        supabase.from("service_to_brand_assets_mapping") as any
      ).insert([brandAssetForm]);
      error = insertError;
    }

    if (error) {
      toast({
        title: "Errore",
        description: `Impossibile salvare: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo!",
        description: editingBrandAsset
          ? "Brand asset aggiornato"
          : "Brand asset creato",
      });
      setBrandAssetDialogOpen(false);
      setEditingBrandAsset(null);
      loadData();
    }
  };

  const handleDeleteBrandAsset = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo mapping?")) return;

    const { error } = await supabase
      .from("service_to_brand_assets_mapping")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Errore",
        description: `Impossibile eliminare: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Eliminato",
        description: "Mapping eliminato con successo",
      });
      loadData();
    }
  };

  // ========================================
  // CRUD FUNCTIONS - Managed Services
  // ========================================

  const openManagedServiceDialog = (mapping: any = null) => {
    if (mapping) {
      setEditingManagedService(mapping);
      setManagedServiceForm({
        service_id: mapping.service_id,
        service_nome: mapping.service_nome,
        service_descrizione: mapping.service_descrizione || "",
        service_tipo: mapping.service_tipo || "hosting",
        canone_mensile: mapping.canone_mensile || 0,
        rinnovo_periodicita: mapping.rinnovo_periodicita || "",
        giorni_offset_da_contratto: mapping.giorni_offset_da_contratto || 0,
        rinnovo_automatico: mapping.rinnovo_automatico !== false,
        display_order: mapping.display_order || 0,
      });
    } else {
      setEditingManagedService(null);
      setManagedServiceForm({
        service_id: "",
        service_nome: "",
        service_descrizione: "",
        service_tipo: "hosting",
        canone_mensile: 0,
        rinnovo_periodicita: "",
        giorni_offset_da_contratto: 0,
        rinnovo_automatico: true,
        display_order: 0,
      });
    }
    setManagedServiceDialogOpen(true);
  };

  const handleSaveManagedService = async () => {
    if (!managedServiceForm.service_id || !managedServiceForm.service_nome) {
      toast({
        title: "Errore",
        description: "Servizio e nome servizio gestito sono obbligatori",
        variant: "destructive",
      });
      return;
    }

    let error;
    if (editingManagedService) {
      const { error: updateError } = await (
        supabase.from("service_to_managed_services_mapping") as any
      )
        .update(managedServiceForm)
        .eq("id", editingManagedService.id);
      error = updateError;
    } else {
      const { error: insertError } = await (
        supabase.from("service_to_managed_services_mapping") as any
      ).insert([managedServiceForm]);
      error = insertError;
    }

    if (error) {
      toast({
        title: "Errore",
        description: `Impossibile salvare: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo!",
        description: editingManagedService
          ? "Servizio gestito aggiornato"
          : "Servizio gestito creato",
      });
      setManagedServiceDialogOpen(false);
      setEditingManagedService(null);
      loadData();
    }
  };

  const handleDeleteManagedService = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo mapping?")) return;

    const { error } = await supabase
      .from("service_to_managed_services_mapping")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Errore",
        description: `Impossibile eliminare: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Eliminato",
        description: "Mapping eliminato con successo",
      });
      loadData();
    }
  };

  // ========================================
  // FILTER LOGIC
  // ========================================

  const filteredRequirementsMappings = requirementsMappings.filter((m) => {
    if (
      serviceFilter &&
      serviceFilter !== "all" &&
      m.service_id !== serviceFilter
    )
      return false;
    if (
      searchQuery &&
      !m.requirement_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const filteredBrandAssetsMappings = brandAssetsMappings.filter((m) => {
    if (
      serviceFilter &&
      serviceFilter !== "all" &&
      m.service_id !== serviceFilter
    )
      return false;
    if (
      searchQuery &&
      !m.asset_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const filteredManagedServicesMappings = managedServicesMappings.filter(
    (m) => {
      if (
        serviceFilter &&
        serviceFilter !== "all" &&
        m.service_id !== serviceFilter
      )
        return false;
      if (
        searchQuery &&
        !m.service_nome.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* ========================================
          DIALOG: Requirements
          ======================================== */}
      <Dialog
        open={requirementDialogOpen}
        onOpenChange={setRequirementDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRequirement
                ? "Modifica Requirement"
                : "Aggiungi Requirement"}
            </DialogTitle>
            <DialogDescription>
              Configura un requisito funzionale che verrà generato
              automaticamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="req-service">Servizio *</Label>
              <Select
                value={requirementForm.service_id}
                onValueChange={(value) =>
                  setRequirementForm({ ...requirementForm, service_id: value })
                }
              >
                <SelectTrigger id="req-service">
                  <SelectValue placeholder="Seleziona servizio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="req-name">Nome Requirement *</Label>
              <Input
                id="req-name"
                value={requirementForm.requirement_name}
                onChange={(e) =>
                  setRequirementForm({
                    ...requirementForm,
                    requirement_name: e.target.value,
                  })
                }
                placeholder="es. Blog Post Listing Page"
              />
            </div>

            <div>
              <Label htmlFor="req-desc">Descrizione</Label>
              <Textarea
                id="req-desc"
                value={requirementForm.requirement_description}
                onChange={(e) =>
                  setRequirementForm({
                    ...requirementForm,
                    requirement_description: e.target.value,
                  })
                }
                placeholder="Descrizione dettagliata del requisito..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="req-category">Categoria</Label>
                <Select
                  value={requirementForm.requirement_category}
                  onValueChange={(value) =>
                    setRequirementForm({
                      ...requirementForm,
                      requirement_category: value,
                    })
                  }
                >
                  <SelectTrigger id="req-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="req-priority">Priorità</Label>
                <Select
                  value={requirementForm.requirement_priority}
                  onValueChange={(value) =>
                    setRequirementForm({
                      ...requirementForm,
                      requirement_priority: value,
                    })
                  }
                >
                  <SelectTrigger id="req-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="bassa">Bassa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="req-moscow">MoSCoW Priority</Label>
                <Select
                  value={requirementForm.moscow_priority}
                  onValueChange={(value) =>
                    setRequirementForm({
                      ...requirementForm,
                      moscow_priority: value,
                    })
                  }
                >
                  <SelectTrigger id="req-moscow">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="must">Must Have</SelectItem>
                    <SelectItem value="should">Should Have</SelectItem>
                    <SelectItem value="could">Could Have</SelectItem>
                    <SelectItem value="wont">Won&apos;t Have</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="req-hours">Stima Ore</Label>
                <Input
                  id="req-hours"
                  type="number"
                  value={requirementForm.stima_ore}
                  onChange={(e) =>
                    setRequirementForm({
                      ...requirementForm,
                      stima_ore: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="req-order">Ordine Visualizzazione</Label>
              <Input
                id="req-order"
                type="number"
                value={requirementForm.display_order}
                onChange={(e) =>
                  setRequirementForm({
                    ...requirementForm,
                    display_order: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRequirementDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button onClick={handleSaveRequirement}>
              <Plus className="mr-2 h-4 w-4" />
              {editingRequirement ? "Aggiorna" : "Crea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================
          DIALOG: Brand Assets
          ======================================== */}
      <Dialog
        open={brandAssetDialogOpen}
        onOpenChange={setBrandAssetDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBrandAsset
                ? "Modifica Brand Asset"
                : "Aggiungi Brand Asset"}
            </DialogTitle>
            <DialogDescription>
              Configura un materiale brand che verrà generato automaticamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ba-service">Servizio *</Label>
              <Select
                value={brandAssetForm.service_id}
                onValueChange={(value) =>
                  setBrandAssetForm({ ...brandAssetForm, service_id: value })
                }
              >
                <SelectTrigger id="ba-service">
                  <SelectValue placeholder="Seleziona servizio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ba-name">Nome Asset *</Label>
              <Input
                id="ba-name"
                value={brandAssetForm.asset_name}
                onChange={(e) =>
                  setBrandAssetForm({
                    ...brandAssetForm,
                    asset_name: e.target.value,
                  })
                }
                placeholder="es. Logo Vector Principal"
              />
            </div>

            <div>
              <Label htmlFor="ba-desc">Descrizione</Label>
              <Textarea
                id="ba-desc"
                value={brandAssetForm.asset_descrizione}
                onChange={(e) =>
                  setBrandAssetForm({
                    ...brandAssetForm,
                    asset_descrizione: e.target.value,
                  })
                }
                placeholder="Descrizione dell'asset..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ba-categoria">Categoria</Label>
                <Select
                  value={brandAssetForm.categoria}
                  onValueChange={(value) =>
                    setBrandAssetForm({ ...brandAssetForm, categoria: value })
                  }
                >
                  <SelectTrigger id="ba-categoria">
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

              <div>
                <Label htmlFor="ba-quantita">Quantità</Label>
                <Input
                  id="ba-quantita"
                  type="number"
                  value={brandAssetForm.quantita}
                  onChange={(e) =>
                    setBrandAssetForm({
                      ...brandAssetForm,
                      quantita: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ba-formati">
                Formati Richiesti (separati da virgola)
              </Label>
              <Input
                id="ba-formati"
                value={brandAssetForm.formati_richiesti.join(", ")}
                onChange={(e) =>
                  setBrandAssetForm({
                    ...brandAssetForm,
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
              <Label htmlFor="ba-order">Ordine Visualizzazione</Label>
              <Input
                id="ba-order"
                type="number"
                value={brandAssetForm.display_order}
                onChange={(e) =>
                  setBrandAssetForm({
                    ...brandAssetForm,
                    display_order: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBrandAssetDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button onClick={handleSaveBrandAsset}>
              <Plus className="mr-2 h-4 w-4" />
              {editingBrandAsset ? "Aggiorna" : "Crea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================
          DIALOG: Managed Services
          ======================================== */}
      <Dialog
        open={managedServiceDialogOpen}
        onOpenChange={setManagedServiceDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingManagedService
                ? "Modifica Servizio Gestito"
                : "Aggiungi Servizio Gestito"}
            </DialogTitle>
            <DialogDescription>
              Configura un servizio gestito che verrà creato automaticamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ms-service">Servizio *</Label>
              <Select
                value={managedServiceForm.service_id}
                onValueChange={(value) =>
                  setManagedServiceForm({
                    ...managedServiceForm,
                    service_id: value,
                  })
                }
              >
                <SelectTrigger id="ms-service">
                  <SelectValue placeholder="Seleziona servizio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ms-nome">Nome Servizio Gestito *</Label>
              <Input
                id="ms-nome"
                value={managedServiceForm.service_nome}
                onChange={(e) =>
                  setManagedServiceForm({
                    ...managedServiceForm,
                    service_nome: e.target.value,
                  })
                }
                placeholder="es. Hosting WordPress"
              />
            </div>

            <div>
              <Label htmlFor="ms-desc">Descrizione</Label>
              <Textarea
                id="ms-desc"
                value={managedServiceForm.service_descrizione}
                onChange={(e) =>
                  setManagedServiceForm({
                    ...managedServiceForm,
                    service_descrizione: e.target.value,
                  })
                }
                placeholder="Descrizione del servizio..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ms-tipo">Tipo</Label>
                <Select
                  value={managedServiceForm.service_tipo}
                  onValueChange={(value) =>
                    setManagedServiceForm({
                      ...managedServiceForm,
                      service_tipo: value,
                    })
                  }
                >
                  <SelectTrigger id="ms-tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hosting">Hosting</SelectItem>
                    <SelectItem value="domain">Domain</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="backup">Backup</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ms-canone">Canone Mensile (€)</Label>
                <Input
                  id="ms-canone"
                  type="number"
                  step="0.01"
                  value={managedServiceForm.canone_mensile}
                  onChange={(e) =>
                    setManagedServiceForm({
                      ...managedServiceForm,
                      canone_mensile: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ms-periodicita">
                  Periodicità Rinnovo
                </Label>
                <Input
                  id="ms-periodicita"
                  value={managedServiceForm.rinnovo_periodicita || ""}
                  onChange={(e) =>
                    setManagedServiceForm({
                      ...managedServiceForm,
                      rinnovo_periodicita: e.target.value,
                    })
                  }
                  placeholder="mensile"
                />
              </div>

              <div>
                <Label htmlFor="ms-offset">Giorni Offset da Contratto</Label>
                <Input
                  id="ms-offset"
                  type="number"
                  value={managedServiceForm.giorni_offset_da_contratto}
                  onChange={(e) =>
                    setManagedServiceForm({
                      ...managedServiceForm,
                      giorni_offset_da_contratto: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="ms-rinnovo"
                checked={managedServiceForm.rinnovo_automatico}
                onCheckedChange={(checked) =>
                  setManagedServiceForm({
                    ...managedServiceForm,
                    rinnovo_automatico: checked as boolean,
                  })
                }
              />
              <Label htmlFor="ms-rinnovo" className="cursor-pointer">
                Rinnovo Automatico
              </Label>
            </div>

            <div>
              <Label htmlFor="ms-order">Ordine Visualizzazione</Label>
              <Input
                id="ms-order"
                type="number"
                value={managedServiceForm.display_order}
                onChange={(e) =>
                  setManagedServiceForm({
                    ...managedServiceForm,
                    display_order: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setManagedServiceDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button onClick={handleSaveManagedService}>
              <Plus className="mr-2 h-4 w-4" />
              {editingManagedService ? "Aggiorna" : "Crea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================
          MAIN PAGE CONTENT
          ======================================== */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Gestione Mapping Servizi</h1>
          <p className="text-muted-foreground mt-2">
            Configura come i servizi del catalogo generano automaticamente
            output operativi quando vengono convertiti in progetti.
          </p>
        </div>

        {/* Alert Info */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="ml-2 text-blue-900">
            <div className="font-semibold mb-1">
              🚀 Sistema Avanzato Quote → Project
            </div>
            <p className="text-sm">
              Quando un preventivo accettato viene convertito in progetto, i
              mapping configurati qui determinano quali requisiti, materiali
              brand e servizi gestiti vengono creati automaticamente.
            </p>
          </AlertDescription>
        </Alert>

        {/* Filtri */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="service-filter">Filtra per Servizio</Label>
                <Select
                  value={serviceFilter || "all"}
                  onValueChange={(value) =>
                    setServiceFilter(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger id="service-filter">
                    <SelectValue placeholder="Tutti i servizi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i servizi</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label htmlFor="search">Cerca</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca per nome..."
                    className="pl-10"
                  />
                  {searchQuery && (
                    <X
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                      onClick={() => setSearchQuery("")}
                    />
                  )}
                </div>
              </div>
            </div>

            {(serviceFilter && serviceFilter !== "all") || searchQuery ? (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-muted-foreground">
                  Filtri attivi:
                </span>
                {serviceFilter && serviceFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {services.find((s) => s.id === serviceFilter)?.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setServiceFilter("")}
                    />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Cerca: &quot;{searchQuery}&quot;
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Requisiti Funzionali
              </CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requirementsMappings.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Mapping configurati
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Materiali Brand
              </CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {brandAssetsMappings.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Mapping configurati
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Servizi Gestiti
              </CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {managedServicesMappings.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Mapping configurati
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs per tipo di mapping */}
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

          {/* TAB: Requisiti Funzionali */}
          <TabsContent value="requirements" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      Mapping Servizi → Requisiti Funzionali
                    </CardTitle>
                    <CardDescription>
                      Configura quali requisiti software vengono generati
                      automaticamente per ogni servizio
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => openRequirementDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Aggiungi Mapping
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRequirementsMappings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      {requirementsMappings.length === 0
                        ? "Nessun mapping configurato per i requisiti funzionali."
                        : "Nessun mapping trovato con i filtri attuali."}
                    </p>
                    <p className="text-xs mt-2">
                      {requirementsMappings.length === 0
                        ? "Aggiungi il primo mapping per iniziare l'auto-generazione."
                        : "Prova a modificare i filtri."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredRequirementsMappings.map((mapping: any) => (
                      <div
                        key={mapping.id}
                        className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {(mapping.services as any)?.name || "Servizio"}
                              </Badge>
                              <span className="font-medium">
                                {mapping.requirement_name}
                              </span>
                            </div>
                            {mapping.requirement_description && (
                              <p className="text-sm text-muted-foreground">
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
                                {mapping.moscow_priority?.toUpperCase()}
                              </Badge>
                              {mapping.stima_ore && (
                                <Badge variant="secondary" className="text-xs">
                                  {mapping.stima_ore}h
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openRequirementDialog(mapping)}
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Brand Assets */}
          <TabsContent value="brand_assets" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Mapping Servizi → Materiali Brand</CardTitle>
                    <CardDescription>
                      Configura quali materiali brand vengono generati
                      automaticamente per ogni servizio
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => openBrandAssetDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Aggiungi Mapping
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredBrandAssetsMappings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      {brandAssetsMappings.length === 0
                        ? "Nessun mapping configurato per i materiali brand."
                        : "Nessun mapping trovato con i filtri attuali."}
                    </p>
                    <p className="text-xs mt-2">
                      {brandAssetsMappings.length === 0
                        ? "Aggiungi il primo mapping per iniziare l'auto-generazione."
                        : "Prova a modificare i filtri."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredBrandAssetsMappings.map((mapping: any) => (
                      <div
                        key={mapping.id}
                        className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {(mapping.services as any)?.name || "Servizio"}
                              </Badge>
                              <span className="font-medium">
                                {mapping.asset_name}
                              </span>
                            </div>
                            {mapping.asset_descrizione && (
                              <p className="text-sm text-muted-foreground">
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
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openBrandAssetDialog(mapping)}
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Servizi Gestiti */}
          <TabsContent value="managed_services" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Mapping Servizi → Servizi Gestiti</CardTitle>
                    <CardDescription>
                      Configura quali servizi gestiti vengono creati
                      automaticamente per ogni servizio
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => openManagedServiceDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Aggiungi Mapping
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredManagedServicesMappings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      {managedServicesMappings.length === 0
                        ? "Nessun mapping configurato per i servizi gestiti."
                        : "Nessun mapping trovato con i filtri attuali."}
                    </p>
                    <p className="text-xs mt-2">
                      {managedServicesMappings.length === 0
                        ? "Aggiungi il primo mapping per iniziare l'auto-creazione."
                        : "Prova a modificare i filtri."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredManagedServicesMappings.map((mapping: any) => (
                      <div
                        key={mapping.id}
                        className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {(mapping.services as any)?.name || "Servizio"}
                              </Badge>
                              <span className="font-medium">
                                {mapping.service_nome}
                              </span>
                            </div>
                            {mapping.service_descrizione && (
                              <p className="text-sm text-muted-foreground">
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
                                  Rinnovo Auto
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openManagedServiceDialog(mapping)}
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
