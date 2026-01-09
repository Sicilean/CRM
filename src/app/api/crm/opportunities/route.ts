// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/crm/opportunities - Lista opportunità
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    
    // Parametri query
    const stage = searchParams.get('stage')
    const assignedTo = searchParams.get('assigned_to')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    
    let query = supabase
      .from('crm_opportunities')
      .select(`
        *,
        lead:lead_id(*),
        persona_fisica:persona_fisica_id(notion_id, nome_completo),
        persona_giuridica:persona_giuridica_id(notion_id, ragione_sociale),
        opportunity_quotes:crm_opportunity_quotes(
          *,
          quote:quote_id(id, quote_number, total_amount, status)
        )
      `, { count: 'exact' })
    
    // Filtri
    if (stage) query = query.eq('stage', stage)
    if (assignedTo) query = query.eq('assigned_to', assignedTo)
    
    // Ordinamento
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      data,
      count
    })
  } catch (error: any) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento delle opportunità' },
      { status: 500 }
    )
  }
}

// POST /api/crm/opportunities - Crea opportunità
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validazione
    if (!body.lead_id) {
      return NextResponse.json(
        { error: 'lead_id è obbligatorio' },
        { status: 400 }
      )
    }
    
    if (!body.persona_fisica_id && !body.persona_giuridica_id) {
      return NextResponse.json(
        { error: 'Devi specificare persona_fisica_id o persona_giuridica_id' },
        { status: 400 }
      )
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    const opportunityData = {
      lead_id: body.lead_id,
      persona_fisica_id: body.persona_fisica_id || null,
      persona_giuridica_id: body.persona_giuridica_id || null,
      stage: body.stage || 'scoperta',
      probability: body.probability || 50,
      expected_revenue: body.expected_revenue || null,
      expected_close_date: body.expected_close_date || null,
      description: body.description || null,
      notes: body.notes || null,
      assigned_to: body.assigned_to || user?.id || null,
      created_by: user?.id || null
    }
    
    const { data, error } = await supabase
      .from('crm_opportunities')
      .insert(opportunityData)
      .select()
      .single()
    
    if (error) throw error
    
    // Aggiorna lead a "qualificato" se non lo è già
    await supabase
      .from('crm_leads')
      .update({ status: 'qualificato' })
      .eq('id', body.lead_id)
      .in('status', ['nuovo', 'contattato'])
    
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating opportunity:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'opportunità' },
      { status: 500 }
    )
  }
}

