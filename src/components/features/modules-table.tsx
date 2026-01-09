'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Eye, Edit, Trash2, ArrowUpDown, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

type SortField = 'name' | 'category' | 'base_price' | 'pricing_type' | 'module_type'
type SortOrder = 'asc' | 'desc'

interface FilterState {
  category?: string
  module_type?: string
  pricing_type?: string
  is_active?: string
}

const MODULE_TYPE_LABELS: Record<string, string> = {
  feature: 'Feature',
  integration: 'Integrazione',
  customization: 'Personalizzazione',
  upgrade: 'Upgrade',
  addon: 'Add-on'
}

const PRICING_TYPE_LABELS: Record<string, string> = {
  fixed: 'Prezzo Fisso',
  per_unit: 'Per Unità',
  percentage: 'Percentuale',
  tiered: 'A Scaglioni',
  custom: 'Custom'
}

export default function ModulesTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({})
  const [totalCount, setTotalCount] = useState(0)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const supabase = createClient()
  
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([])
  const [uniqueModuleTypes, setUniqueModuleTypes] = useState<string[]>([])
  const [uniquePricingTypes, setUniquePricingTypes] = useState<string[]>([])

  const loadModules = useCallback(async () => {
    setLoading(true)

    try {
      let query = supabase
        .from('service_modules')
        .select('*', { count: 'exact' })
        .order(sortField, { ascending: sortOrder === 'asc' })

      // Applicare filtri
      if (filters.category && filters.category !== '__all__') {
        query = query.eq('category', filters.category)
      }
      if (filters.module_type && filters.module_type !== '__all__') {
        query = query.eq('module_type', filters.module_type)
      }
      if (filters.pricing_type && filters.pricing_type !== '__all__') {
        query = query.eq('pricing_type', filters.pricing_type)
      }
      if (filters.is_active && filters.is_active !== '__all__') {
        query = query.eq('is_active', filters.is_active === 'true')
      }

      // Ricerca full-text
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      setModules(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Errore caricamento moduli:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i moduli',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [filters, searchQuery, sortField, sortOrder, supabase, toast])

  useEffect(() => {
    loadModules()
  }, [loadModules])

  // Carica valori unici per i filtri
  useEffect(() => {
    const loadUniqueValues = async () => {
      const { data: categoriesData } = await supabase
        .from('service_modules')
        .select('category')
        .not('category', 'is', null)
      
      if (categoriesData) {
        const categories = Array.from(new Set(categoriesData.map((m: any) => m.category).filter(Boolean))) as string[]
        setUniqueCategories(categories.sort())
      }

      const { data: moduleTypesData } = await supabase
        .from('service_modules')
        .select('module_type')
        .not('module_type', 'is', null)
      
      if (moduleTypesData) {
        const types = Array.from(new Set(moduleTypesData.map((m: any) => m.module_type).filter(Boolean))) as string[]
        setUniqueModuleTypes(types.sort())
      }

      const { data: pricingTypesData } = await supabase
        .from('service_modules')
        .select('pricing_type')
        .not('pricing_type', 'is', null)
      
      if (pricingTypesData) {
        const types = Array.from(new Set(pricingTypesData.map((m: any) => m.pricing_type).filter(Boolean))) as string[]
        setUniquePricingTypes(types.sort())
      }
    }

    loadUniqueValues()
  }, [supabase])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il modulo "${name}"?`)) return

    const { error } = await supabase
      .from('service_modules')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: 'Errore',
        description: `Impossibile eliminare: ${error.message}`,
        variant: 'destructive'
      })
    } else {
      toast({
        title: 'Eliminato',
        description: `Modulo "${name}" eliminato con successo`
      })
      loadModules()
    }
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
  }

  const hasActiveFilters = Object.values(filters).some(v => v && v !== '__all__') || searchQuery

  return (
    <div className="space-y-4">
      {/* Filtri e Ricerca */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block">Cerca</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per nome, slug o descrizione..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-48">
          <label className="text-sm font-medium mb-1.5 block">Categoria</label>
          <Select
            value={filters.category || '__all__'}
            onValueChange={(value) => setFilters({ ...filters, category: value === '__all__' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tutte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tutte</SelectItem>
              {uniqueCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <label className="text-sm font-medium mb-1.5 block">Tipo Modulo</label>
          <Select
            value={filters.module_type || '__all__'}
            onValueChange={(value) => setFilters({ ...filters, module_type: value === '__all__' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tutti" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tutti</SelectItem>
              {uniqueModuleTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {MODULE_TYPE_LABELS[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <label className="text-sm font-medium mb-1.5 block">Tipo Pricing</label>
          <Select
            value={filters.pricing_type || '__all__'}
            onValueChange={(value) => setFilters({ ...filters, pricing_type: value === '__all__' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tutti" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tutti</SelectItem>
              {uniquePricingTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {PRICING_TYPE_LABELS[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-32">
          <label className="text-sm font-medium mb-1.5 block">Stato</label>
          <Select
            value={filters.is_active || '__all__'}
            onValueChange={(value) => setFilters({ ...filters, is_active: value === '__all__' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tutti" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tutti</SelectItem>
              <SelectItem value="true">Attivo</SelectItem>
              <SelectItem value="false">Inattivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            Reset
          </Button>
        )}
      </div>

      {/* Statistiche */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {loading ? 'Caricamento...' : `${totalCount} moduli totali`}
          {hasActiveFilters && ` (${modules.length} filtrati)`}
        </span>
      </div>

      {/* Tabella */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('name')} className="h-8 p-0">
                  Nome
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Descrizione</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('category')} className="h-8 p-0">
                  Categoria
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('module_type')} className="h-8 p-0">
                  Tipo
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('pricing_type')} className="h-8 p-0">
                  Pricing
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => handleSort('base_price')} className="h-8 p-0">
                  Prezzo Base
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Caricamento moduli...
                </TableCell>
              </TableRow>
            ) : modules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nessun modulo trovato</p>
                  {hasActiveFilters && (
                    <p className="text-xs mt-1">Prova a modificare i filtri</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              modules.map((module, index) => (
                <TableRow key={module.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{module.name}</p>
                      <p className="text-xs text-muted-foreground">{module.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm truncate" title={module.description}>
                      {module.description || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    {module.category ? (
                      <Badge variant="outline" className="text-xs">
                        {module.category}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {module.module_type ? (
                      <Badge variant="secondary" className="text-xs">
                        {MODULE_TYPE_LABELS[module.module_type] || module.module_type}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {PRICING_TYPE_LABELS[module.pricing_type] || module.pricing_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    € {parseFloat(module.base_price || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={module.is_active ? 'default' : 'secondary'}>
                      {module.is_active ? 'Attivo' : 'Inattivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/moduli/${module.id}`)}
                        title="Visualizza"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/moduli/${module.id}/edit`)}
                        title="Modifica"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(module.id, module.name)}
                        title="Elimina"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

