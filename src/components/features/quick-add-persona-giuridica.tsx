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

interface QuickAddPersonaGiuridicaProps {
  onSuccess: (notionId: string, ragioneSociale: string) => void
  trigger?: React.ReactNode
}

export function QuickAddPersonaGiuridica({ onSuccess, trigger }: QuickAddPersonaGiuridicaProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ragione_sociale: '',
    p_iva: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.ragione_sociale.trim()) {
      alert('La ragione sociale è obbligatoria')
      return
    }

    setLoading(true)

    try {
      // Genera un notion_id univoco
      const notionId = `pg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Prepara email se presente
      const email = formData.email 
        ? [{ id: 1, tipo: 'principale', valore: formData.email }] 
        : []

      const { error } = await supabase
        .from('persone_giuridiche')
        .insert({
          notion_id: notionId,
          ragione_sociale: formData.ragione_sociale,
          p_iva: formData.p_iva || null,
          email,
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString(),
        })

      if (error) throw error

      // Chiama la callback di successo
      onSuccess(notionId, formData.ragione_sociale)
      
      // Reset form
      setFormData({
        ragione_sociale: '',
        p_iva: '',
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
            Crea Nuova Azienda
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Add - Persona Giuridica</DialogTitle>
          <DialogDescription>
            Crea rapidamente una nuova azienda/organizzazione. Potrai modificarla in seguito con tutti i dettagli.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ragione_sociale">Ragione Sociale *</Label>
            <Input
              id="ragione_sociale"
              value={formData.ragione_sociale}
              onChange={(e) => setFormData({ ...formData, ragione_sociale: e.target.value })}
              placeholder="Acme S.r.l."
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="p_iva">Partita IVA</Label>
            <Input
              id="p_iva"
              value={formData.p_iva}
              onChange={(e) => setFormData({ ...formData, p_iva: e.target.value })}
              placeholder="12345678901"
              maxLength={11}
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
              placeholder="info@acme.it"
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











