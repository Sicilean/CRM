'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, UserPlus } from 'lucide-react'

interface QuickAddReferenteProps {
  personaGiuridicaId: string
  personaGiuridicaNome: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: (referente: any) => void
}

export default function QuickAddReferente({
  personaGiuridicaId,
  personaGiuridicaNome,
  open,
  onOpenChange,
  onAdded
}: QuickAddReferenteProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    ruolo: ''
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

    if (!formData.ruolo) {
      alert('Il Ruolo è obbligatorio (es. Amministratore, Marketing Manager, etc.)')
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

      // 1. Crea la persona fisica
      const { data: personaFisica, error: errorPersona } = await supabase
        .from('persone_fisiche')
        .insert({
          notion_id: notionId,
          nome_completo: nomeCompleto,
          contatti: contatti,
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString()
        })
        .select()
        .single()

      if (errorPersona) throw errorPersona

      // 2. Crea la relazione con la persona giuridica
      const { error: errorRelazione } = await supabase
        .from('persone_fisiche_relazioni')
        .insert({
          persona_fisica_id: notionId,
          persona_giuridica_id: personaGiuridicaId,
          tipo_relazione: formData.ruolo
        })

      if (errorRelazione) throw errorRelazione

      // 3. Ricarica la persona fisica con i contatti
      const { data: personaCreata } = await supabase
        .from('persone_fisiche')
        .select('*')
        .eq('notion_id', notionId)
        .single()

      // Chiudi dialog e notifica successo
      onAdded(personaCreata)
      onOpenChange(false)
      
      // Reset form
      setFormData({
        nome: '',
        cognome: '',
        email: '',
        telefono: '',
        ruolo: ''
      })

    } catch (error: any) {
      console.error('Errore creazione referente:', error)
      alert('Errore durante la creazione del referente: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Aggiungi Nuovo Referente
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Per: <span className="font-medium">{personaGiuridicaNome}</span>
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
            <p className="text-xs text-muted-foreground">
              Almeno uno tra Email o Telefono è obbligatorio
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ruolo">
              Ruolo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ruolo"
              value={formData.ruolo}
              onChange={(e) => setFormData(prev => ({ ...prev, ruolo: e.target.value }))}
              placeholder="es. Amministratore, Marketing Manager, etc."
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Il ruolo che questa persona ricopre nell&apos;azienda
            </p>
          </div>

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
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crea Referente
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

