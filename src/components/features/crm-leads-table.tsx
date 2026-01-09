'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePermissions } from '@/hooks/usePermissions'
import { CrmLead } from '@/types/database.types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, Filter, Plus, Eye, Edit, Trash2, X, Download, Upload, FileDown } from 'lucide-react'
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_SOURCE_LABELS } from '@/lib/crm-constants'
import { formatDateItalian, formatCurrency, downloadCSV, generateLeadsCSVTemplate } from '@/lib/crm-utils'
import NewLeadModal from './new-lead-modal'
import LeadDetailModal from './lead-detail-modal'

export default function CrmLeadsTable() {
  const supabase = createClient()
  const { isAgente, isAdmin, isSuperAdmin } = usePermissions()
  const [leads, setLeads] = useState<CrmLead[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [fonteFilter, setFonteFilter] = useState<string>('')
  const [totalCount, setTotalCount] = useState(0)
  
  // Solo admin possono eliminare leads
  const canDelete = isAdmin || isSuperAdmin
  
  // Modal states
  const [showNewLeadModal, setShowNewLeadModal] = useState(false)
  const [showLeadDetail, setShowLeadDetail] = useState(false)
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  const loadLeads = useCallback(async () => {
    setLoading(true)
    try {
      // Le RLS policies gestiscono automaticamente il filtraggio:
      // - Admin/Super Admin vedono tutti i leads
      // - Agenti vedono solo i leads assegnati a loro o creati da loro
      let query = supabase
        .from('crm_leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (statusFilter) query = query.eq('status', statusFilter)
      if (fonteFilter) query = query.eq('fonte', fonteFilter)
      if (searchQuery) {
        query = query.or(`nome_completo.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,azienda.ilike.%${searchQuery}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      setLeads(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter, fonteFilter, supabase])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo lead?')) return

    try {
      const { error } = await supabase
        .from('crm_leads')
        .delete()
        .eq('id', id)

      if (error) throw error

      setLeads(prev => prev.filter(l => l.id !== id))
      setTotalCount(prev => prev - 1)
    } catch (error) {
      console.error('Error deleting lead:', error)
      alert('Errore durante l\'eliminazione')
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/crm/leads/export')
      const csv = await response.text()
      downloadCSV(csv, `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
    } catch (error) {
      console.error('Error exporting leads:', error)
      alert('Errore durante l\'export')
    }
  }

  const handleDownloadTemplate = () => {
    const template = generateLeadsCSVTemplate()
    downloadCSV(template, 'leads_import_template.csv')
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setFonteFilter('')
  }

  const activeFiltersCount = (searchQuery ? 1 : 0) + (statusFilter ? 1 : 0) + (fonteFilter ? 1 : 0)

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Toolbar Mobile */}
      <div className="flex flex-col gap-2 md:hidden">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-2">
                <Filter className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 py-0 text-[10px]">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Filtri</h4>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                      <X className="h-3 w-3 mr-1" />
                      Pulisci
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti gli stati</SelectItem>
                      <SelectItem value="nuovo">Nuovo</SelectItem>
                      <SelectItem value="contattato">Contattato</SelectItem>
                      <SelectItem value="qualificato">Qualificato</SelectItem>
                      <SelectItem value="convertito">Convertito</SelectItem>
                      <SelectItem value="perso">Perso</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={fonteFilter || 'all'} onValueChange={(v) => setFonteFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le fonti</SelectItem>
                      {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button size="sm" className="h-9 px-3" onClick={() => setShowNewLeadModal(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{totalCount} lead</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={handleExport}>
              <Download className="h-3 w-3 mr-1" />
              CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar Desktop */}
      <div className="hidden md:flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cerca leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtri
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Filtri</h4>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Pulisci
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Stato</label>
                    <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tutti" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tutti</SelectItem>
                        <SelectItem value="nuovo">Nuovo</SelectItem>
                        <SelectItem value="contattato">Contattato</SelectItem>
                        <SelectItem value="qualificato">Qualificato</SelectItem>
                        <SelectItem value="convertito">Convertito</SelectItem>
                        <SelectItem value="perso">Perso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Fonte</label>
                    <Select value={fonteFilter || 'all'} onValueChange={(v) => setFonteFilter(v === 'all' ? '' : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tutte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tutte</SelectItem>
                        {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <FileDown className="mr-2 h-4 w-4" />
            Template CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importa
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
          <Button size="sm" onClick={() => setShowNewLeadModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Lead
          </Button>
        </div>
      </div>

      {/* Conteggio risultati Desktop */}
      <div className="hidden md:flex items-center justify-between text-sm text-muted-foreground">
        <span>{totalCount} lead{totalCount !== 1 ? 's' : ''} totali</span>
        {activeFiltersCount > 0 && (
          <span className="text-xs">{activeFiltersCount} filtro/i attivo/i</span>
        )}
      </div>

      {/* Card View Mobile */}
      <div className="md:hidden space-y-2">
        {loading && leads.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="text-sm">Caricamento...</span>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nessun lead trovato
          </div>
        ) : (
          leads.map((lead) => (
            <div 
              key={lead.id} 
              className="bg-card border rounded-lg p-3 space-y-2"
              onClick={() => { setSelectedLead(lead); setShowLeadDetail(true); }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{lead.nome_completo}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.azienda || lead.email}</p>
                </div>
                <Badge className={`${LEAD_STATUS_COLORS[lead.status]} text-[10px] px-1.5 py-0 shrink-0`}>
                  {LEAD_STATUS_LABELS[lead.status]}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{lead.budget ? formatCurrency(lead.budget) : 'Budget N/D'}</span>
                <span>{lead.data_ultimo_contatto ? formatDateItalian(lead.data_ultimo_contatto) : 'Mai contattato'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabella Desktop */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Azienda</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Fonte</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Ultimo Contatto</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span>Caricamento...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nessun lead trovato
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.nome_completo}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{lead.email}</TableCell>
                  <TableCell>{lead.azienda || '-'}</TableCell>
                  <TableCell>
                    <Badge className={LEAD_STATUS_COLORS[lead.status]}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.fonte ? (
                      <span className="text-xs">{LEAD_SOURCE_LABELS[lead.fonte]}</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {lead.budget ? formatCurrency(lead.budget) : '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {lead.data_ultimo_contatto ? formatDateItalian(lead.data_ultimo_contatto) : 'Mai'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Visualizza"
                        onClick={() => { setSelectedLead(lead); setShowLeadDetail(true); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Modifica"
                        onClick={() => { setSelectedLead(lead); setShowLeadDetail(true); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(lead.id)}
                          title="Elimina"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <NewLeadModal
        open={showNewLeadModal}
        onOpenChange={setShowNewLeadModal}
        onLeadCreated={loadLeads}
      />
      
      {selectedLead && (
        <LeadDetailModal
          open={showLeadDetail}
          onOpenChange={setShowLeadDetail}
          lead={selectedLead}
          onLeadUpdated={loadLeads}
        />
      )}
    </div>
  )
}

