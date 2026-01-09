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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Eye,
  MoreHorizontal,
  Plus,
  Building2,
  User,
  FileText,
  Trophy,
} from 'lucide-react'
import { formatDateItalian, formatCurrency } from '@/lib/crm-utils'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import OpportunityDetailModal from './opportunity-detail-modal'
import NewProspectModal from './new-prospect-modal'

interface WonOpportunity {
  id: string
  nome_prospect: string | null
  stage: 'chiuso_vinto'
  expected_revenue: number | null
  description: string | null
  notes: string | null
  closed_at: string | null
  created_at: string
  persona_fisica: { notion_id: string; nome_completo: string; contatti?: any[] } | null
  persona_giuridica: { notion_id: string; ragione_sociale: string; email?: any[]; contatti_telefonici?: any[] } | null
  referente: { notion_id: string; nome_completo: string; contatti?: any[] } | null
  opportunity_quotes: { quote: { id: string; quote_number: string; grand_total: number; status: string } | null }[]
}

export default function CrmClientsWonTable() {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const { isAdmin, isSuperAdmin } = usePermissions()
  
  const [opportunities, setOpportunities] = useState<WonOpportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  
  const [showNewProspectModal, setShowNewProspectModal] = useState(false)
  const [showOpportunityDetail, setShowOpportunityDetail] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<WonOpportunity | null>(null)

  const loadOpportunities = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error, count } = await supabase
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
        .eq('stage', 'chiuso_vinto')
        .order('closed_at', { ascending: false })

      if (error) throw error

      // Filtro client-side per ricerca
      let filtered = data || []
      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        filtered = filtered.filter((opp: WonOpportunity) => {
          const prospectName = opp.nome_prospect?.toLowerCase() || ''
          const pfName = opp.persona_fisica?.nome_completo?.toLowerCase() || ''
          const pgName = opp.persona_giuridica?.ragione_sociale?.toLowerCase() || ''
          return prospectName.includes(search) || pfName.includes(search) || pgName.includes(search)
        })
      }

      setOpportunities(filtered)
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading won opportunities:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i clienti',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [searchQuery, supabase, toast])

  useEffect(() => {
    loadOpportunities()
  }, [loadOpportunities])

  // Crea nuova opportunità per un cliente esistente
  const handleNewOpportunityForClient = (opp: WonOpportunity) => {
    // Naviga al modal per creare nuova opportunità pre-compilato con i dati del cliente
    const clientType = opp.persona_giuridica ? 'persona_giuridica' : 'persona_fisica'
    const clientId = opp.persona_giuridica?.notion_id || opp.persona_fisica?.notion_id
    
    // Per ora apriamo il modal standard, in futuro si può pre-compilare
    setShowNewProspectModal(true)
  }

  const handleCreateQuote = (opp: WonOpportunity) => {
    const clientType = opp.persona_giuridica ? 'persona_giuridica' : 'persona_fisica'
    const clientId = opp.persona_giuridica?.notion_id || opp.persona_fisica?.notion_id
    router.push(`/preventivi/new?client_type=${clientType}&client_id=${clientId}`)
  }

  // Helper per ottenere il nome da mostrare
  const getDisplayName = (opp: WonOpportunity) => {
    if (opp.nome_prospect) return opp.nome_prospect
    if (opp.persona_giuridica) return opp.persona_giuridica.ragione_sociale
    if (opp.persona_fisica) return opp.persona_fisica.nome_completo
    return 'N/D'
  }

  // Calcola totale preventivi per opportunità
  const getQuotesTotal = (opp: WonOpportunity) => {
    return opp.opportunity_quotes?.reduce((sum, oq) => {
      return sum + (oq.quote?.grand_total || 0)
    }, 0) || 0
  }

  // Conta preventivi accettati
  const getAcceptedQuotesCount = (opp: WonOpportunity) => {
    return opp.opportunity_quotes?.filter(oq => oq.quote?.status === 'accepted').length || 0
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca clienti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 md:pl-10 h-9 md:h-10 text-sm"
          />
        </div>
      </div>

      {/* Conteggio */}
      <div className="text-xs md:text-sm text-muted-foreground px-1 md:px-0">
        {opportunities.length} clienti acquisiti
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
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nessun cliente acquisito</p>
            <p className="text-xs mt-1">Le opportunità vinte appariranno qui</p>
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
                  {opp.referente && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate pl-5">
                      Ref: {opp.referente.nome_completo}
                    </p>
                  )}
                </div>
                <Badge variant="default" className="text-[10px] shrink-0 bg-green-600">
                  <Trophy className="h-3 w-3 mr-1" />
                  Cliente
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Vinto: {formatDateItalian(opp.closed_at || opp.created_at)}</span>
                <div className="flex items-center gap-2">
                  {opp.opportunity_quotes?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {opp.opportunity_quotes.length}
                    </span>
                  )}
                  {getQuotesTotal(opp) > 0 && (
                    <span className="font-medium text-green-600">
                      {formatCurrency(getQuotesTotal(opp))}
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
              <TableHead>Cliente</TableHead>
              <TableHead>Valore Deal</TableHead>
              <TableHead>Preventivi</TableHead>
              <TableHead>Data Acquisizione</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span>Caricamento...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nessun cliente acquisito</p>
                  <p className="text-xs mt-1">Le opportunità vinte appariranno qui</p>
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
                        {opp.referente && (
                          <p className="text-xs text-muted-foreground">
                            Ref: {opp.referente.nome_completo}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getQuotesTotal(opp) > 0 ? (
                      <span className="font-mono font-bold text-green-600">
                        {formatCurrency(getQuotesTotal(opp))}
                      </span>
                    ) : opp.expected_revenue ? (
                      <span className="font-mono text-muted-foreground">
                        {formatCurrency(opp.expected_revenue)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {opp.opportunity_quotes?.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{getAcceptedQuotesCount(opp)}/{opp.opportunity_quotes.length}</span>
                        <span className="text-xs text-muted-foreground">accettati</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateItalian(opp.closed_at || opp.created_at)}
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
                          Visualizza Dettagli
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleNewOpportunityForClient(opp)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nuova Opportunità
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateQuote(opp)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Nuovo Preventivo
                        </DropdownMenuItem>
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
          opportunity={selectedOpportunity as any}
          onOpportunityUpdated={loadOpportunities}
        />
      )}
    </div>
  )
}
