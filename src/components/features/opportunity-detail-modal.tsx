'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CrmOpportunity, Quote } from '@/types/database.types'
import { CRM_OPPORTUNITY_STAGE_LABELS, CRM_OPPORTUNITY_STAGE_VARIANTS } from '@/lib/crm-constants'
import { formatDateItalian, formatCurrency } from '@/lib/crm-utils'
import { useToast } from '@/components/ui/use-toast'
import { Save, FileText, CheckCircle, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OpportunityDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity: CrmOpportunity
  onOpportunityUpdated?: () => void
}

export default function OpportunityDetailModal({ 
  open, 
  onOpenChange, 
  opportunity, 
  onOpportunityUpdated 
}: OpportunityDetailModalProps) {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  
  const [formData, setFormData] = useState({
    stage: opportunity.stage,
    probability: opportunity.probability?.toString() || '50',
    expected_revenue: opportunity.expected_revenue?.toString() || '',
    expected_close_date: opportunity.expected_close_date || '',
    description: opportunity.description || '',
    notes: opportunity.notes || ''
  })

  const loadQuotes = useCallback(async () => {
    setLoadingQuotes(true)
    try {
      // Carica i preventivi collegati all'opportunità
      const { data: oppQuotes, error: oppError } = await supabase
        .from('crm_opportunity_quotes')
        .select('quote_id')
        .eq('opportunity_id', opportunity.id)

      if (oppError) throw oppError

      if (oppQuotes && oppQuotes.length > 0) {
        const quoteIds = oppQuotes.map(q => q.quote_id)
        
        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .in('id', quoteIds)
          .order('created_at', { ascending: false })

        if (quotesError) throw quotesError
        setQuotes(quotesData || [])
      } else {
        setQuotes([])
      }
    } catch (error) {
      console.error('Error loading quotes:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i preventivi.',
        variant: 'destructive',
      })
    } finally {
      setLoadingQuotes(false)
    }
  }, [supabase, opportunity.id, toast])

  useEffect(() => {
    if (open) {
      loadQuotes()
    }
  }, [open, loadQuotes])

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('crm_opportunities')
        .update({
          stage: formData.stage,
          probability: parseInt(formData.probability),
          expected_revenue: formData.expected_revenue ? parseFloat(formData.expected_revenue) : null,
          expected_close_date: formData.expected_close_date || null,
          description: formData.description || null,
          notes: formData.notes || null,
          closed_at: formData.stage === 'chiuso_vinto' || formData.stage === 'chiuso_perso' ? new Date().toISOString() : null
        })
        .eq('id', opportunity.id)

      if (error) throw error

      toast({
        title: 'Successo',
        description: 'Opportunità aggiornata con successo.',
      })

      if (onOpportunityUpdated) onOpportunityUpdated()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error updating opportunity:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare l\'opportunità: ' + error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuote = () => {
    // Naviga alla pagina di creazione preventivo pre-compilata
    const clientType = opportunity.persona_giuridica_id ? 'persona_giuridica' : 'persona_fisica'
    const clientId = opportunity.persona_giuridica_id || opportunity.persona_fisica_id
    
    router.push(`/preventivi/new?client_type=${clientType}&client_id=${clientId}&opportunity_id=${opportunity.id}`)
    onOpenChange(false)
  }

  const getQuoteStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, variant: any }> = {
      'draft': { label: 'Bozza', variant: 'secondary' },
      'sent': { label: 'Inviato', variant: 'default' },
      'accepted': { label: 'Accettato', variant: 'default' },
      'rejected': { label: 'Rifiutato', variant: 'destructive' },
      'expired': { label: 'Scaduto', variant: 'outline' }
    }
    const { label, variant } = statusMap[status] || { label: status, variant: 'default' }
    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Dettagli Opportunità
            <Badge variant={CRM_OPPORTUNITY_STAGE_VARIANTS[opportunity.stage] as any}>
              {CRM_OPPORTUNITY_STAGE_LABELS[opportunity.stage]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Dettagli</TabsTrigger>
            <TabsTrigger value="quotes">Preventivi ({quotes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="stage">Stato Opportunità</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value: CrmOpportunity['stage']) => setFormData({ ...formData, stage: value })}
                >
                  <SelectTrigger id="stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CRM_OPPORTUNITY_STAGE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="probability">Probabilità (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="expected_revenue">Revenue Atteso (€)</Label>
                <Input
                  id="expected_revenue"
                  type="number"
                  value={formData.expected_revenue}
                  onChange={(e) => setFormData({ ...formData, expected_revenue: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expected_close_date">Data Chiusura Prevista</Label>
              <Input
                id="expected_close_date"
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
              
              {formData.stage === 'chiuso_vinto' && (
                <Button variant="outline" disabled>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Cliente Acquisito
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quotes" className="space-y-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {quotes.length} preventiv{quotes.length !== 1 ? 'i' : 'o'} collegat{quotes.length !== 1 ? 'i' : 'o'}
              </p>
              <Button onClick={handleCreateQuote} size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Crea Nuovo Preventivo
              </Button>
            </div>

            <div className="space-y-2">
              {loadingQuotes ? (
                <p className="text-center text-muted-foreground py-4">Caricamento preventivi...</p>
              ) : quotes.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Nessun preventivo collegato</p>
                    <Button onClick={handleCreateQuote} size="sm" className="mt-4">
                      <FileText className="mr-2 h-4 w-4" />
                      Crea il primo preventivo
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                quotes.map((quote) => (
                  <Card key={quote.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{quote.quote_number}</h4>
                            {getQuoteStatusBadge(quote.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Cliente: {quote.client_name}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-mono font-bold">
                              {formatCurrency(Number(quote.total_amount) || 0)}
                            </span>
                            <span className="text-muted-foreground">
                              Creato: {quote.created_at ? formatDateItalian(quote.created_at) : 'N/A'}
                            </span>
                            {quote.valid_until && (
                              <span className="text-muted-foreground">
                                Valido fino: {formatDateItalian(quote.valid_until)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/preventivi/${quote.id}/edit`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

