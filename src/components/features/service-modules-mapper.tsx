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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ServiceModulesMapperProps {
  serviceId: string
  onModulesChange?: () => void
}

export default function ServiceModulesMapper({
  serviceId,
  onModulesChange,
}: ServiceModulesMapperProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const [mappings, setMappings] = useState<any[]>([])
  const [availableModules, setAvailableModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMapping, setEditingMapping] = useState<any>(null)

  const [formData, setFormData] = useState({
    module_id: '',
    is_required: false,
    is_default: false,
    is_recommended: false,
    display_order: 0,
    notes: '',
  })

  useEffect(() => {
    loadMappings()
    loadAvailableModules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId])

  const loadMappings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('service_to_modules_mapping')
      .select('*, service_modules(id, name, description, base_price, pricing_type, category)')
      .eq('service_id', serviceId)
      .order('display_order', { ascending: true })

    if (error) {
      toast({
        title: 'Errore',
        description: `Impossibile caricare mapping: ${error.message}`,
        variant: 'destructive',
      })
    } else {
      setMappings(data || [])
    }
    setLoading(false)
  }

  const loadAvailableModules = async () => {
    const { data } = await supabase
      .from('service_modules')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (data) {
      setAvailableModules(data)
    }
  }

  const openDialog = (mapping: any = null) => {
    if (mapping) {
      setEditingMapping(mapping)
      setFormData({
        module_id: mapping.module_id,
        is_required: mapping.is_required || false,
        is_default: mapping.is_default || false,
        is_recommended: mapping.is_recommended || false,
        display_order: mapping.display_order || 0,
        notes: mapping.notes || '',
      })
    } else {
      setEditingMapping(null)
      setFormData({
        module_id: '',
        is_required: false,
        is_default: false,
        is_recommended: false,
        display_order: mappings.length,
        notes: '',
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.module_id) {
      toast({
        title: 'Errore',
        description: 'Seleziona un modulo',
        variant: 'destructive',
      })
      return
    }

    const dataToSave = {
      service_id: serviceId,
      module_id: formData.module_id,
      is_required: formData.is_required,
      is_default: formData.is_default,
      is_recommended: formData.is_recommended,
      display_order: formData.display_order,
      notes: formData.notes || null,
    }

    let error
    if (editingMapping) {
      const { error: updateError } = await supabase
        .from('service_to_modules_mapping')
        .update(dataToSave)
        .eq('id', editingMapping.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('service_to_modules_mapping')
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
        description: editingMapping ? 'Mapping aggiornato' : 'Mapping creato',
      })
      setDialogOpen(false)
      loadMappings()
      if (onModulesChange) onModulesChange()
    }
  }

  const handleDelete = async (id: string, moduleName: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il mapping per "${moduleName}"?`)) return

    const { error } = await supabase
      .from('service_to_modules_mapping')
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
        description: 'Mapping eliminato con successo',
      })
      loadMappings()
      if (onModulesChange) onModulesChange()
    }
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMapping ? 'Modifica Mapping Modulo' : 'Aggiungi Modulo Disponibile'}
            </DialogTitle>
            <DialogDescription>
              Configura un modulo che potrà essere aggiunto a questo servizio nei preventivi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="module-select">Modulo *</Label>
              <Select
                value={formData.module_id}
                onValueChange={(value) => setFormData({ ...formData, module_id: value })}
                disabled={!!editingMapping}
              >
                <SelectTrigger id="module-select">
                  <SelectValue placeholder="Seleziona modulo" />
                </SelectTrigger>
                <SelectContent>
                  {availableModules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name} - €{parseFloat(module.base_price || 0).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="module-required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_required: checked as boolean })
                  }
                />
                <Label htmlFor="module-required" className="cursor-pointer">
                  <span className="font-semibold">Obbligatorio</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    (verrà incluso automaticamente)
                  </span>
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="module-default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_default: checked as boolean })
                  }
                />
                <Label htmlFor="module-default" className="cursor-pointer">
                  <span className="font-semibold">Default</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    (pre-selezionato nel configuratore)
                  </span>
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="module-recommended"
                  checked={formData.is_recommended}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_recommended: checked as boolean })
                  }
                />
                <Label htmlFor="module-recommended" className="cursor-pointer">
                  <span className="font-semibold">Consigliato</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    (evidenziato nel configuratore)
                  </span>
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="module-notes">Note</Label>
              <Textarea
                id="module-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Note interne sul perché questo modulo è utile..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="module-order">Ordine Visualizzazione</Label>
              <Input
                id="module-order"
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave}>
              <Package className="mr-2 h-4 w-4" />
              {editingMapping ? 'Aggiorna' : 'Aggiungi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                🧩 Moduli Disponibili
                <Badge variant="secondary" className="text-xs">
                  {mappings.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Moduli che possono essere aggiunti a questo servizio durante la creazione del preventivo
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Modulo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Caricamento moduli...
            </p>
          ) : mappings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessun modulo configurato</p>
              <p className="text-xs mt-1">
                Aggiungi moduli per rendere questo servizio personalizzabile
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {mappings.map((mapping) => {
                const serviceModule = mapping.service_modules
                if (!serviceModule) return null
                return (
                  <div
                    key={mapping.id}
                    className={`bg-white border-l-4 rounded-lg p-3 ${
                      mapping.is_required
                        ? 'border-l-red-500'
                        : mapping.is_recommended
                        ? 'border-l-green-500'
                        : 'border-l-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{serviceModule.name}</h4>
                          {mapping.is_required && (
                            <Badge variant="destructive" className="text-xs">
                              Obbligatorio
                            </Badge>
                          )}
                          {mapping.is_recommended && !mapping.is_required && (
                            <Badge variant="default" className="text-xs">
                              Consigliato
                            </Badge>
                          )}
                          {mapping.is_default && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        {serviceModule.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {serviceModule.description}
                          </p>
                        )}
                        {mapping.notes && (
                          <p className="text-xs text-blue-600 mt-1 italic">
                            💡 {mapping.notes}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {serviceModule.category && (
                            <Badge variant="outline" className="text-xs">
                              {serviceModule.category}
                            </Badge>
                          )}
                          {serviceModule.pricing_type && (
                            <Badge variant="outline" className="text-xs">
                              {serviceModule.pricing_type}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs font-semibold">
                            € {parseFloat(serviceModule.base_price || 0).toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button size="icon" variant="ghost" onClick={() => openDialog(mapping)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(mapping.id, serviceModule.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

