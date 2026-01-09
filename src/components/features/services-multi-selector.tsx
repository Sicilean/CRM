'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Service } from '@/types/database.types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Search, Plus, Info, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServicesMultiSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddServices: (services: Service[]) => void
  excludeServiceIds?: string[] // Servizi già aggiunti da escludere
}

const STATUS_LABELS: Record<string, string> = {
  concept: 'Concept',
  in_creation: 'In Creazione',
  ready_to_launch: 'Pronto',
  active: 'Attivo',
  deprecated: 'Deprecato'
}

const TYPE_LABELS: Record<string, string> = {
  brand: 'Brand',
  software: 'Software',
  strategy: 'Strategia',
  managed_service: 'Servizio Gestito',
  accessory: 'Accessorio',
  setup: 'Setup',
  core: 'Core'
}

const AREA_LABELS: Record<string, string> = {
  strategy_brand: 'Strategia Brand',
  visual_identity: 'Identità Visiva',
  discovery: 'Discovery',
  planning: 'Planning',
  content_management: 'Content Management',
  ecommerce: 'E-commerce',
  user_management: 'User Management',
  booking: 'Prenotazioni',
  communication: 'Comunicazione',
  search_filter: 'Ricerca & Filtri',
  analytics_tracking: 'Analytics',
  integrations: 'Integrazioni',
  automation: 'Automazione',
  advanced_features: 'Feature Avanzate',
  strategy_business: 'Strategia Business'
}

export default function ServicesMultiSelector({
  open,
  onOpenChange,
  onAddServices,
  excludeServiceIds = []
}: ServicesMultiSelectorProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [areaFilter, setAreaFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('') // Mostra tutti i servizi di default

  const loadServices = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Errore caricamento servizi:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Carica servizi
  useEffect(() => {
    if (open) {
      loadServices()
      setSelectedIds(new Set()) // Reset selezione quando si apre
    }
  }, [open, loadServices])

  // Applica filtri
  useEffect(() => {
    // Usa notion_id o id come fallback
    let filtered = services.filter(s => {
      const serviceId = s.notion_id || s.id
      return serviceId && !excludeServiceIds.includes(serviceId)
    })

    // Filtro tipo
    if (typeFilter) {
      filtered = filtered.filter(s => s.type === typeFilter)
    }

    // Filtro area
    if (areaFilter) {
      filtered = filtered.filter(s => s.area === areaFilter)
    }

    // Filtro status
    if (statusFilter) {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    // Filtro ricerca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) ||
        (s.notion_id && s.notion_id.toLowerCase().includes(query)) ||
        (s.id && s.id.toLowerCase().includes(query))
      )
    }

    setFilteredServices(filtered)
  }, [services, typeFilter, areaFilter, statusFilter, searchQuery, excludeServiceIds])

  const handleToggleService = (serviceId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId)
      } else {
        newSet.add(serviceId)
      }
      return newSet
    })
  }

  const handleToggleAll = () => {
    if (selectedIds.size === filteredServices.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredServices.map(s => s.notion_id || s.id).filter((id): id is string => id !== undefined)))
    }
  }

  const handleAddSelected = () => {
    const selectedServices = services.filter(s => {
      const serviceId = s.notion_id || s.id
      return serviceId && selectedIds.has(serviceId)
    })
    onAddServices(selectedServices)
    onOpenChange(false)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setTypeFilter('')
    setAreaFilter('')
    setStatusFilter('') // Torna al default (tutti)
  }

  const activeFiltersCount = (typeFilter ? 1 : 0) + (areaFilter ? 1 : 0) + (statusFilter ? 1 : 0) + (searchQuery ? 1 : 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Aggiungi Servizi
          </DialogTitle>
        </DialogHeader>

        {/* Filtri e Ricerca */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cerca servizi per nome o codice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={typeFilter || 'all'} onValueChange={(value) => setTypeFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="strategy">Strategia</SelectItem>
                  <SelectItem value="managed_service">Servizio Gestito</SelectItem>
                  <SelectItem value="accessory">Accessorio</SelectItem>
                  <SelectItem value="setup">Setup</SelectItem>
                </SelectContent>
              </Select>

              <Select value={areaFilter || 'all'} onValueChange={(value) => setAreaFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le aree</SelectItem>
                  <SelectItem value="strategy_brand">Strategia Brand</SelectItem>
                  <SelectItem value="visual_identity">Identità Visiva</SelectItem>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="content_management">Content Mgmt</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="user_management">User Mgmt</SelectItem>
                  <SelectItem value="booking">Prenotazioni</SelectItem>
                  <SelectItem value="communication">Comunicazione</SelectItem>
                  <SelectItem value="search_filter">Ricerca</SelectItem>
                  <SelectItem value="analytics_tracking">Analytics</SelectItem>
                  <SelectItem value="integrations">Integrazioni</SelectItem>
                  <SelectItem value="automation">Automazione</SelectItem>
                  <SelectItem value="advanced_features">Feature Avanzate</SelectItem>
                  <SelectItem value="strategy_business">Strategy Business</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="active">Attivi</SelectItem>
                  <SelectItem value="ready_to_launch">Pronti</SelectItem>
                  <SelectItem value="in_creation">In Creazione</SelectItem>
                  <SelectItem value="concept">Concept</SelectItem>
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Pulisci filtri">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Header con conteggi */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredServices.length} serviz{filteredServices.length !== 1 ? 'i' : 'io'}
              {selectedIds.size > 0 && ` • ${selectedIds.size} selezionat${selectedIds.size !== 1 ? 'i' : 'o'}`}
            </span>
            {filteredServices.length > 0 && (
              <Button variant="link" size="sm" onClick={handleToggleAll} className="h-auto p-0">
                {selectedIds.size === filteredServices.length ? 'Deseleziona tutto' : 'Seleziona tutto'}
              </Button>
            )}
          </div>
        </div>

        {/* Lista Servizi */}
        <div className="flex-1 overflow-y-auto border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery || typeFilter || statusFilter
                  ? 'Nessun servizio trovato con questi filtri'
                  : 'Nessun servizio disponibile'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredServices.map((service) => {
                const serviceId = service.notion_id || service.id
                if (!serviceId) return null
                const isSelected = selectedIds.has(serviceId)
                
                return (
                  <div
                    key={service.id}
                    className={cn(
                      'flex items-start gap-3 p-4 hover:bg-accent/50 cursor-pointer transition-colors',
                      isSelected && 'bg-accent'
                    )}
                    onClick={() => serviceId && handleToggleService(serviceId)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => serviceId && handleToggleService(serviceId)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{service.name}</h4>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">
                            {serviceId}
                          </code>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1">
                                  <span className="font-mono font-bold text-sm whitespace-nowrap">
                                    € {(service.base_price ?? 0).toFixed(2)}
                                  </span>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <p className="text-xs">Prezzo base interno</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant={
                          service.type === 'software' ? 'default' : 
                          service.type === 'brand' ? 'secondary' : 
                          'outline'
                        } className="text-xs">
                          {TYPE_LABELS[service.type || 'accessory']}
                        </Badge>
                        {service.area && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            {AREA_LABELS[service.area] || service.area}
                          </Badge>
                        )}
                        {service.status && (
                          <Badge variant="outline" className="text-xs">
                            {STATUS_LABELS[service.status] || service.status}
                          </Badge>
                        )}
                        {service.is_recurring && (
                          <Badge variant="outline" className="text-xs">
                            Ricorrente
                          </Badge>
                        )}
                      </div>

                      {/* Mostra configuration.description se disponibile */}
                      {service.configuration && typeof service.configuration === 'object' && 'description' in service.configuration && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-1 cursor-help">
                                {String((service.configuration as any).description)}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-sm">
                              <p className="text-xs">{String((service.configuration as any).description)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleAddSelected} disabled={selectedIds.size === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi {selectedIds.size > 0 ? `(${selectedIds.size})` : 'Selezionati'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

