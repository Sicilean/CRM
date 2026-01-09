"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MacroArea } from "@/types/quotes.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Loader2,
  GripVertical,
  Palette,
} from "lucide-react";
import Link from "next/link";

interface MacroAreaFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
  sort_order: number;
}

export default function MacroAreePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [macroAreas, setMacroAreas] = useState<MacroArea[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<MacroAreaFormData | null>(
    null
  );

  const loadMacroAreas = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("macro_areas")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Errore caricamento macro-aree:", error);
    } else {
      setMacroAreas((data || []) as MacroArea[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadMacroAreas();
  }, [loadMacroAreas]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[ç]/g, "c")
      .replace(/[ñ]/g, "n")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const openDialog = (area?: MacroArea) => {
    setEditingArea(
      area
        ? {
            id: area.id,
            name: area.name,
            slug: area.slug,
            description: area.description || "",
            icon: area.icon || "",
            color: area.color || "#6366f1",
            is_active: area.is_active,
            sort_order: area.sort_order,
          }
        : {
            name: "",
            slug: "",
            description: "",
            icon: "📦",
            color: "#6366f1",
            is_active: true,
            sort_order: macroAreas.length,
          }
    );
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingArea?.name.trim()) {
      alert("Il nome è obbligatorio");
      return;
    }

    setSaving(true);

    const dataToSave = {
      name: editingArea.name,
      slug: editingArea.slug || generateSlug(editingArea.name),
      description: editingArea.description || null,
      icon: editingArea.icon || null,
      color: editingArea.color || null,
      is_active: editingArea.is_active,
      sort_order: editingArea.sort_order,
    };

    try {
      if (editingArea.id) {
        const { error } = await (supabase as any)
          .from("macro_areas")
          .update(dataToSave)
          .eq("id", editingArea.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("macro_areas")
          .insert(dataToSave);
        if (error) throw error;
      }

      await loadMacroAreas();
      setDialogOpen(false);
      setEditingArea(null);
    } catch (error: any) {
      console.error("Errore salvataggio:", error);
      alert("Errore durante il salvataggio: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa macro-area?")) return;

    try {
      const { error } = await (supabase as any)
        .from("macro_areas")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await loadMacroAreas();
    } catch (error: any) {
      console.error("Errore eliminazione:", error);
      alert("Errore durante l'eliminazione: " + error.message);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("macro_areas")
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
      await loadMacroAreas();
    } catch (error: any) {
      console.error("Errore aggiornamento:", error);
    }
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
          <Link href="/servizi">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Macro-Aree</h1>
            <p className="text-muted-foreground mt-1">
              Gestisci le categorie principali dei servizi
            </p>
          </div>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuova Macro-Area
        </Button>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Macro-Aree ({macroAreas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {macroAreas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna macro-area definita</p>
            </div>
          ) : (
            <div className="space-y-3">
              {macroAreas.map((area) => (
                <div
                  key={area.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    !area.is_active ? "opacity-50 bg-muted/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{
                        backgroundColor: (area.color || "#6366f1") + "20",
                        color: area.color || "#6366f1",
                      }}
                    >
                      {area.icon || "📦"}
                    </div>
                    <div>
                      <h4 className="font-medium">{area.name}</h4>
                      {area.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {area.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded">
                          {area.slug}
                        </code>
                        {!area.is_active && (
                          <Badge variant="secondary">Disattivato</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={area.is_active}
                      onCheckedChange={() =>
                        handleToggleActive(area.id, area.is_active)
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDialog(area)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(area.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingArea?.id ? "Modifica Macro-Area" : "Nuova Macro-Area"}
            </DialogTitle>
          </DialogHeader>
          {editingArea && (
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={editingArea.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingArea({
                      ...editingArea,
                      name,
                      slug: editingArea.id
                        ? editingArea.slug
                        : generateSlug(name),
                    });
                  }}
                  placeholder="es. Branding & Identità"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={editingArea.slug}
                  onChange={(e) =>
                    setEditingArea({ ...editingArea, slug: e.target.value })
                  }
                  placeholder="branding-identita"
                />
              </div>
              <div>
                <Label>Descrizione</Label>
                <Textarea
                  value={editingArea.description}
                  onChange={(e) =>
                    setEditingArea({
                      ...editingArea,
                      description: e.target.value,
                    })
                  }
                  placeholder="Descrizione della macro-area..."
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Icona (Emoji)</Label>
                  <Input
                    value={editingArea.icon}
                    onChange={(e) =>
                      setEditingArea({ ...editingArea, icon: e.target.value })
                    }
                    placeholder="🎨"
                  />
                </div>
                <div>
                  <Label>Colore</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editingArea.color}
                      onChange={(e) =>
                        setEditingArea({
                          ...editingArea,
                          color: e.target.value,
                        })
                      }
                      className="w-14 h-10 p-1"
                    />
                    <Input
                      value={editingArea.color}
                      onChange={(e) =>
                        setEditingArea({
                          ...editingArea,
                          color: e.target.value,
                        })
                      }
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Ordine</Label>
                <Input
                  type="number"
                  min="0"
                  value={editingArea.sort_order}
                  onChange={(e) =>
                    setEditingArea({
                      ...editingArea,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingArea.is_active}
                  onCheckedChange={(checked) =>
                    setEditingArea({ ...editingArea, is_active: checked })
                  }
                />
                <Label>Attiva</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
