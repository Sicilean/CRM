'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Building2, CheckCircle } from 'lucide-react'

// Tipo Contact basato sulla tabella contacts
type Contact = any

interface QuickAddPersonaGiuridicaFromLeadProps {
  contact: Contact
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: () => void
}

export default function QuickAddPersonaGiuridicaFromLead({
  contact,
  open,
  onOpenChange,
  onAdded
}: QuickAddPersonaGiuridicaFromLeadProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  // Genera note automatiche con fonte e dettagli
  const generateNotes = () => {
    const parts = []
    parts.push(`🌐 FONTE: Lead da form web (${contact.form_type || 'standard'})`)
    parts.push(`📅 Data contatto: ${contact.created_at ? new Date(contact.created_at).toLocaleDateString('it-IT') : 'N/D'}`)
    
    if (contact.nome_completo) {
      parts.push(`👤 Referente indicato: ${contact.nome_completo}`)
      if (contact.ruolo) parts.push(`💼 Ruolo: ${contact.ruolo}`)
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
    ragione_sociale: contact.azienda || '',
    email: contact.email || '',
    telefono: contact.telefono || '',
    descrizione: '',
    settore: '',
    note: generateNotes()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.ragione_sociale) {
      alert('La Ragione Sociale è obbligatoria')
      return
    }

    setLoading(true)

    try {
      // Genera un notion_id temporaneo (useremo UUID)
      const notionId = crypto.randomUUID()
      
      // Prepara email array
      const email = []
      if (formData.email) {
        email.push({ id: 1, tipo: 'principale', valore: formData.email })
      }

      // Prepara contatti telefonici array
      const contatti_telefonici = []
      if (formData.telefono) {
        contatti_telefonici.push({ id: 1, tipo: 'fisso', valore: formData.telefono })
      }

      // Crea la persona giuridica
      const { error: errorAzienda } = await supabase
        .from('persone_giuridiche')
        .insert({
          notion_id: notionId,
          ragione_sociale: formData.ragione_sociale,
          email: email,
          contatti_telefonici: contatti_telefonici,
          descrizione_core_business: formData.descrizione || null,
          settore: formData.settore || null,
          note: formData.note || null,
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString()
        })

      if (errorAzienda) throw errorAzienda

      // Se c'è una persona fisica associata (nome_completo), crea anche quella e collega
      if (contact.nome_completo && contact.ruolo) {
        const pfNotionId = crypto.randomUUID()
        
        // Prepara contatti persona fisica
        const contattiPF = []
        if (contact.email) {
          contattiPF.push({ id: 1, tipo: 'email', valore: contact.email })
        }
        if (contact.telefono) {
          contattiPF.push({ id: contattiPF.length + 1, tipo: 'telefono', valore: contact.telefono })
        }

        // Genera note per la persona fisica
        const notePF = `🌐 FONTE: Referente da lead aziendale
📅 Data contatto: ${contact.created_at ? new Date(contact.created_at).toLocaleDateString('it-IT') : 'N/D'}
🏢 Azienda: ${formData.ragione_sociale}
💼 Ruolo: ${contact.ruolo}
${contact.email ? `📧 Email: ${contact.email}` : ''}
${contact.telefono ? `📞 Telefono: ${contact.telefono}` : ''}`

        // Crea la persona fisica
        const { error: errorPF } = await supabase
          .from('persone_fisiche')
          .insert({
            notion_id: pfNotionId,
            nome_completo: contact.nome_completo,
            contatti: contattiPF,
            note: notePF,
            created_time: new Date().toISOString(),
            last_edited_time: new Date().toISOString()
          })

        if (!errorPF) {
          // Crea la relazione
          await supabase
            .from('persone_fisiche_relazioni')
            .insert({
              persona_fisica_id: pfNotionId,
              persona_giuridica_id: notionId,
              tipo_relazione: contact.ruolo || 'Referente'
            })
        }
      }

      // Aggiorna lo status del contatto a "converted"
      const { error: errorContact } = await supabase
        .from('contacts')
        .update({ 
          status: 'converted',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', contact.id)

      if (errorContact) {
        console.warn('Errore aggiornamento status contatto:', errorContact)
      }

      // Chiudi dialog e notifica successo
      onAdded()
      onOpenChange(false)
      
      const message = contact.nome_completo 
        ? 'Persona giuridica e referente creati con successo!' 
        : 'Persona giuridica creata con successo!'
      alert(message)

    } catch (error: any) {
      console.error('Errore creazione persona giuridica:', error)
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
            <Building2 className="h-5 w-5" />
            Converti in Persona Giuridica
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Da lead: <span className="font-medium">{contact.azienda || contact.nome_completo}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ragione_sociale">
              Ragione Sociale <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ragione_sociale"
              value={formData.ragione_sociale}
              onChange={(e) => setFormData(prev => ({ ...prev, ragione_sociale: e.target.value }))}
              placeholder="Acme Inc. S.r.l."
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settore">Settore</Label>
            <Input
              id="settore"
              value={formData.settore}
              onChange={(e) => setFormData(prev => ({ ...prev, settore: e.target.value }))}
              placeholder="es. Tecnologia, Manifatturiero, Servizi..."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Aziendale</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@acme.com"
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

          <div className="space-y-2">
            <Label htmlFor="descrizione">Descrizione / Core Business</Label>
            <Textarea
              id="descrizione"
              value={formData.descrizione}
              onChange={(e) => setFormData(prev => ({ ...prev, descrizione: e.target.value }))}
              placeholder="Breve descrizione dell'attività aziendale..."
              rows={2}
              disabled={loading}
            />
          </div>

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
              Include fonte, referente, budget, servizi di interesse e messaggi del lead
            </p>
          </div>

          {contact.nome_completo && contact.ruolo && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                Verrà creato anche il referente:
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>{contact.nome_completo}</strong> - {contact.ruolo}
              </p>
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

