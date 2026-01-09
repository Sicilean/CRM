'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Gift } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ServicePresetsManagerProps {
  serviceId: string
  onPresetsChange?: () => void
}

export default function ServicePresetsManager({
  serviceId,
  onPresetsChange,
}: ServicePresetsManagerProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const [presets, setPresets] = useState<any[]>([])
  const [availableModules, setAvailableModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    included_modules: [] as string[],
    parameters: '',
    total_price: '',
    discount_percentage: '0',
    is_featured: false,
    is_recommended: false,
    badge_text: '',
    display_order: 0,
    icon: '',
  })

  useEffect(() => {
    loadPresets()
    loadAvailableModules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId])

  const loadPresets = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('service_presets')
      .select('*')
      .eq('service_id', serviceId)
      .order('display_order', { ascending: true })

    if (error) {
      toast({
        title: 'Errore',
        description: `Impossibile caricare preset: ${error.message}`,
        variant: 'destructive',
      })
    } else {
      setPresets(data || [])
    }
    setLoading(false)
  }

  const loadAvailableModules = async () => {
    const { data } = await supabase
      .from('service_to_modules_mapping')
      .select('service_modules(id, name)')
      .eq('service_id', serviceId)

    if (data) {
      setAvailableModules(data.map((m: any) => m.service_modules).filter(Boolean))
    }
  }

  const openDialog = (preset: any = null) => {
    if (preset) {
      setEditingPreset(preset)
      setFormData({
        name: preset.name || '',
        slug: preset.slug || '',
        description: preset.description || '',
        included_modules: preset.included_modules || [],
        parameters: JSON.stringify(preset.parameters || {}),
        total_price: preset.total_price?.toString() || '',
        discount_percentage: preset.discount_percentage?.toString() || '0',
        is_featured: preset.is_featured || false,
        is_recommended: preset.is_recommended || false,
        badge_text: preset.badge_text || '',
        display_order: preset.display_order || 0,
        icon: preset.icon || '',
      })
    } else {
      setEditingPreset(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        included_modules: [],
        parameters: '{}',
        total_price: '',
        discount_percentage: '0',
        is_featured: false,
        is_recommended: false,
        badge_text: '',
        display_order: presets.length,
        icon: '',
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: 'Errore',
        description: 'Nome e Slug sono obbligatori',
        variant: 'destructive',
      })
      return
    }

    let parameters
    try {
      parameters = formData.parameters ? JSON.parse(formData.parameters) : {}
    } catch (e) {
      toast({
        title: 'Errore',
        description: 'Formato JSON non valido per Parameters',
        variant: 'destructive',
      })
      return
    }

    const dataToSave = {
      service_id: serviceId,
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      included_modules: formData.included_modules,
      parameters,
      total_price: parseFloat(formData.total_price) || 0,
      discount_percentage: parseInt(formData.discount_percentage) || 0,
      is_featured: formData.is_featured,
      is_recommended: formData.is_recommended,
      badge_text: formData.badge_text || null,
      display_order: formData.display_order,
      icon: formData.icon || null,
    }

    let error
    if (editingPreset) {
      const { error: updateError } = await supabase
        .from('service_presets')
        .update(dataToSave)
        .eq('id', editingPreset.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('service_presets')
        .insert([dataToSave])
      error = insertError
    }

    if (error) {
      toast({
        title: 'Errore',
        description: `Impossibile salvare: ${error.message}`,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Successo!',
        description: editingPreset ? 'Preset aggiornato' : 'Preset creato',
      })
      setDialogOpen(false)
      loadPresets()
      if (onPresetsChange) onPresetsChange()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il preset "${name}"?`)) return

    const { error } = await supabase
      .from('service_presets')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: 'Errore',
        description: `Impossibile eliminare: ${error.message}`,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Eliminato',
        description: `Preset "${name}" eliminato con successo`,
      })
      loadPresets()
      if (onPresetsChange) onPresetsChange()
    }
  }

  const toggleModule = (moduleId: string) => {
    setFormData((prev) => ({
      ...prev,
      included_modules: prev.included_modules.includes(moduleId)
        ? prev.included_modules.filter((id) => id !== moduleId)
        : [...prev.included_modules, moduleId],
    }))
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPreset ? 'Modifica Preset' : 'Aggiungi Preset'}
            </DialogTitle>
            <DialogDescription>
              Configura un preset predefinito per velocizzare la creazione di preventivi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preset-name">Nome Preset *</Label>
                <Input
                  id="preset-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="es. Sito Vetrina Base"
                />
              </div>
              <div>
                <Label htmlFor="preset-slug">Slug *</Label>
                <Input
                  id="preset-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="es. sito-vetrina-base"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="preset-desc">Descrizione</Label>
              <Textarea
                id="preset-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="preset-price">Prezzo Totale (€)</Label>
                <Input
                  id="preset-price"
                  type="number"
                  step="0.01"
                  value={formData.total_price}
                  onChange={(e) => setFormData({ ...formData, total_price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="preset-discount">Sconto (%)</Label>
                <Input
                  id="preset-discount"
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="preset-badge">Badge Text</Label>
                <Input
                  id="preset-badge"
                  value={formData.badge_text}
                  onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                  placeholder="es. Best Value"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="preset-featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked as boolean })
                  }
                />
                <Label htmlFor="preset-featured" className="cursor-pointer">
                  In Evidenza
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="preset-recommended"
                  checked={formData.is_recommended}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_recommended: checked as boolean })
                  }
                />
                <Label htmlFor="preset-recommended" className="cursor-pointer">
                  Consigliato
                </Label>
              </div>
            </div>

            {/* Moduli Inclusi */}
            {availableModules.length > 0 && (
              <div className="border-t pt-4">
                <Label>Moduli Inclusi</Label>
                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                  {availableModules.map((module) => (
                    <div key={module.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`module-${module.id}`}
                        checked={formData.included_modules.includes(module.id)}
                        onCheckedChange={() => toggleModule(module.id)}
                      />
                      <Label
                        htmlFor={`module-${module.id}`}
                        className="cursor-pointer text-sm"
                      >
                        {module.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parameters JSON */}
            <div className="border-t pt-4">
              <Label htmlFor="preset-params">Parameters (JSON)</Label>
              <Textarea
                id="preset-params"
                value={formData.parameters}
                onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                className="font-mono text-sm"
                rows={4}
                placeholder='{"num_pagine": 10, "complessita": "standard"}'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave}>
              <Gift className="mr-2 h-4 w-4" />
              {editingPreset ? 'Aggiorna' : 'Crea'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                🎁 Preset Disponibili
                <Badge variant="secondary" className="text-xs">
                  {presets.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Configurazioni predefinite per velocizzare la creazione di preventivi
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Preset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Caricamento preset...
            </p>
          ) : presets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessun preset configurato</p>
              <p className="text-xs mt-1">
                Crea preset per velocizzare la creazione di preventivi
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className={`bg-white border-2 rounded-lg p-4 ${
                    preset.is_featured ? 'border-amber-400' : 'border-gray-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm">{preset.name}</h4>
                      {preset.badge_text && (
                        <Badge className="text-xs">{preset.badge_text}</Badge>
                      )}
                    </div>
                    {preset.description && (
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    )}
                    <div className="pt-2 border-t">
                      <p className="text-2xl font-bold text-amber-600">
                        € {parseFloat(preset.total_price || 0).toFixed(2)}
                      </p>
                      {preset.discount_percentage > 0 && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Sconto {preset.discount_percentage}%
                        </Badge>
                      )}
                    </div>
                    {preset.included_modules && preset.included_modules.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {preset.included_modules.length} moduli inclusi
                      </p>
                    )}
                    <div className="flex gap-1 pt-2 border-t">
                      <Button size="sm" variant="ghost" onClick={() => openDialog(preset)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(preset.id, preset.name)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

