'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePermissions } from '@/hooks/usePermissions'
import { CrmOpportunity as BaseCrmOpportunity } from '@/types/database.types'

// Estendi il tipo per includere le relazioni
type CrmOpportunity = BaseCrmOpportunity & {
  nome_prospect: string | null
  referente: { notion_id: string; nome_completo: string } | null
  opportunity_quotes?: any[]
  lead?: any
  persona_fisica?: any
  persona_giuridica?: any
}
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Eye, FileText } from 'lucide-react'
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS } from '@/lib/crm-constants'
import { formatDateItalian, formatCurrency } from '@/lib/crm-utils'
import OpportunityDetailModal from './opportunity-detail-modal'

export default function CrmOpportunitiesTable() {
  const supabase = createClient()
  const { isAgente, isAdmin, isSuperAdmin } = usePermissions()
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('')
  const [totalCount, setTotalCount] = useState(0)
  
  // Solo admin possono eliminare opportunità
  const canDelete = isAdmin || isSuperAdmin
  
  // Modal states
  const [showOpportunityDetail, setShowOpportunityDetail] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<CrmOpportunity | null>(null)

  const loadOpportunities = useCallback(async () => {
    setLoading(true)
    try {
      // Le RLS policies gestiscono automaticamente il filtraggio:
      // - Admin/Super Admin vedono tutte le opportunità
      // - Agenti vedono solo le opportunità assegnate a loro o create da loro
      let query = supabase
        .from('crm_opportunities')
        .select(`
          *,
          lead:lead_id(nome_completo, email),
          persona_fisica:persona_fisica_id(nome_completo),
          persona_giuridica:persona_giuridica_id(ragione_sociale),
          opportunity_quotes:crm_opportunity_quotes(
            id,
            quote:quote_id(id, quote_number, grand_total, status)
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      if (stageFilter) query = query.eq('stage', stageFilter)

      const { data, error, count } = await query

      if (error) throw error

      setOpportunities((data || []) as unknown as CrmOpportunity[])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading opportunities:', error)
    } finally {
      setLoading(false)
    }
  }, [stageFilter, supabase])

  useEffect(() => {
    loadOpportunities()
  }, [loadOpportunities])

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Toolbar Mobile */}
      <div className="flex gap-2 md:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={stageFilter || 'all'} onValueChange={(v) => setStageFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-28 h-9 text-xs">
            <SelectValue placeholder="Fase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte</SelectItem>
            <SelectItem value="scoperta">Scoperta</SelectItem>
            <SelectItem value="proposta">Proposta</SelectItem>
            <SelectItem value="negoziazione">Negoziazione</SelectItem>
            <SelectItem value="chiuso_vinto">Vinto</SelectItem>
            <SelectItem value="chiuso_perso">Perso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Toolbar Desktop */}
      <div className="hidden md:flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca opportunità..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={stageFilter || 'all'} onValueChange={(v) => setStageFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tutte le fasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le fasi</SelectItem>
            <SelectItem value="scoperta">Scoperta</SelectItem>
            <SelectItem value="proposta">Proposta</SelectItem>
            <SelectItem value="negoziazione">Negoziazione</SelectItem>
            <SelectItem value="chiuso_vinto">Chiuso Vinto</SelectItem>
            <SelectItem value="chiuso_perso">Chiuso Perso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conteggio */}
      <div className="text-xs md:text-sm text-muted-foreground px-1 md:px-0">
        {totalCount} opportunità
      </div>

      {/* Card View Mobile */}
      <div className="md:hidden space-y-2">
        {loading && opportunities.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="text-sm">Caricamento...</span>
            </div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nessuna opportunità trovata
          </div>
        ) : (
          opportunities.map((opp) => {
            const clientName = opp.persona_giuridica 
              ? (opp.persona_giuridica as any).ragione_sociale 
              : (opp.persona_fisica as any)?.nome_completo || '-'
            const quotesCount = (opp.opportunity_quotes as any[])?.length || 0

            return (
              <div 
                key={opp.id} 
                className="bg-card border rounded-lg p-3 space-y-2"
                onClick={() => { setSelectedOpportunity(opp); setShowOpportunityDetail(true); }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{clientName}</p>
                    <p className="text-xs text-muted-foreground">{opp.probability}% probabilità</p>
                  </div>
                  <Badge className={`${OPPORTUNITY_STAGE_COLORS[opp.stage]} text-[10px] px-1.5 py-0 shrink-0`}>
                    {OPPORTUNITY_STAGE_LABELS[opp.stage]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{opp.expected_revenue ? formatCurrency(opp.expected_revenue) : 'Valore N/D'}</span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {quotesCount} prev.
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Tabella Desktop */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Lead Origine</TableHead>
              <TableHead>Fase</TableHead>
              <TableHead>Probabilità</TableHead>
              <TableHead>Valore Atteso</TableHead>
              <TableHead>Data Chiusura</TableHead>
              <TableHead>Preventivi</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span>Caricamento...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nessuna opportunità trovata
                </TableCell>
              </TableRow>
            ) : (
              opportunities.map((opp) => {
                const clientName = opp.persona_giuridica 
                  ? (opp.persona_giuridica as any).ragione_sociale 
                  : (opp.persona_fisica as any)?.nome_completo || '-'
                
                const leadName = (opp.lead as any)?.nome_completo || '-'
                const quotesCount = (opp.opportunity_quotes as any[])?.length || 0
                const acceptedQuotes = (opp.opportunity_quotes as any[])?.filter(
                  (oq: any) => oq.quote?.status === 'accepted'
                ).length || 0

                return (
                  <TableRow key={opp.id}>
                    <TableCell className="font-medium">{clientName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{leadName}</TableCell>
                    <TableCell>
                      <Badge className={OPPORTUNITY_STAGE_COLORS[opp.stage]}>
                        {OPPORTUNITY_STAGE_LABELS[opp.stage]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-foreground transition-all"
                            style={{ width: `${opp.probability}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{opp.probability}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {opp.expected_revenue ? formatCurrency(opp.expected_revenue) : '-'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {opp.expected_close_date ? formatDateItalian(opp.expected_close_date) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <FileText className="h-3 w-3" />
                        <span>{quotesCount}</span>
                        {acceptedQuotes > 0 && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            {acceptedQuotes} accettati
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Visualizza"
                        onClick={() => { setSelectedOpportunity(opp); setShowOpportunityDetail(true); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          open={showOpportunityDetail}
          onOpenChange={setShowOpportunityDetail}
          opportunity={selectedOpportunity as any}
          onOpportunityUpdated={loadOpportunities}
        />
      )}
    </div>
  )
}

