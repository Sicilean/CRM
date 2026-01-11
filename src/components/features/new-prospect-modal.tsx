'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Building2, User, Loader2 } from 'lucide-react'
import ClientSelector from './client-selector'
import ReferenteSelector from './referente-selector'
import QuickAddReferente from './quick-add-referente'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/ui/use-toast'

interface NewProspectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProspectCreated?: () => void
}

export default function NewProspectModal({ open, onOpenChange, onProspectCreated }: NewProspectModalProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // State per modali di selezione
  const [clientSelectorOpen, setClientSelectorOpen] = useState(false)
  const [referenteSelectorOpen, setReferenteSelectorOpen] = useState(false)
  const [quickAddReferenteDialog, setQuickAddReferenteDialog] = useState(false)
  
  const [formData, setFormData] = useState({
    // Tipo cliente e IDs
    client_type: 'persona_giuridica' as 'persona_fisica' | 'persona_giuridica',
    persona_fisica_id: null as string | null,
    persona_giuridica_id: null as string | null,
    referente_id: null as string | null,
    
    // Dati cliente (auto-compilati)
    client_name: '', // Nome persona fisica
    client_company: '', // Ragione sociale persona giuridica
    client_email: '',
    client_phone: '',
    
    // Dati referente (quando è persona giuridica)
    referente_name: '',
    referente_role: '',
    
    // Dati opportunità
    nome_prospect: '',
    expected_revenue: '',
    description: '',
    notes: ''
  })

  // Reset form quando si chiude
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData({
        client_type: 'persona_giuridica',
        persona_fisica_id: null,
        persona_giuridica_id: null,
        referente_id: null,
        client_name: '',
        client_company: '',
        client_email: '',
        client_phone: '',
        referente_name: '',
        referente_role: '',
        nome_prospect: '',
        expected_revenue: '',
        description: '',
        notes: ''
      })
    }
    onOpenChange(isOpen)
  }

  // Handler per selezione cliente
  const handleSelectClient = async (client: any) => {
    if (formData.client_type === 'persona_fisica') {
      const contatti = client.contatti || []
      const email = contatti.find((c: any) => c.tipo === 'email')?.valore || ''
      const telefono = contatti.find((c: any) => c.tipo === 'telefono' || c.tipo === 'cellulare')?.valore || ''

      setFormData(prev => ({
        ...prev,
        persona_fisica_id: client.notion_id,
        persona_giuridica_id: null,
        referente_id: null,
        client_name: client.nome_completo,
        client_company: '',
        client_email: email,
        client_phone: telefono,
        referente_name: '',
        referente_role: '',
        nome_prospect: client.nome_completo // Auto-fill nome prospect
      }))
    } else {
      const emails = client.email || []
      const telefoni = client.contatti_telefonici || []
      
      // Trova email normale e PEC
      const emailNormale = emails.find((e: any) => e.tipo === 'email' || !e.tipo)?.valore || emails[0]?.valore || ''
      const pec = emails.find((e: any) => e.tipo === 'pec')?.valore || client.pec || ''
      
      setFormData(prev => ({
        ...prev,
        persona_giuridica_id: client.notion_id,
        persona_fisica_id: null,
        referente_id: null,
        referente_name: '',
        referente_role: '',
        client_name: '',
        client_company: client.ragione_sociale,
        client_email: pec || emailNormale,
        client_phone: telefoni[0]?.valore || '',
        nome_prospect: client.ragione_sociale // Auto-fill nome prospect
      }))
    }
  }

  // Handler per selezione referente
  const handleSelectReferente = async (referente: any) => {
    const contatti = referente.contatti || []
    const email = contatti.find((c: any) => c.tipo === 'email')?.valore || ''
    const telefono = contatti.find((c: any) => c.tipo === 'telefono' || c.tipo === 'cellulare')?.valore || ''

    // Cerca il ruolo del referente nell'azienda selezionata
    let ruoloReferente = ''
    if (formData.persona_giuridica_id) {
      const { data: relazione } = await supabase
        .from('persone_fisiche_relazioni')
        .select('tipo_relazione')
        .eq('persona_fisica_id', referente.notion_id)
        .eq('persona_giuridica_id', formData.persona_giuridica_id)
        .single()
      
      if (relazione) {
        ruoloReferente = relazione.tipo_relazione
      }
    }

    setFormData(prev => ({
      ...prev,
      referente_id: referente.notion_id,
      referente_name: referente.nome_completo,
      referente_role: ruoloReferente,
      // Sovrascrivi email e telefono con quelli del referente
      client_email: email || prev.client_email,
      client_phone: telefono || prev.client_phone
    }))

    setReferenteSelectorOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validazione
    if (formData.client_type === 'persona_fisica' && !formData.persona_fisica_id) {
      toast({
        title: 'Attenzione',
        description: 'Seleziona una persona fisica',
        variant: 'destructive'
      })
      return
    }
    
    if (formData.client_type === 'persona_giuridica') {
      if (!formData.persona_giuridica_id) {
        toast({
          title: 'Attenzione',
          description: 'Seleziona un\'azienda',
          variant: 'destructive'
        })
        return
      }
      if (!formData.referente_id) {
        toast({
          title: 'Attenzione',
          description: 'Seleziona un referente per l\'azienda',
          variant: 'destructive'
        })
        return
      }
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Crea direttamente l'opportunità (senza lead)
      const opportunityData = {
        // IDs collegamento
        persona_fisica_id: formData.client_type === 'persona_fisica' ? formData.persona_fisica_id : null,
        persona_giuridica_id: formData.client_type === 'persona_giuridica' ? formData.persona_giuridica_id : null,
        referente_id: formData.client_type === 'persona_giuridica' ? formData.referente_id : null,
        
        // Dati opportunità
        nome_prospect: formData.nome_prospect || formData.client_company || formData.client_name || null,
        source: 'manual',
        stage: 'scoperta',
        probability: 50,
        expected_revenue: formData.expected_revenue ? parseFloat(formData.expected_revenue) : null,
        description: formData.description || null,
        notes: formData.notes || null,
        created_by: user?.id,
        assigned_to: user?.id
      }

      const { error } = await supabase
        .from('crm_opportunities')
        .insert({
          ...opportunityData,
          lead_id: null // Opzionale per opportunità manuali
        } as any)

      if (error) throw error

      toast({
        title: 'Successo',
        description: 'Prospect aggiunto alla pipeline!',
      })

      handleOpenChange(false)
      if (onProspectCreated) onProspectCreated()
    } catch (error: any) {
      console.error('Error creating prospect:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile creare il prospect: ' + error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuovo Prospect</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Selezione Tipo Cliente */}
            <div className="space-y-3">
              <Label>Tipo Prospect *</Label>
              <RadioGroup
                value={formData.client_type}
                onValueChange={(value: 'persona_fisica' | 'persona_giuridica') => {
                  setFormData({
                    ...formData,
                    client_type: value,
                    persona_fisica_id: null,
                    persona_giuridica_id: null,
                    referente_id: null,
                    client_name: '',
                    client_company: '',
                    client_email: '',
                    client_phone: '',
                    referente_name: '',
                    referente_role: '',
                    nome_prospect: ''
                  })
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="persona_fisica" id="tipo_persona" />
                  <Label htmlFor="tipo_persona" className="font-normal cursor-pointer flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Persona Fisica
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="persona_giuridica" id="tipo_azienda" />
                  <Label htmlFor="tipo_azienda" className="font-normal cursor-pointer flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Azienda
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* STEP 2: Selezione Cliente */}
            <div className="space-y-2">
              <Label>
                Seleziona {formData.client_type === 'persona_fisica' ? 'Persona' : 'Azienda'} *
              </Label>
              <Button 
                type="button"
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setClientSelectorOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                {formData.client_company || formData.client_name || `Cerca ${formData.client_type === 'persona_fisica' ? 'persona' : 'azienda'}...`}
              </Button>
            </div>

            {/* STEP 3: Selezione Referente (solo per Persona Giuridica) */}
            {formData.client_type === 'persona_giuridica' && formData.persona_giuridica_id && (
              <div className="space-y-2">
                <Label>Referente *</Label>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setReferenteSelectorOpen(true)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {formData.referente_name || 'Seleziona referente...'}
                </Button>
                {formData.referente_name && formData.referente_role && (
                  <p className="text-sm text-muted-foreground">
                    Ruolo: {formData.referente_role}
                  </p>
                )}
              </div>
            )}

            {/* Dati Auto-compilati */}
            {(formData.persona_fisica_id || formData.referente_id) && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-sm">Dati Contatto</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-medium">{formData.client_email || 'N/D'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Telefono</Label>
                    <p className="font-medium">{formData.client_phone || 'N/D'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dati Opportunità */}
            <div className="space-y-4 pt-2 border-t">
              <h4 className="font-semibold text-sm">Dettagli Opportunità</h4>
              
              <div>
                <Label htmlFor="nome_prospect">Nome Opportunità</Label>
                <Input
                  id="nome_prospect"
                  value={formData.nome_prospect}
                  onChange={(e) => setFormData({ ...formData, nome_prospect: e.target.value })}
                  placeholder="Es. Progetto e-commerce, Consulenza HR..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Opzionale. Se vuoto, useremo il nome del cliente.
                </p>
              </div>

              <div>
                <Label htmlFor="expected_revenue">Valore Stimato (€)</Label>
                <Input
                  id="expected_revenue"
                  type="number"
                  value={formData.expected_revenue}
                  onChange={(e) => setFormData({ ...formData, expected_revenue: e.target.value })}
                  placeholder="Es. 10000"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Descrivi il potenziale progetto o le esigenze del cliente..."
                />
              </div>

              <div>
                <Label htmlFor="notes">Note Interne</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Note private visibili solo al team..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creazione...
                  </>
                ) : (
                  'Aggiungi a Pipeline'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modali per Selezione Cliente e Referente */}
      <ClientSelector
        open={clientSelectorOpen}
        onOpenChange={setClientSelectorOpen}
        clientType={formData.client_type}
        onSelectClient={handleSelectClient}
      />

      <ReferenteSelector
        open={referenteSelectorOpen}
        onOpenChange={setReferenteSelectorOpen}
        personaGiuridicaId={formData.persona_giuridica_id}
        personaGiuridicaNome={formData.client_company || 'Azienda'}
        onSelectReferente={handleSelectReferente}
        onQuickAdd={() => setQuickAddReferenteDialog(true)}
      />

      {formData.persona_giuridica_id && (
        <QuickAddReferente
          personaGiuridicaId={formData.persona_giuridica_id}
          personaGiuridicaNome={formData.client_company || 'Azienda'}
          open={quickAddReferenteDialog}
          onOpenChange={setQuickAddReferenteDialog}
          onAdded={handleSelectReferente}
        />
      )}
    </>
  )
}
