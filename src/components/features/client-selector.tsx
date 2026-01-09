'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Search, Info, X, Building2, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

interface ClientSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientType: 'persona_fisica' | 'persona_giuridica'
  onSelectClient: (client: any) => void
}

export default function ClientSelector({
  open,
  onOpenChange,
  clientType,
  onSelectClient
}: ClientSelectorProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [filteredClients, setFilteredClients] = useState<any[]>([])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [provinceFilter, setProvinceFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  
  // Stati per opzioni dei filtri
  const [uniqueProvinces, setUniqueProvinces] = useState<string[]>([])
  const [uniqueTypes, setUniqueTypes] = useState<string[]>([])

  // 🚀 DEBOUNCING: Aspetta 400ms dopo l'ultimo carattere digitato prima di cercare
  const debouncedSearchQuery = useDebounce(searchQuery, 400)
  const debouncedProvinceFilter = useDebounce(provinceFilter, 300)
  const debouncedTypeFilter = useDebounce(typeFilter, 300)

  // Stato per mostrare "searching..." mentre si digita
  const isSearching = searchQuery !== debouncedSearchQuery || 
                      provinceFilter !== debouncedProvinceFilter || 
                      typeFilter !== debouncedTypeFilter

  // Carica clienti quando si apre la modale o cambiano i filtri/ricerca (DEBOUNCIATI)
  useEffect(() => {
    if (open) {
      loadClients()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clientType, debouncedSearchQuery, debouncedProvinceFilter, debouncedTypeFilter])

  const loadClients = async () => {
    setLoading(true)
    try {
      const table = clientType === 'persona_fisica' ? 'persone_fisiche' : 'persone_giuridiche'
      
      // 🚀 OTTIMIZZAZIONE EGRESS: Seleziona SOLO i campi necessari per il selector
      const selectFields = clientType === 'persona_fisica'
        ? 'notion_id, nome_completo, codice_fiscale, contatti, indirizzo'
        : 'notion_id, ragione_sociale, p_iva, email, contatti_telefonici, sede_legale, provincia, tipo_organizzazione, forma_giuridica'
      
      let query = supabase
        .from(table)
        .select(selectFields)
        .order(clientType === 'persona_fisica' ? 'nome_completo' : 'ragione_sociale', { ascending: true })
        .limit(200) // 🚀 LIMIT per sicurezza: mostra solo primi 200 risultati

      // Applicare filtri avanzati (solo PG) - USA VALORI DEBOUNCIATI
      if (clientType === 'persona_giuridica') {
        if (debouncedProvinceFilter) {
          query = query.eq('provincia', debouncedProvinceFilter)
        }
        if (debouncedTypeFilter) {
          query = query.eq('tipo_organizzazione', debouncedTypeFilter)
        }
      }

      // Ricerca full-text nel database - USA VALORE DEBOUNCIATO
      if (debouncedSearchQuery.trim()) {
        if (clientType === 'persona_fisica') {
          // Ricerca per persone fisiche: nome, codice fiscale, indirizzo
          query = query.or(`nome_completo.ilike.%${debouncedSearchQuery}%,codice_fiscale.ilike.%${debouncedSearchQuery}%,indirizzo.ilike.%${debouncedSearchQuery}%`)
        } else {
          // Ricerca per persone giuridiche: STESSI CAMPI della pagina persone-giuridiche
          query = query.or(`ragione_sociale.ilike.%${debouncedSearchQuery}%,p_iva.ilike.%${debouncedSearchQuery}%,codice_fiscale.ilike.%${debouncedSearchQuery}%,sede_legale.ilike.%${debouncedSearchQuery}%,settore.ilike.%${debouncedSearchQuery}%,descrizione_core_business.ilike.%${debouncedSearchQuery}%,provincia.ilike.%${debouncedSearchQuery}%,comune.ilike.%${debouncedSearchQuery}%,rea.ilike.%${debouncedSearchQuery}%`)
        }
      }

      const { data, error } = await query

      if (error) throw error
      setClients(data || [])
      setFilteredClients(data || [])
    } catch (error) {
      console.error('Errore caricamento clienti:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectClient = (client: any) => {
    onSelectClient(client)
    onOpenChange(false)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setProvinceFilter('')
    setTypeFilter('')
  }

  const activeFiltersCount = (provinceFilter ? 1 : 0) + (typeFilter ? 1 : 0) + (searchQuery ? 1 : 0)

  // Carica province e tipi unici quando si apre la modale
  // 🚀 OTTIMIZZAZIONE EGRESS: Usa RPC per ottenere valori DISTINCT in modo efficiente
  useEffect(() => {
    const loadFilterOptions = async () => {
      if (open && clientType === 'persona_giuridica') {
        try {
          // 🚀 OTTIMIZZAZIONE: Query SQL ottimizzata per ottenere valori DISTINCT
          // Invece di scaricare 1954 righe, esegue DISTINCT nel DB
          const { data: provinceData } = await supabase
            .rpc('get_unique_provinces_optimized')
          
          if (provinceData) {
            setUniqueProvinces(provinceData as string[])
          }

          const { data: typeData } = await supabase
            .rpc('get_unique_organization_types_optimized')
          
          if (typeData) {
            setUniqueTypes(typeData as string[])
          }
        } catch (error) {
          // Fallback: se le funzioni RPC non esistono, usa query standard ma ottimizzata
          console.warn('RPC functions not available, using fallback. Consider creating them for better performance.')
          try {
            // Fallback ottimizzato: usa aggregazione lato client ma limita risultati
            const { data: provinceData } = await supabase
              .from('persone_giuridiche')
              .select('provincia')
              .not('provincia', 'is', null)
              .limit(1000) // 🚀 LIMIT per sicurezza
            
            if (provinceData) {
              const provinces = [...new Set(provinceData.map((p: any) => p.provincia).filter(Boolean))].sort()
              setUniqueProvinces(provinces as string[])
            }

            const { data: typeData } = await supabase
              .from('persone_giuridiche')
              .select('tipo_organizzazione')
              .not('tipo_organizzazione', 'is', null)
              .limit(1000) // 🚀 LIMIT per sicurezza
            
            if (typeData) {
              const types = [...new Set(typeData.map((t: any) => t.tipo_organizzazione).filter(Boolean))].sort()
              setUniqueTypes(types as string[])
            }
          } catch (fallbackError) {
            console.error('Errore caricamento opzioni filtri (fallback):', fallbackError)
          }
        }
      }
    }

    loadFilterOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clientType])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {clientType === 'persona_fisica' ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            Seleziona {clientType === 'persona_fisica' ? 'Persona Fisica' : 'Azienda/Ente'}
          </DialogTitle>
        </DialogHeader>

        {/* Filtri e Ricerca */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              {isSearching && !loading ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              )}
              <Input
                placeholder={clientType === 'persona_fisica' ? 'Cerca per nome o codice fiscale...' : 'Cerca in tutti i campi...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {isSearching && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                  ricerca...
                </span>
              )}
            </div>

            {clientType === 'persona_giuridica' && (
              <div className="flex gap-2">
                <Select value={provinceFilter || 'all'} onValueChange={(value) => setProvinceFilter(value === 'all' ? '' : value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte</SelectItem>
                    {uniqueProvinces.map(prov => (
                      <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter || 'all'} onValueChange={(value) => setTypeFilter(value === 'all' ? '' : value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="icon" onClick={clearFilters} title="Pulisci filtri">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Header con conteggi */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredClients.length} {clientType === 'persona_fisica' ? 'persona/e' : 'azienda/e'}
            </span>
            {activeFiltersCount > 0 && (
              <span className="text-xs">
                {activeFiltersCount} filtro/i attivo/i
              </span>
            )}
          </div>
        </div>

        {/* Lista Clienti */}
        <div className="flex-1 overflow-y-auto border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery || provinceFilter || typeFilter
                  ? 'Nessun cliente trovato con questi filtri'
                  : 'Nessun cliente disponibile'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredClients.map((client) => {
                const isPersonaFisica = clientType === 'persona_fisica'
                const displayName = isPersonaFisica ? client.nome_completo : client.ragione_sociale
                const contatti = isPersonaFisica ? client.contatti : null
                const email = isPersonaFisica 
                  ? contatti?.find((c: any) => c.tipo === 'email')?.valore 
                  : client.email?.[0]?.valore
                const telefono = isPersonaFisica
                  ? contatti?.find((c: any) => ['telefono', 'cellulare'].includes(c.tipo))?.valore
                  : client.contatti_telefonici?.[0]?.valore

                return (
                  <div
                    key={isPersonaFisica ? client.notion_id : client.notion_id}
                    className="flex items-start gap-3 p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{displayName}</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {isPersonaFisica ? (
                              <>
                                {client.codice_fiscale && (
                                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                    CF: {client.codice_fiscale}
                                  </code>
                                )}
                              </>
                            ) : (
                              <>
                                {client.p_iva && (
                                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                    P.IVA: {client.p_iva}
                                  </code>
                                )}
                                {client.provincia && (
                                  <Badge variant="outline" className="text-xs">
                                    {client.provincia}
                                  </Badge>
                                )}
                                {client.tipo_organizzazione && (
                                  <Badge variant="secondary" className="text-xs">
                                    {client.tipo_organizzazione}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-sm">
                              <div className="text-xs space-y-1">
                                {email && <p><strong>Email:</strong> {email}</p>}
                                {telefono && <p><strong>Tel:</strong> {telefono}</p>}
                                {!isPersonaFisica && client.sede_legale && (
                                  <p><strong>Sede:</strong> {client.sede_legale}</p>
                                )}
                                {isPersonaFisica && client.indirizzo && (
                                  <p><strong>Indirizzo:</strong> {client.indirizzo}</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
                        {email && <span>{email}</span>}
                        {email && telefono && <span>•</span>}
                        {telefono && <span>{telefono}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

