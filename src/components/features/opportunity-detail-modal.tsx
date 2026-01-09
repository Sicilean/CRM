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
import { CRM_OPPORTUNITY_STAGE_LABELS, CRM_OPPORTUNITY_STAGE_VARIANTS, CRM_ACTIVITY_TYPES } from '@/lib/crm-constants'
import { formatDateItalian, formatCurrency } from '@/lib/crm-utils'
import { useToast } from '@/components/ui/use-toast'
import { 
  Save, 
  FileText, 
  CheckCircle, 
  ExternalLink, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare,
  Building2,
  User,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CrmActivity {
  id: string
  activity_type: 'email' | 'telefono' | 'meeting' | 'nota' | 'task' | 'whatsapp' | 'altro'
  subject: string | null
  description: string
  outcome: string | null
  activity_date: string
  due_date: string | null
  completed: boolean
  created_at: string
}

interface Quote {
  id: string
  quote_number: string
  grand_total: number
  status: string
  created_at: string
  valid_until: string | null
  client_name: string
}

interface CrmOpportunity {
  id: string
  nome_prospect: string | null
  stage: 'scoperta' | 'proposta' | 'negoziazione' | 'chiuso_vinto' | 'chiuso_perso'
  probability: number
  expected_revenue: number | null
  expected_close_date: string | null
  description: string | null
  notes: string | null
  created_at: string
  persona_fisica: { notion_id: string; nome_completo: string; contatti?: any[] } | null
  persona_giuridica: { notion_id: string; ragione_sociale: string; email?: any[]; contatti_telefonici?: any[] } | null
  referente: { notion_id: string; nome_completo: string; contatti?: any[] } | null
  opportunity_quotes?: { quote: Quote | null }[]
}

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
  const [activities, setActivities] = useState<CrmActivity[]>([])
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  const [loadingActivities, setLoadingActivities] = useState(false)
  
  const [formData, setFormData] = useState({
    stage: opportunity.stage,
    probability: opportunity.probability?.toString() || '50',
    expected_revenue: opportunity.expected_revenue?.toString() || '',
    expected_close_date: opportunity.expected_close_date || '',
    description: opportunity.description || '',
    notes: opportunity.notes || ''
  })

  const [newActivity, setNewActivity] = useState({
    activity_type: 'nota' as CrmActivity['activity_type'],
    subject: '',
    description: '',
    outcome: ''
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
    } finally {
      setLoadingQuotes(false)
    }
  }, [supabase, opportunity.id])

  const loadActivities = useCallback(async () => {
    setLoadingActivities(true)
    try {
      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('opportunity_id', opportunity.id)
        .order('activity_date', { ascending: false })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoadingActivities(false)
    }
  }, [supabase, opportunity.id])

  useEffect(() => {
    if (open) {
      loadQuotes()
      loadActivities()
      // Reset form quando si apre
      setFormData({
        stage: opportunity.stage,
        probability: opportunity.probability?.toString() || '50',
        expected_revenue: opportunity.expected_revenue?.toString() || '',
        expected_close_date: opportunity.expected_close_date || '',
        description: opportunity.description || '',
        notes: opportunity.notes || ''
      })
    }
  }, [open, loadQuotes, loadActivities, opportunity])

  const handleSave = async () => {
    setLoading(true)
    try {
      const updateData: any = {
        stage: formData.stage,
        probability: parseInt(formData.probability),
        expected_revenue: formData.expected_revenue ? parseFloat(formData.expected_revenue) : null,
        expected_close_date: formData.expected_close_date || null,
        description: formData.description || null,
        notes: formData.notes || null,
        updated_at: new Date().toISOString()
      }

      // Se chiudiamo l'opportunità, setta closed_at
      if ((formData.stage === 'chiuso_vinto' || formData.stage === 'chiuso_perso') && 
          opportunity.stage !== 'chiuso_vinto' && opportunity.stage !== 'chiuso_perso') {
        updateData.closed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('crm_opportunities')
        .update(updateData)
        .eq('id', opportunity.id)

      if (error) throw error

      toast({
        title: 'Successo',
        description: formData.stage === 'chiuso_vinto' && opportunity.stage !== 'chiuso_vinto'
          ? '🎉 Opportunità vinta! Cliente acquisito.'
          : 'Opportunità aggiornata con successo.',
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

  const handleAddActivity = async () => {
    if (!newActivity.description) {
      toast({
        title: 'Attenzione',
        description: 'La descrizione è obbligatoria.',
        variant: 'destructive',
      })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from('crm_activities').insert({
        opportunity_id: opportunity.id,
        activity_type: newActivity.activity_type,
        subject: newActivity.subject || null,
        description: newActivity.description,
        outcome: newActivity.outcome || null,
        created_by: user?.id,
      })

      if (error) throw error

      toast({
        title: 'Successo',
        description: 'Attività aggiunta.',
      })

      setNewActivity({
        activity_type: 'nota',
        subject: '',
        description: '',
        outcome: ''
      })

      loadActivities()
    } catch (error: any) {
      console.error('Error adding activity:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere l\'attività: ' + error.message,
        variant: 'destructive',
      })
    }
  }

  const handleCreateQuote = () => {
    // Naviga alla pagina di creazione preventivo pre-compilata
    const clientType = opportunity.persona_giuridica ? 'persona_giuridica' : 'persona_fisica'
    const clientId = opportunity.persona_giuridica?.notion_id || opportunity.persona_fisica?.notion_id
    
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'telefono': return <Phone className="h-4 w-4" />
      case 'meeting': return <Calendar className="h-4 w-4" />
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  // Helper per ottenere il nome da mostrare
  const getDisplayName = () => {
    if (opportunity.nome_prospect) return opportunity.nome_prospect
    if (opportunity.persona_giuridica) return opportunity.persona_giuridica.ragione_sociale
    if (opportunity.persona_fisica) return opportunity.persona_fisica.nome_completo
    return 'Opportunità'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {opportunity.persona_giuridica ? (
                <Building2 className="h-5 w-5 text-muted-foreground" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
              <span>{getDisplayName()}</span>
            </div>
            <Badge variant={CRM_OPPORTUNITY_STAGE_VARIANTS[opportunity.stage] as any}>
              {CRM_OPPORTUNITY_STAGE_LABELS[opportunity.stage]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Dettagli</TabsTrigger>
            <TabsTrigger value="activities">
              Attività ({activities.length})
            </TabsTrigger>
            <TabsTrigger value="quotes">Preventivi ({quotes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Info Cliente */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cliente</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {opportunity.persona_giuridica ? (
                  <>
                    <p className="font-medium">{opportunity.persona_giuridica.ragione_sociale}</p>
                    {opportunity.referente && (
                      <p className="text-muted-foreground">
                        Referente: {opportunity.referente.nome_completo}
                      </p>
                    )}
                  </>
                ) : opportunity.persona_fisica ? (
                  <p className="font-medium">{opportunity.persona_fisica.nome_completo}</p>
                ) : (
                  <p className="text-muted-foreground">Nessun cliente collegato</p>
                )}
              </CardContent>
            </Card>

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
                <Label htmlFor="expected_revenue">Valore Atteso (€)</Label>
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
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salva Modifiche
                  </>
                )}
              </Button>
              
              {formData.stage === 'chiuso_vinto' && (
                <Button variant="outline" disabled>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Cliente Acquisito
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4 mt-4">
            {/* Form Nuova Attività */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Aggiungi Attività</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={newActivity.activity_type}
                      onValueChange={(value: CrmActivity['activity_type']) =>
                        setNewActivity({ ...newActivity, activity_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CRM_ACTIVITY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Oggetto</Label>
                    <Input
                      value={newActivity.subject}
                      onChange={(e) =>
                        setNewActivity({ ...newActivity, subject: e.target.value })
                      }
                      placeholder="Es. Call conoscitiva"
                    />
                  </div>
                </div>

                <div>
                  <Label>Descrizione *</Label>
                  <Textarea
                    value={newActivity.description}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, description: e.target.value })
                    }
                    rows={2}
                    placeholder="Cosa è successo?"
                  />
                </div>

                <div>
                  <Label>Esito</Label>
                  <Textarea
                    value={newActivity.outcome}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, outcome: e.target.value })
                    }
                    rows={2}
                    placeholder="Risultato dell'attività..."
                  />
                </div>

                <Button onClick={handleAddActivity} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi Attività
                </Button>
              </CardContent>
            </Card>

            {/* Lista Attività */}
            <div className="space-y-2">
              {loadingActivities ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Caricamento attività...
                </div>
              ) : activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nessuna attività registrata
                </p>
              ) : (
                activities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {CRM_ACTIVITY_TYPES.find(t => t.value === activity.activity_type)?.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDateItalian(activity.activity_date)}
                            </span>
                          </div>
                          {activity.subject && (
                            <h4 className="font-semibold text-sm mb-1">{activity.subject}</h4>
                          )}
                          <p className="text-sm">{activity.description}</p>
                          {activity.outcome && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <strong>Esito:</strong> {activity.outcome}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
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
                <div className="text-center py-4 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Caricamento preventivi...
                </div>
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
                              {formatCurrency(Number(quote.grand_total) || 0)}
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
