// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/crm/opportunities/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('crm_opportunities')
      .select(`
        *,
        lead:lead_id(*),
        persona_fisica:persona_fisica_id(notion_id, nome_completo, contatti),
        persona_giuridica:persona_giuridica_id(notion_id, ragione_sociale, email, contatti_telefonici),
        opportunity_quotes:crm_opportunity_quotes(
          *,
          quote:quote_id(*)
        ),
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
        { error: 'Opportunità non trovata' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching opportunity:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento dell\'opportunità' },
      { status: 500 }
    )
  }
}

// PUT /api/crm/opportunities/[id]
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
    delete body.lead_id
    
    const { data, error } = await supabase
      .from('crm_opportunities')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating opportunity:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dell\'opportunità' },
      { status: 500 }
    )
  }
}

// DELETE /api/crm/opportunities/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('crm_opportunities')
      .delete()
      .eq('id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting opportunity:', error)
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'opportunità' },
      { status: 500 }
    )
  }
}

