'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Search, Info, UserPlus } from 'lucide-react'

interface ReferenteSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personaGiuridicaId: string | null
  personaGiuridicaNome?: string
  onSelectReferente: (referente: any) => void
  onQuickAdd: () => void
}

export default function ReferenteSelector({
  open,
  onOpenChange,
  personaGiuridicaId,
  personaGiuridicaNome,
  onSelectReferente,
  onQuickAdd
}: ReferenteSelectorProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [referenti, setReferenti] = useState<any[]>([])
  const [filteredReferenti, setFilteredReferenti] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Definizione loadReferenti PRIMA del suo utilizzo
  const loadReferenti = useCallback(async () => {
    if (!personaGiuridicaId) return

    setLoading(true)
    try {
      // 1. Trova le relazioni tra persone fisiche e questa persona giuridica
      const { data: relazioni, error: relazioniError } = await supabase
        .from('persone_fisiche_relazioni')
        .select('persona_fisica_id, tipo_relazione')
        .eq('persona_giuridica_id', personaGiuridicaId)

      if (relazioniError) throw relazioniError

      if (!relazioni || relazioni.length === 0) {
        setReferenti([])
        return
      }

      // 2. Carica le persone fisiche correlate
      const personeFisicheIds = relazioni.map(r => r.persona_fisica_id).filter((id): id is string => id !== null)
      const { data: personeFisiche, error: pfError } = await supabase
        .from('persone_fisiche')
        .select('*')
        .in('notion_id', personeFisicheIds)
        .order('nome_completo', { ascending: true })

      if (pfError) throw pfError

      // 3. Arricchisci le persone fisiche con il ruolo dalla relazione
      const referentiConRuolo = (personeFisiche || []).map(pf => {
        const relazione = relazioni.find(r => r.persona_fisica_id === pf.notion_id)
        const contatti = (Array.isArray(pf.contatti) ? pf.contatti : []) as any[]
        const email = contatti.find((c: any) => c.tipo === 'email')?.valore
        const telefono = contatti.find((c: any) => ['telefono', 'cellulare'].includes(c.tipo))?.valore

        return {
          ...pf,
          ruolo: relazione?.tipo_relazione || 'Referente',
          email,
          telefono
        }
      })

      setReferenti(referentiConRuolo)
    } catch (error) {
      console.error('Errore caricamento referenti:', error)
    } finally {
      setLoading(false)
    }
  }, [personaGiuridicaId, supabase])

  // Carica referenti correlati alla persona giuridica
  useEffect(() => {
    if (open && personaGiuridicaId) {
      loadReferenti()
    } else {
      setReferenti([])
      setFilteredReferenti([])
    }
  }, [open, personaGiuridicaId, loadReferenti])

  // Applica filtro ricerca
  useEffect(() => {
    let filtered = [...referenti]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.nome_completo?.toLowerCase().includes(query) ||
        r.ruolo?.toLowerCase().includes(query) ||
        r.email?.toLowerCase().includes(query) ||
        r.telefono?.toLowerCase().includes(query)
      )
    }

    setFilteredReferenti(filtered)
  }, [referenti, searchQuery])

  const handleSelectReferente = (referente: any) => {
    onSelectReferente(referente)
    onOpenChange(false)
  }

  const handleQuickAdd = () => {
    onOpenChange(false)
    onQuickAdd()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Seleziona Referente
            {personaGiuridicaNome && (
              <span className="text-sm font-normal text-muted-foreground">per {personaGiuridicaNome}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Ricerca */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cerca per nome, ruolo, email o telefono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="secondary" onClick={handleQuickAdd} className="flex-shrink-0">
              <UserPlus className="h-4 w-4 mr-2" />
              Crea Nuovo
            </Button>
          </div>

          {/* Header con conteggi */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredReferenti.length} referente/i trovato/i
            </span>
          </div>
        </div>

        {/* Lista Referenti */}
        <div className="flex-1 overflow-y-auto border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredReferenti.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Search className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground mb-2">
                {referenti.length === 0 
                  ? 'Nessun referente associato a questa azienda'
                  : 'Nessun referente trovato con questi filtri'}
              </p>
              <Button variant="outline" onClick={handleQuickAdd} className="mt-2">
                <UserPlus className="h-4 w-4 mr-2" />
                Crea Nuovo Referente
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredReferenti.map((referente) => (
                <div
                  key={referente.notion_id}
                  className="flex items-start gap-3 p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleSelectReferente(referente)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{referente.nome_completo}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {referente.ruolo && (
                            <Badge variant="secondary" className="text-xs">
                              {referente.ruolo}
                            </Badge>
                          )}
                          {referente.codice_fiscale && (
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              CF: {referente.codice_fiscale}
                            </code>
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
                              <p><strong>Nome:</strong> {referente.nome_completo}</p>
                              {referente.ruolo && <p><strong>Ruolo:</strong> {referente.ruolo}</p>}
                              {referente.email && <p><strong>Email:</strong> {referente.email}</p>}
                              {referente.telefono && <p><strong>Tel:</strong> {referente.telefono}</p>}
                              {referente.indirizzo && <p><strong>Indirizzo:</strong> {referente.indirizzo}</p>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
                      {referente.email && <span>{referente.email}</span>}
                      {referente.email && referente.telefono && <span>•</span>}
                      {referente.telefono && <span>{referente.telefono}</span>}
                    </div>
                  </div>
                </div>
              ))}
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

