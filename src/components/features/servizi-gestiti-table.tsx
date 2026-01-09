'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Search, Eye, Edit, Trash2, ExternalLink, Calendar, RefreshCw, AlertTriangle, Repeat } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { calculateResidualValue } from '@/types/database.types'

interface ServizioGestito {
  id: string
  nome: string
  tipo: string | null
  stato: string | null
  link: string | null
  persona_giuridica_id: string | null
  persona_fisica_id: string | null
  responsabile_email: string | null
  inizio_servizio: string | null
  data_rinnovo: string | null
  rinnovo_automatico: boolean | null
  created_at: string
  // Campi ricorrenza
  is_recurring?: boolean | null
  recurrence_period?: string | null
  recurrence_period_months?: number | null
  total_slots?: number | null
  current_slot?: number | null
  next_renewal_date?: string | null
  slots_paid?: number | null
  unit_price?: number | null
  total_value?: number | null
  // Relazioni
  persona_giuridica?: {
    ragione_sociale: string
  }
  persona_fisica?: {
    nome_completo: string
  }
}

export function ServiziGestitiTable() {
  const router = useRouter()
  const [servizi, setServizi] = useState<ServizioGestito[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [tipoFilter, setTipoFilter] = useState<string>('all')
  const [statoFilter, setStatoFilter] = useState<string>('all')
  const supabase = createClient()

  const loadServizi = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('servizi_gestiti')
        .select(`
          *,
          persona_giuridica:persone_giuridiche(ragione_sociale),
          persona_fisica:persone_fisiche(nome_completo)
        `)
        .order('created_at', { ascending: false })

      // Filtri
      if (searchQuery) {
        query = query.or(`nome.ilike.%${searchQuery}%,link.ilike.%${searchQuery}%`)
      }
      if (tipoFilter !== 'all') {
        query = query.eq('tipo', tipoFilter)
      }
      if (statoFilter !== 'all') {
        query = query.eq('stato', statoFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setServizi(data || [])
    } catch (error) {
      console.error('Errore caricamento servizi:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, tipoFilter, statoFilter, supabase])

  useEffect(() => {
    loadServizi()
  }, [loadServizi])

  const getStatoBadge = (stato: string | null) => {
    switch (stato) {
      case 'Attivo':
        return <Badge className="bg-green-500">Attivo</Badge>
      case 'In avvio':
        return <Badge className="bg-blue-500">In avvio</Badge>
      case 'Interrotto/Recesso':
        return <Badge variant="destructive">Interrotto</Badge>
      case 'Concluso':
        return <Badge variant="secondary">Concluso</Badge>
      default:
        return <Badge variant="outline">{stato || 'N/D'}</Badge>
    }
  }

  const getTipoBadge = (tipo: string | null) => {
    const tipoColori: Record<string, string> = {
      'Sito web': 'bg-purple-500',
      'Dominio': 'bg-blue-500',
      'e-mail': 'bg-cyan-500',
      'Hosting': 'bg-indigo-500',
      'Pagina Social': 'bg-pink-500',
    }
    return (
      <Badge className={tipoColori[tipo || ''] || 'bg-gray-500'}>
        {tipo || 'Altro'}
      </Badge>
    )
  }

  const isRinnovoImminente = (dataRinnovo: string | null) => {
    if (!dataRinnovo) return false
    const diff = new Date(dataRinnovo).getTime() - new Date().getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return days > 0 && days <= 30
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        {/* Filtri */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca per nome o link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i tipi</SelectItem>
              <SelectItem value="Sito web">Sito web</SelectItem>
              <SelectItem value="Dominio">Dominio</SelectItem>
              <SelectItem value="e-mail">E-mail</SelectItem>
              <SelectItem value="Hosting">Hosting</SelectItem>
              <SelectItem value="Pagina Social">Pagina Social</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statoFilter} onValueChange={setStatoFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="Attivo">Attivo</SelectItem>
              <SelectItem value="In avvio">In avvio</SelectItem>
              <SelectItem value="Interrotto/Recesso">Interrotto/Recesso</SelectItem>
              <SelectItem value="Concluso">Concluso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabella */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Prossimo Rinnovo</TableHead>
                <TableHead>Valore Residuo</TableHead>
                <TableHead>Responsabile</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Caricamento...
                  </TableCell>
                </TableRow>
              ) : servizi.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nessun servizio trovato
                  </TableCell>
                </TableRow>
              ) : (
                servizi.map((servizio) => (
                  <TableRow key={servizio.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {servizio.nome}
                        {servizio.link && (
                          <a
                            href={servizio.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTipoBadge(servizio.tipo)}</TableCell>
                    <TableCell>{getStatoBadge(servizio.stato)}</TableCell>
                    <TableCell>
                      {servizio.persona_giuridica?.ragione_sociale ||
                        servizio.persona_fisica?.nome_completo ||
                        '-'}
                    </TableCell>
                    
                    {/* Colonna Slot */}
                    <TableCell>
                      {servizio.is_recurring ? (
                        <div className="flex items-center gap-2">
                          <Repeat className="h-4 w-4 text-blue-500" />
                          <Badge variant="secondary" className="font-mono text-xs">
                            {servizio.current_slot}/{servizio.total_slots}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    {/* Colonna Prossimo Rinnovo */}
                    <TableCell>
                      {servizio.is_recurring && servizio.next_renewal_date ? (
                        <div className="flex items-center gap-2">
                          {isRinnovoImminente(servizio.next_renewal_date) && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          <span className={isRinnovoImminente(servizio.next_renewal_date) ? 'text-orange-600 font-medium' : ''}>
                            {format(new Date(servizio.next_renewal_date), 'dd MMM yyyy', { locale: it })}
                          </span>
                          {servizio.rinnovo_automatico && (
                            <RefreshCw className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      ) : servizio.data_rinnovo ? (
                        <div className="flex items-center gap-2">
                          {isRinnovoImminente(servizio.data_rinnovo) && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          <span className={isRinnovoImminente(servizio.data_rinnovo) ? 'text-orange-600 font-medium' : ''}>
                            {format(new Date(servizio.data_rinnovo), 'dd MMM yyyy', { locale: it })}
                          </span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    
                    {/* Colonna Valore Residuo */}
                    <TableCell>
                      {servizio.is_recurring && servizio.unit_price && servizio.total_slots && servizio.slots_paid !== null ? (
                        <span className="font-mono text-sm font-medium text-orange-600">
                          € {calculateResidualValue(
                            servizio.unit_price,
                            servizio.total_slots,
                            servizio.slots_paid
                          ).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    {/* Colonna Responsabile */}
                    <TableCell>
                      {servizio.responsabile_email ? (
                        <span className="text-sm text-muted-foreground">
                          {servizio.responsabile_email.split('@')[0]}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/servizi-gestiti/${servizio.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/servizi-gestiti/${servizio.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Totale: {servizi.length} servizi</span>
          <span>
            Attivi: {servizi.filter((s) => s.stato === 'Attivo').length}
          </span>
        </div>
      </div>
    </Card>
  )
}

