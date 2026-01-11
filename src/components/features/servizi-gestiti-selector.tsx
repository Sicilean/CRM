'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Server, Plus } from 'lucide-react'
// import { QuickAddServizioGestito } from './quick-add-servizio-gestito' // File non trovato

interface ServizioGestito {
  id: string
  nome: string
  stato: string | null
  tipo: string | null
}

interface ServiziGestitiSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  onConfirm: (servizi: ServizioGestito[]) => void
  clientId?: string
  projectId?: string
}

export function ServiziGestitiSelector({ 
  open, 
  onOpenChange, 
  selectedIds,
  onConfirm,
  clientId,
  projectId
}: ServiziGestitiSelectorProps) {
  const [servizi, setServizi] = useState<ServizioGestito[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tempSelected, setTempSelected] = useState<string[]>(selectedIds)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const supabase = createClient()

  const loadServizi = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('servizi_gestiti')
        .select('id, nome, stato, tipo')
        .is('project_id', null) // Solo servizi non ancora assegnati
        .order('nome', { ascending: true })

      // Filtra per cliente se specificato
      if (clientId) {
        query = query.eq('persona_giuridica_id', clientId)
      }

      const { data, error } = await query

      if (error) throw error

      setServizi((data || []) as unknown as ServizioGestito[])
    } catch (error) {
      console.error('Errore caricamento servizi gestiti:', error)
    } finally {
      setLoading(false)
    }
  }, [clientId, supabase])

  useEffect(() => {
    if (open) {
      loadServizi()
      setTempSelected(selectedIds)
    }
  }, [open, clientId, loadServizi, selectedIds])

  useEffect(() => {
    setTempSelected(selectedIds)
  }, [selectedIds])

  const filteredServizi = servizi.filter(s => {
    const searchLower = searchQuery.toLowerCase()
    return (
      s.nome.toLowerCase().includes(searchLower) ||
      (s.tipo?.toLowerCase() || '').includes(searchLower)
    )
  })

  const handleToggle = (servizioId: string) => {
    setTempSelected(prev => 
      prev.includes(servizioId) 
        ? prev.filter(id => id !== servizioId)
        : [...prev, servizioId]
    )
  }

  const handleConfirm = () => {
    const selected = servizi.filter(s => tempSelected.includes(s.id))
    onConfirm(selected)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Seleziona Servizi Gestiti
            </DialogTitle>
            {clientId && projectId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickAddOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Ricerca */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cerca per nome o tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredServizi.length} servizio/i disponibile/i
            </span>
            <span>
              {tempSelected.length} selezionato/i
            </span>
          </div>
        </div>

        {/* Lista Servizi Gestiti */}
        <div className="flex-1 overflow-y-auto border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredServizi.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {servizi.length === 0 
                  ? 'Nessun servizio disponibile' 
                  : 'Nessun servizio trovato con questi filtri'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredServizi.map((servizio) => (
                <div
                  key={servizio.id}
                  className="flex items-center gap-3 p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleToggle(servizio.id)}
                >
                  <Checkbox
                    checked={tempSelected.includes(servizio.id)}
                    onCheckedChange={() => handleToggle(servizio.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate mb-1">{servizio.nome}</h4>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {servizio.tipo || 'N/D'}
                      </Badge>
                      <Badge 
                        variant={servizio.stato === 'attivo' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {servizio.stato}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleConfirm}>
            Conferma ({tempSelected.length})
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* QuickAddServizioGestito component non disponibile - file mancante */}
      {/* {clientId && projectId && (
        <QuickAddServizioGestito
          open={quickAddOpen}
          onOpenChange={setQuickAddOpen}
          projectId={projectId}
          personaGiuridicaId={clientId}
          onAdded={(newServizio) => {
            setServizi(prev => [...prev, newServizio])
            setTempSelected(prev => [...prev, newServizio.id])
          }}
        />
      )} */}
    </Dialog>
  )
}

