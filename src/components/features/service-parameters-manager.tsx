'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Settings } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ServiceParametersManagerProps {
  serviceId: string
  onParametersChange?: () => void
}

export default function ServiceParametersManager({
  serviceId,
  onParametersChange,
}: ServiceParametersManagerProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const [parameters, setParameters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingParameter, setEditingParameter] = useState<any>(null)

  const [formData, setFormData] = useState({
    parameter_key: '',
    parameter_name: '',
    parameter_type: 'text' as string,
    default_value: '',
    possible_values: '',
    validation_rules: '',
    pricing_impact: '',
    help_text: '',
    display_order: 0,
  })

  useEffect(() => {
    loadParameters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId])

  const loadParameters = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('service_parameters')
      .select('*')
      .eq('service_id', serviceId)
      .order('display_order', { ascending: true })

    if (error) {
      toast({
        title: 'Errore',
        description: `Impossibile caricare parametri: ${error.message}`,
        variant: 'destructive',
      })
    } else {
      setParameters(data || [])
    }
    setLoading(false)
  }

  const openDialog = (parameter: any = null) => {
    if (parameter) {
      setEditingParameter(parameter)
      setFormData({
        parameter_key: parameter.parameter_key || '',
        parameter_name: parameter.parameter_name || '',
        parameter_type: parameter.parameter_type || 'text',
        default_value: JSON.stringify(parameter.default_value || ''),
        possible_values: JSON.stringify(parameter.possible_values || ''),
        validation_rules: JSON.stringify(parameter.validation_rules || {}),
        pricing_impact: JSON.stringify(parameter.pricing_impact || {}),
        help_text: parameter.help_text || '',
        display_order: parameter.display_order || 0,
      })
    } else {
      setEditingParameter(null)
      setFormData({
        parameter_key: '',
        parameter_name: '',
        parameter_type: 'text',
        default_value: '',
        possible_values: '',
        validation_rules: '',
        pricing_impact: '',
        help_text: '',
        display_order: parameters.length,
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.parameter_key || !formData.parameter_name) {
      toast({
        title: 'Errore',
        description: 'Key e Nome parametro sono obbligatori',
        variant: 'destructive',
      })
      return
    }

    // Parse JSON fields
    let default_value, possible_values, validation_rules, pricing_impact
    try {
      default_value = formData.default_value ? JSON.parse(formData.default_value) : null
      possible_values = formData.possible_values ? JSON.parse(formData.possible_values) : null
      validation_rules = formData.validation_rules ? JSON.parse(formData.validation_rules) : {}
      pricing_impact = formData.pricing_impact ? JSON.parse(formData.pricing_impact) : {}
    } catch (e) {
      toast({
        title: 'Errore',
        description: 'Formato JSON non valido nei campi avanzati',
        variant: 'destructive',
      })
      return
    }

    const dataToSave = {
      service_id: serviceId,
      parameter_key: formData.parameter_key,
      parameter_name: formData.parameter_name,
      parameter_type: formData.parameter_type,
      default_value,
      possible_values,
      validation_rules,
      pricing_impact,
      help_text: formData.help_text || null,
      display_order: formData.display_order,
    }

    let error
    if (editingParameter) {
      const { error: updateError } = await supabase
        .from('service_parameters')
        .update(dataToSave)
        .eq('id', editingParameter.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('service_parameters')
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
        description: editingParameter
          ? 'Parametro aggiornato'
          : 'Parametro creato',
      })
      setDialogOpen(false)
      loadParameters()
      if (onParametersChange) onParametersChange()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il parametro "${name}"?`)) return

    const { error } = await supabase
      .from('service_parameters')
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
        description: `Parametro "${name}" eliminato con successo`,
      })
      loadParameters()
      if (onParametersChange) onParametersChange()
    }
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingParameter ? 'Modifica Parametro' : 'Aggiungi Parametro'}
            </DialogTitle>
            <DialogDescription>
              Configura un parametro che potrà essere personalizzato nel Quote Builder
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Base Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="param-key">Parameter Key *</Label>
                <Input
                  id="param-key"
                  value={formData.parameter_key}
                  onChange={(e) =>
                    setFormData({ ...formData, parameter_key: e.target.value })
                  }
                  placeholder="es. num_pagine"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Identificatore univoco (snake_case)
                </p>
              </div>

              <div>
                <Label htmlFor="param-name">Nome Parametro *</Label>
                <Input
                  id="param-name"
                  value={formData.parameter_name}
                  onChange={(e) =>
                    setFormData({ ...formData, parameter_name: e.target.value })
                  }
                  placeholder="es. Numero Pagine"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="param-type">Tipo Parametro</Label>
                <Select
                  value={formData.parameter_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parameter_type: value })
                  }
                >
                  <SelectTrigger id="param-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="param-order">Ordine Visualizzazione</Label>
                <Input
                  id="param-order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="param-help">Testo di Aiuto</Label>
              <Textarea
                id="param-help"
                value={formData.help_text}
                onChange={(e) =>
                  setFormData({ ...formData, help_text: e.target.value })
                }
                placeholder="Descrizione per l'utente che configura il servizio"
                rows={2}
              />
            </div>

            {/* Advanced JSON Fields */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Configurazione Avanzata (JSON)</h4>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="param-default">Default Value (JSON)</Label>
                  <Input
                    id="param-default"
                    value={formData.default_value}
                    onChange={(e) =>
                      setFormData({ ...formData, default_value: e.target.value })
                    }
                    placeholder='es. "10" oppure "standard"'
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="param-possible">Possible Values (JSON)</Label>
                  <Textarea
                    id="param-possible"
                    value={formData.possible_values}
                    onChange={(e) =>
                      setFormData({ ...formData, possible_values: e.target.value })
                    }
                    placeholder='es. ["small", "medium", "large"] oppure {"min": 1, "max": 100}'
                    className="font-mono text-sm"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="param-validation">Validation Rules (JSON)</Label>
                  <Textarea
                    id="param-validation"
                    value={formData.validation_rules}
                    onChange={(e) =>
                      setFormData({ ...formData, validation_rules: e.target.value })
                    }
                    placeholder='es. {"required": true, "min": 1}'
                    className="font-mono text-sm"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="param-pricing">Pricing Impact (JSON)</Label>
                  <Textarea
                    id="param-pricing"
                    value={formData.pricing_impact}
                    onChange={(e) =>
                      setFormData({ ...formData, pricing_impact: e.target.value })
                    }
                    placeholder='es. {"type": "per_unit", "base_value": 10, "price_per_additional": 50}'
                    className="font-mono text-sm"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tipi: fixed, per_unit, percentage, tiered, mapping
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave}>
              <Settings className="mr-2 h-4 w-4" />
              {editingParameter ? 'Aggiorna' : 'Crea'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-cyan-200 bg-cyan-50/30">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                ⚙️ Parametri Configurabili
                <Badge variant="secondary" className="text-xs">
                  {parameters.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Parametri che i commerciali possono personalizzare quando aggiungono questo servizio ad un preventivo
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Parametro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Caricamento parametri...
            </p>
          ) : parameters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessun parametro configurato</p>
              <p className="text-xs mt-1">
                Aggiungi parametri per rendere questo servizio configurabile
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {parameters.map((param) => (
                <div
                  key={param.id}
                  className="bg-white border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{param.parameter_name}</h4>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {param.parameter_key}
                        </code>
                      </div>
                      {param.help_text && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {param.help_text}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {param.parameter_type}
                        </Badge>
                        {param.default_value && (
                          <Badge variant="outline" className="text-xs">
                            Default: {JSON.stringify(param.default_value)}
                          </Badge>
                        )}
                        {param.pricing_impact && Object.keys(param.pricing_impact).length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            💰 Impact Pricing
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openDialog(param)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(param.id, param.parameter_name)}
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
    </>
  )
}

