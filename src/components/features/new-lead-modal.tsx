'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LEAD_SOURCE_LABELS } from '@/lib/crm-constants'
import { Search, Building2, User } from 'lucide-react'
import ClientSelector from './client-selector'
import ReferenteSelector from './referente-selector'
import QuickAddReferente from './quick-add-referente'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface NewLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLeadCreated?: () => void
}

export default function NewLeadModal({ open, onOpenChange, onLeadCreated }: NewLeadModalProps) {
  const supabase = createClient()
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
    
    // Dati lead
    budget: '',
    fonte: '',
    descrizione: '',
    note_interne: ''
  })

  // Handler per selezione cliente (copiato da preventivi)
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
        referente_role: ''
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
        client_phone: telefoni[0]?.valore || ''
      }))
    }
  }

  // Handler per selezione referente (copiato da preventivi)
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
      alert('Seleziona una persona fisica')
      return
    }
    
    if (formData.client_type === 'persona_giuridica') {
      if (!formData.persona_giuridica_id) {
        alert('Seleziona una persona giuridica')
        return
      }
      if (!formData.referente_id) {
        alert('Seleziona un referente per la persona giuridica')
        return
      }
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const leadData = {
        // IDs collegamento
        persona_fisica_id: formData.client_type === 'persona_fisica' ? formData.persona_fisica_id : null,
        persona_giuridica_id: formData.client_type === 'persona_giuridica' ? formData.persona_giuridica_id : null,
        referente_id: formData.client_type === 'persona_giuridica' ? formData.referente_id : null,
        
        // Dati lead (copiati per comodità)
        nome_completo: formData.client_type === 'persona_fisica' ? formData.client_name : formData.referente_name,
        email: formData.client_email,
        telefono: formData.client_phone || null,
        azienda: formData.client_company || null,
        ruolo: formData.referente_role || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        fonte: formData.fonte || null,
        descrizione: formData.descrizione || null,
        note_interne: formData.note_interne || null,
        status: 'nuovo',
        created_by: user?.id,
        assigned_to: user?.id
      }

      const { error } = await supabase
        .from('crm_leads')
        .insert(leadData)

      if (error) throw error

      // Reset form
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
        budget: '',
        fonte: '',
        descrizione: '',
        note_interne: ''
      })

      onOpenChange(false)
      if (onLeadCreated) onLeadCreated()
    } catch (error: any) {
      console.error('Error creating lead:', error)
      alert('Errore nella creazione del lead: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuovo Lead</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Selezione Tipo Cliente */}
            <div className="space-y-3">
              <Label>Tipo Cliente *</Label>
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
                    referente_role: ''
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
                <h4 className="font-semibold text-sm">Dati Contatto (auto-compilati)</h4>
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

            {/* Altri Campi Lead */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="Es. 10000"
                />
              </div>

              <div>
                <Label htmlFor="fonte">Fonte Lead</Label>
                <Select
                  value={formData.fonte}
                  onValueChange={(value) => setFormData({ ...formData, fonte: value })}
                >
                  <SelectTrigger id="fonte">
                    <SelectValue placeholder="Seleziona fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descrizione">Descrizione</Label>
              <Textarea
                id="descrizione"
                value={formData.descrizione}
                onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                rows={3}
                placeholder="Descrivi il potenziale progetto o le esigenze del cliente..."
              />
            </div>

            <div>
              <Label htmlFor="note_interne">Note Interne</Label>
              <Textarea
                id="note_interne"
                value={formData.note_interne}
                onChange={(e) => setFormData({ ...formData, note_interne: e.target.value })}
                rows={2}
                placeholder="Note private visibili solo al team..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creazione...' : 'Crea Lead'}
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

