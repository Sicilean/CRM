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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Search,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Building2,
  User,
  Trash2,
  Archive,
} from 'lucide-react'
import { formatDateItalian, formatCurrency } from '@/lib/crm-utils'
import { useToast } from '@/components/ui/use-toast'

interface ArchivedOpportunity {
  id: string
  nome_prospect: string | null
  stage: 'chiuso_perso'
  expected_revenue: number | null
  description: string | null
  notes: string | null
  closed_at: string | null
  created_at: string
  persona_fisica: { notion_id: string; nome_completo: string } | null
  persona_giuridica: { notion_id: string; ragione_sociale: string } | null
  referente: { notion_id: string; nome_completo: string } | null
}

export default function CrmArchivedTable() {
  const supabase = createClient()
  const { toast } = useToast()
  const { isAdmin, isSuperAdmin } = usePermissions()
  
  const [opportunities, setOpportunities] = useState<ArchivedOpportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<ArchivedOpportunity | null>(null)

  const canDelete = isAdmin || isSuperAdmin

  const loadOpportunities = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error, count } = await supabase
        .from('crm_opportunities')
        .select(`
          *,
          persona_fisica:persona_fisica_id(notion_id, nome_completo),
          persona_giuridica:persona_giuridica_id(notion_id, ragione_sociale),
          referente:referente_id(notion_id, nome_completo)
        `, { count: 'exact' })
        .eq('stage', 'chiuso_perso')
        .order('closed_at', { ascending: false })

      if (error) throw error

      // Filtro client-side per ricerca
      let filtered = (data || []) as unknown as ArchivedOpportunity[]
      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        filtered = filtered.filter((opp) => {
          const prospectName = opp.nome_prospect?.toLowerCase() || ''
          const pfName = opp.persona_fisica?.nome_completo?.toLowerCase() || ''
          const pgName = opp.persona_giuridica?.ragione_sociale?.toLowerCase() || ''
          return prospectName.includes(search) || pfName.includes(search) || pgName.includes(search)
        })
      }

      setOpportunities(filtered)
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading archived opportunities:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare l\'archivio',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [searchQuery, supabase, toast])

  useEffect(() => {
    loadOpportunities()
  }, [loadOpportunities])

  // Riattiva opportunità creando una nuova in stato "scoperta"
  const handleReactivate = async () => {
    if (!selectedOpportunity) return

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Crea nuova opportunità basata su quella archiviata
      const { error } = await supabase
        .from('crm_opportunities')
        .insert({
          lead_id: null, // Opzionale per opportunità manuali
          persona_fisica_id: selectedOpportunity.persona_fisica?.notion_id || null,
          persona_giuridica_id: selectedOpportunity.persona_giuridica?.notion_id || null,
          referente_id: selectedOpportunity.referente?.notion_id || null,
          nome_prospect: selectedOpportunity.nome_prospect 
            ? `${selectedOpportunity.nome_prospect} (Riattivato)` 
            : null,
          source: 'reactivated',
          stage: 'scoperta',
          probability: 30, // Probabilità più bassa per prospect riattivati
          expected_revenue: selectedOpportunity.expected_revenue,
          description: selectedOpportunity.description,
          notes: `Riattivato da opportunità precedente (${formatDateItalian(selectedOpportunity.closed_at || selectedOpportunity.created_at)}).\n\n${selectedOpportunity.notes || ''}`,
          created_by: user?.id,
          assigned_to: user?.id
        } as any)

      if (error) throw error

      toast({
        title: 'Successo',
        description: 'Nuova opportunità creata in Pipeline!',
      })

      setReactivateDialogOpen(false)
      setSelectedOpportunity(null)
    } catch (error: any) {
      console.error('Error reactivating opportunity:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile riattivare l\'opportunità',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare definitivamente questa opportunità?')) return

    try {
      const { error } = await supabase
        .from('crm_opportunities')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Successo',
        description: 'Opportunità eliminata definitivamente',
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
  const getDisplayName = (opp: ArchivedOpportunity) => {
    if (opp.nome_prospect) return opp.nome_prospect
    if (opp.persona_giuridica) return opp.persona_giuridica.ragione_sociale
    if (opp.persona_fisica) return opp.persona_fisica.nome_completo
    return 'N/D'
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca nell'archivio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 md:pl-10 h-9 md:h-10 text-sm"
          />
        </div>
      </div>

      {/* Conteggio */}
      <div className="text-xs md:text-sm text-muted-foreground px-1 md:px-0">
        {opportunities.length} opportunità archiviate
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
            <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nessuna opportunità archiviata</p>
            <p className="text-xs mt-1">Le opportunità perse appariranno qui</p>
          </div>
        ) : (
          opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-card border rounded-lg p-3 space-y-2"
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
                <Badge variant="outline" className="text-[10px] shrink-0 text-orange-600 border-orange-300">
                  Perso
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Chiuso: {formatDateItalian(opp.closed_at || opp.created_at)}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setSelectedOpportunity(opp)
                    setReactivateDialogOpen(true)
                  }}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Riattiva
                </Button>
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
              <TableHead>Valore Previsto</TableHead>
              <TableHead>Data Chiusura</TableHead>
              <TableHead>Note</TableHead>
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
                  <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nessuna opportunità archiviata</p>
                  <p className="text-xs mt-1">Le opportunità perse appariranno qui</p>
                </TableCell>
              </TableRow>
            ) : (
              opportunities.map((opp) => (
                <TableRow key={opp.id}>
                  <TableCell className="font-medium">
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
                    {opp.expected_revenue ? (
                      <span className="font-mono">{formatCurrency(opp.expected_revenue)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateItalian(opp.closed_at || opp.created_at)}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {opp.notes ? (
                      <p className="text-sm text-muted-foreground truncate" title={opp.notes}>
                        {opp.notes}
                      </p>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedOpportunity(opp)
                            setReactivateDialogOpen(true)
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Riattiva come Nuova Opportunità
                        </DropdownMenuItem>
                        {canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(opp.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Elimina Definitivamente
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

      {/* Dialog Riattivazione */}
      <AlertDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Riattiva Opportunità</AlertDialogTitle>
            <AlertDialogDescription>
              Verrà creata una <strong>nuova opportunità</strong> in fase &quot;Scoperta&quot; basata su questa opportunità archiviata.
              <br /><br />
              L&apos;opportunità originale rimarrà nell&apos;archivio come storico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleReactivate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Riattiva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
