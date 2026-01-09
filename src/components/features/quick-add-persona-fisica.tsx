'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'

interface QuickAddPersonaFisicaProps {
  onSuccess: (notionId: string, nomeCompleto: string) => void
  trigger?: React.ReactNode
}

export function QuickAddPersonaFisica({ onSuccess, trigger }: QuickAddPersonaFisicaProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_completo: '',
    codice_fiscale: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome_completo.trim()) {
      alert('Il nome completo è obbligatorio')
      return
    }

    setLoading(true)

    try {
      // Genera un notion_id univoco
      const notionId = `pf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Prepara contatti se email è presente
      const contatti = formData.email 
        ? [{ id: 1, tipo: 'email', valore: formData.email }] 
        : []

      const { error } = await supabase
        .from('persone_fisiche')
        .insert({
          notion_id: notionId,
          nome_completo: formData.nome_completo,
          codice_fiscale: formData.codice_fiscale || null,
          contatti,
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString(),
        })

      if (error) throw error

      // Chiama la callback di successo
      onSuccess(notionId, formData.nome_completo)
      
      // Reset form
      setFormData({
        nome_completo: '',
        codice_fiscale: '',
        email: '',
      })
      setOpen(false)
    } catch (error: any) {
      console.error('Errore durante la creazione:', error)
      alert('Errore: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Crea Nuova Persona
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Add - Persona Fisica</DialogTitle>
          <DialogDescription>
            Crea rapidamente una nuova persona fisica. Potrai modificarla in seguito con tutti i dettagli.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome_completo">Nome Completo *</Label>
            <Input
              id="nome_completo"
              value={formData.nome_completo}
              onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
              placeholder="Mario Rossi"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="codice_fiscale">Codice Fiscale</Label>
            <Input
              id="codice_fiscale"
              value={formData.codice_fiscale}
              onChange={(e) => setFormData({ ...formData, codice_fiscale: e.target.value.toUpperCase() })}
              placeholder="RSSMRA80A01H501Z"
              maxLength={16}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="mario.rossi@email.com"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
                  <Plus className="mr-2 h-4 w-4" />
                  Crea
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}











