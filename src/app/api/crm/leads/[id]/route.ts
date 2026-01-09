// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/crm/leads/[id] - Dettaglio lead
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('crm_leads')
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, email),
        persona_fisica:persona_fisica_id(notion_id, nome_completo, contatti, indirizzo),
        persona_giuridica:persona_giuridica_id(notion_id, ragione_sociale, email, contatti_telefonici, sede_legale, p_iva),
        activities:crm_activities(
          *,
          created_user:created_by(id, full_name)
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error) throw error
    
    if (!data) {
      return NextResponse.json(
        { error: 'Lead non trovato' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching lead:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento del lead' },
      { status: 500 }
    )
  }
}

// PUT /api/crm/leads/[id] - Aggiorna lead
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Rimuovi campi non aggiornabili
    delete body.id
    delete body.created_at
    delete body.created_by
    
    const { data, error } = await supabase
      .from('crm_leads')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del lead' },
      { status: 500 }
    )
  }
}

// DELETE /api/crm/leads/[id] - Elimina lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('crm_leads')
      .delete()
      .eq('id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del lead' },
      { status: 500 }
    )
  }
}

