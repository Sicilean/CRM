'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, UserPlus, CheckCircle, Building2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

// Tipo Contact basato sulla tabella contacts
type Contact = any

interface QuickAddPersonaFisicaFromLeadProps {
  contact: Contact
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: () => void
}

export default function QuickAddPersonaFisicaFromLead({
  contact,
  open,
  onOpenChange,
  onAdded
}: QuickAddPersonaFisicaFromLeadProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  
  // Pre-compila i dati dal contatto
  const getNomeAndCognome = () => {
    if (!contact.nome_completo) return { nome: '', cognome: '' }
    const parts = contact.nome_completo.trim().split(' ')
    if (parts.length === 1) return { nome: parts[0], cognome: '' }
    return { nome: parts[0], cognome: parts.slice(1).join(' ') }
  }

  const { nome: initialNome, cognome: initialCognome } = getNomeAndCognome()

  // Genera note automatiche con fonte e dettagli
  const generateNotes = () => {
    const parts = []
    parts.push(`🌐 FONTE: Lead da form web (${contact.form_type || 'standard'})`)
    parts.push(`📅 Data contatto: ${contact.created_at ? new Date(contact.created_at).toLocaleDateString('it-IT') : 'N/D'}`)
    
    if (contact.azienda) {
      parts.push(`🏢 Azienda indicata: ${contact.azienda}`)
      if (contact.ruolo) parts.push(`👤 Ruolo: ${contact.ruolo}`)
    }
    
    if (contact.servizi && Array.isArray(contact.servizi) && contact.servizi.length > 0) {
      parts.push(`🎯 Servizi di interesse: ${contact.servizi.join(', ')}`)
    }
    
    if (contact.budget) {
      parts.push(`💰 Budget indicato: €${contact.budget.toLocaleString('it-IT')}`)
    }
    
    if (contact.timeline) {
      parts.push(`⏱️ Timeline: ${contact.timeline}`)
    }
    
    if (contact.messaggio) {
      parts.push(`\n📝 MESSAGGIO:\n${contact.messaggio}`)
    }
    
    if (contact.sfida) {
      parts.push(`\n🎯 SFIDA:\n${contact.sfida}`)
    }
    
    return parts.join('\n')
  }

  const [formData, setFormData] = useState({
    nome: initialNome,
    cognome: initialCognome,
    email: contact.email || '',
    telefono: contact.telefono || '',
    note: generateNotes(),
    // Campi per azienda opzionale
    creaAzienda: !!contact.azienda,
    aziendaNome: contact.azienda || '',
    aziendaRuolo: contact.ruolo || 'Referente'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.cognome) {
      alert('Nome e Cognome sono obbligatori')
      return
    }

    if (!formData.email && !formData.telefono) {
      alert('Devi fornire almeno Email o Telefono')
      return
    }

    setLoading(true)

    try {
      const nomeCompleto = `${formData.nome} ${formData.cognome}`
      
      // Genera un notion_id temporaneo (useremo UUID)
      const notionId = crypto.randomUUID()
      
      // Prepara contatti array
      const contatti = []
      if (formData.email) {
        contatti.push({ id: 1, tipo: 'email', valore: formData.email })
      }
      if (formData.telefono) {
        contatti.push({ id: contatti.length + 1, tipo: 'telefono', valore: formData.telefono })
      }

      // Crea la persona fisica
      const { error: errorPersona } = await supabase
        .from('persone_fisiche')
        .insert({
          notion_id: notionId,
          nome_completo: nomeCompleto,
          contatti: contatti,
          note: formData.note || null,
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString()
        })

      if (errorPersona) throw errorPersona

      // Se richiesto, crea anche l'azienda e la relazione
      if (formData.creaAzienda && formData.aziendaNome) {
        const aziendaNotionId = crypto.randomUUID()
        
        // Crea la persona giuridica
        const { error: errorAzienda } = await supabase
          .from('persone_giuridiche')
          .insert({
            notion_id: aziendaNotionId,
            ragione_sociale: formData.aziendaNome,
            note: `Azienda creata da conversione lead.\nReferente: ${nomeCompleto}`,
            created_time: new Date().toISOString(),
            last_edited_time: new Date().toISOString()
          })

        if (!errorAzienda) {
          // Crea la relazione
          await supabase
            .from('persone_fisiche_relazioni')
            .insert({
              persona_fisica_id: notionId,
              persona_giuridica_id: aziendaNotionId,
              tipo_relazione: formData.aziendaRuolo
            })
        }
      }

      // Aggiorna lo status del contatto a "converted"
      const { error: errorContact } = await supabase
        .from('contacts')
        .update({ 
          status: 'converted',
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.id)

      if (errorContact) {
        console.warn('Errore aggiornamento status contatto:', errorContact)
      }

      // Chiudi dialog e notifica successo
      onAdded()
      onOpenChange(false)
      
      const message = formData.creaAzienda && formData.aziendaNome
        ? 'Persona fisica e azienda collegate create con successo!'
        : 'Persona fisica creata con successo!'
      alert(message)

    } catch (error: any) {
      console.error('Errore creazione persona fisica:', error)
      alert('Errore durante la creazione: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Converti in Persona Fisica
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Da lead: <span className="font-medium">{contact.nome_completo}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Mario"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cognome">
                Cognome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cognome"
                value={formData.cognome}
                onChange={(e) => setFormData(prev => ({ ...prev, cognome: e.target.value }))}
                placeholder="Rossi"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="mario.rossi@example.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="+39 123 456 7890"
                disabled={loading}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Almeno uno tra Email o Telefono è obbligatorio
          </p>

          <div className="space-y-2">
            <Label htmlFor="note">Note Interne</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Note automatiche generate dal lead..."
              rows={4}
              disabled={loading}
              className="text-xs font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Include fonte, budget, servizi di interesse e messaggi del lead
            </p>
          </div>

          {/* Sezione creazione azienda opzionale */}
          {contact.azienda && (
            <div className="space-y-3 p-3 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="creaAzienda"
                  checked={formData.creaAzienda}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, creaAzienda: checked as boolean }))
                  }
                  disabled={loading}
                />
                <Label 
                  htmlFor="creaAzienda" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <span>Crea anche l&apos;azienda collegata</span>
                  </div>
                </Label>
              </div>

              {formData.creaAzienda && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <Label htmlFor="aziendaNome" className="text-xs">Nome Azienda</Label>
                    <Input
                      id="aziendaNome"
                      value={formData.aziendaNome}
                      onChange={(e) => setFormData(prev => ({ ...prev, aziendaNome: e.target.value }))}
                      placeholder="Nome azienda..."
                      disabled={loading}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aziendaRuolo" className="text-xs">Ruolo nella Azienda</Label>
                    <Input
                      id="aziendaRuolo"
                      value={formData.aziendaRuolo}
                      onChange={(e) => setFormData(prev => ({ ...prev, aziendaRuolo: e.target.value }))}
                      placeholder="es. CEO, Manager, Responsabile..."
                      disabled={loading}
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creazione...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Converti e Crea
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

