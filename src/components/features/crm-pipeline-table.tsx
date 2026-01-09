'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePermissions } from '@/hooks/usePermissions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  Eye,
  FileText,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Building2,
  User,
  Phone,
  Mail,
} from 'lucide-react'
import { formatDateItalian, formatCurrency } from '@/lib/crm-utils'
import { CRM_OPPORTUNITY_STAGE_LABELS, CRM_OPPORTUNITY_STAGE_VARIANTS } from '@/lib/crm-constants'
import NewProspectModal from './new-prospect-modal'
import OpportunityDetailModal from './opportunity-detail-modal'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface CrmOpportunity {
  id: string
  nome_prospect: string | null
  stage: 'scoperta' | 'proposta' | 'negoziazione' | 'chiuso_vinto' | 'chiuso_perso'
  probability: number
  expected_revenue: number | null
  expected_close_date: string | null
  description: string | null
  notes: string | null
  source: string | null
  created_at: string
  persona_fisica: { notion_id: string; nome_completo: string; contatti?: any[] } | null
  persona_giuridica: { notion_id: string; ragione_sociale: string; email?: any[]; contatti_telefonici?: any[] } | null
  referente: { notion_id: string; nome_completo: string; contatti?: any[] } | null
  opportunity_quotes: { quote: { id: string; quote_number: string; grand_total: number; status: string } | null }[]
}

// Stages attive (non chiuse)
const ACTIVE_STAGES = ['scoperta', 'proposta', 'negoziazione']

export default function CrmPipelineTable() {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const { isAdmin, isSuperAdmin } = usePermissions()
  
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [totalCount, setTotalCount] = useState(0)
  
  const [showNewProspectModal, setShowNewProspectModal] = useState(false)
  const [showOpportunityDetail, setShowOpportunityDetail] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<CrmOpportunity | null>(null)

  const canDelete = isAdmin || isSuperAdmin

  const loadOpportunities = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('crm_opportunities')
        .select(`
          *,
          persona_fisica:persona_fisica_id(notion_id, nome_completo, contatti),
          persona_giuridica:persona_giuridica_id(notion_id, ragione_sociale, email, contatti_telefonici),
          referente:referente_id(notion_id, nome_completo, contatti),
          opportunity_quotes:crm_opportunity_quotes(
            id,
            quote:quote_id(id, quote_number, grand_total, status)
          )
        `, { count: 'exact' })
        .in('stage', ACTIVE_STAGES)
        .order('created_at', { ascending: false })

      if (stageFilter && stageFilter !== 'all') {
        query = query.eq('stage', stageFilter)
      }

      const { data, error, count } = await query

      if (error) throw error

      // Filtro client-side per ricerca
      let filtered = data || []
      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        filtered = filtered.filter((opp: CrmOpportunity) => {
          const prospectName = opp.nome_prospect?.toLowerCase() || ''
          const pfName = opp.persona_fisica?.nome_completo?.toLowerCase() || ''
          const pgName = opp.persona_giuridica?.ragione_sociale?.toLowerCase() || ''
          const refName = opp.referente?.nome_completo?.toLowerCase() || ''
          return prospectName.includes(search) || 
                 pfName.includes(search) || 
                 pgName.includes(search) ||
                 refName.includes(search)
        })
      }

      setOpportunities(filtered)
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading opportunities:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le opportunità',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [stageFilter, searchQuery, supabase, toast])

  useEffect(() => {
    loadOpportunities()
  }, [loadOpportunities])

  const handleStageChange = async (opportunityId: string, newStage: string) => {
    try {
      const updateData: any = { 
        stage: newStage,
        updated_at: new Date().toISOString()
      }
      
      // Se chiudiamo l'opportunità, setta closed_at
      if (newStage === 'chiuso_vinto' || newStage === 'chiuso_perso') {
        updateData.closed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('crm_opportunities')
        .update(updateData)
        .eq('id', opportunityId)

      if (error) throw error

      toast({
        title: 'Successo',
        description: newStage === 'chiuso_vinto' 
          ? '🎉 Opportunità vinta! Cliente acquisito.' 
          : newStage === 'chiuso_perso'
            ? 'Opportunità archiviata.'
            : 'Stato aggiornato.',
      })

      loadOpportunities()
    } catch (error) {
      console.error('Error updating stage:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare lo stato',
        variant: 'destructive',
      })
    }
  }

  const handleCreateQuote = (opportunity: CrmOpportunity) => {
    const clientType = opportunity.persona_giuridica ? 'persona_giuridica' : 'persona_fisica'
    const clientId = opportunity.persona_giuridica?.notion_id || opportunity.persona_fisica?.notion_id
    router.push(`/preventivi/new?client_type=${clientType}&client_id=${clientId}&opportunity_id=${opportunity.id}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa opportunità?')) return

    try {
      const { error } = await supabase
        .from('crm_opportunities')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Successo',
        description: 'Opportunità eliminata',
      })

      loadOpportunities()
    } catch (error) {
      console.error('Error deleting opportunity:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare l\'opportunità',
        variant: 'destructive',
      })
    }
  }

  // Helper per ottenere il nome da mostrare
  const getDisplayName = (opp: CrmOpportunity) => {
    if (opp.nome_prospect) return opp.nome_prospect
    if (opp.persona_giuridica) return opp.persona_giuridica.ragione_sociale
    if (opp.persona_fisica) return opp.persona_fisica.nome_completo
    return 'N/D'
  }

  // Helper per ottenere il contatto
  const getContactInfo = (opp: CrmOpportunity) => {
    // Per persona giuridica, mostra referente
    if (opp.persona_giuridica && opp.referente) {
      return {
        name: opp.referente.nome_completo,
        type: 'referente'
      }
    }
    return null
  }

  // Calcola totale preventivi per opportunità
  const getQuotesTotal = (opp: CrmOpportunity) => {
    return opp.opportunity_quotes?.reduce((sum, oq) => {
      return sum + (oq.quote?.grand_total || 0)
    }, 0) || 0
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca prospect..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 md:pl-10 h-9 md:h-10 text-sm"
          />
        </div>
        
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-[160px] h-9 md:h-10 text-sm">
            <SelectValue placeholder="Filtra per fase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le fasi</SelectItem>
            <SelectItem value="scoperta">🔍 Scoperta</SelectItem>
            <SelectItem value="proposta">📝 Proposta</SelectItem>
            <SelectItem value="negoziazione">🤝 Negoziazione</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={() => setShowNewProspectModal(true)} size="sm" className="h-9 md:h-10">
          <Plus className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Nuovo Prospect</span>
          <span className="sm:hidden">Nuovo</span>
        </Button>
      </div>

      {/* Conteggio */}
      <div className="text-xs md:text-sm text-muted-foreground px-1 md:px-0">
        {opportunities.length} opportunità attive
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
            <p>Nessuna opportunità attiva</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => setShowNewProspectModal(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Aggiungi il primo prospect
            </Button>
          </div>
        ) : (
          opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-card border rounded-lg p-3 space-y-2 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => {
                setSelectedOpportunity(opp)
                setShowOpportunityDetail(true)
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {opp.persona_giuridica ? (
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <p className="font-medium text-sm truncate">{getDisplayName(opp)}</p>
                  </div>
                  {getContactInfo(opp) && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate pl-5">
                      Ref: {getContactInfo(opp)?.name}
                    </p>
                  )}
                </div>
                <Badge variant={CRM_OPPORTUNITY_STAGE_VARIANTS[opp.stage] as any} className="text-[10px] shrink-0">
                  {CRM_OPPORTUNITY_STAGE_LABELS[opp.stage]}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatDateItalian(opp.created_at)}</span>
                <div className="flex items-center gap-2">
                  {opp.opportunity_quotes?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {opp.opportunity_quotes.length}
                    </span>
                  )}
                  {opp.expected_revenue && (
                    <span className="font-medium text-foreground">
                      {formatCurrency(opp.expected_revenue)}
                    </span>
                  )}
                </div>
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
              <TableHead>Prospect</TableHead>
              <TableHead>Fase</TableHead>
              <TableHead>Valore</TableHead>
              <TableHead>Preventivi</TableHead>
              <TableHead>Creato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span>Caricamento...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <p>Nessuna opportunità attiva</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setShowNewProspectModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Aggiungi il primo prospect
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              opportunities.map((opp) => (
                <TableRow key={opp.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell 
                    className="font-medium"
                    onClick={() => {
                      setSelectedOpportunity(opp)
                      setShowOpportunityDetail(true)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {opp.persona_giuridica ? (
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <p>{getDisplayName(opp)}</p>
                        {getContactInfo(opp) && (
                          <p className="text-xs text-muted-foreground">
                            Ref: {getContactInfo(opp)?.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={opp.stage}
                      onValueChange={(value) => handleStageChange(opp.id, value)}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <Badge variant={CRM_OPPORTUNITY_STAGE_VARIANTS[opp.stage] as any} className="text-xs">
                          {CRM_OPPORTUNITY_STAGE_LABELS[opp.stage]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scoperta">🔍 Scoperta</SelectItem>
                        <SelectItem value="proposta">📝 Proposta</SelectItem>
                        <SelectItem value="negoziazione">🤝 Negoziazione</SelectItem>
                        <DropdownMenuSeparator />
                        <SelectItem value="chiuso_vinto">✅ Chiuso Vinto</SelectItem>
                        <SelectItem value="chiuso_perso">❌ Chiuso Perso</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {opp.expected_revenue ? (
                      <span className="font-mono">{formatCurrency(opp.expected_revenue)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {opp.opportunity_quotes?.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{opp.opportunity_quotes.length}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatCurrency(getQuotesTotal(opp))})
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateItalian(opp.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedOpportunity(opp)
                          setShowOpportunityDetail(true)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizza
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateQuote(opp)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Crea Preventivo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleStageChange(opp.id, 'chiuso_vinto')}
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Segna come Vinto
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStageChange(opp.id, 'chiuso_perso')}
                          className="text-orange-600"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Segna come Perso
                        </DropdownMenuItem>
                        {canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(opp.id)}
                              className="text-destructive"
                            >
                              Elimina
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <NewProspectModal
        open={showNewProspectModal}
        onOpenChange={setShowNewProspectModal}
        onProspectCreated={loadOpportunities}
      />

      {selectedOpportunity && (
        <OpportunityDetailModal
          open={showOpportunityDetail}
          onOpenChange={setShowOpportunityDetail}
          opportunity={selectedOpportunity}
          onOpportunityUpdated={loadOpportunities}
        />
      )}
    </div>
  )
}
