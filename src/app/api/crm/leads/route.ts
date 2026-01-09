// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/crm/leads - Lista leads con filtri
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    
    // Parametri query
    const status = searchParams.get('status')
    const fonte = searchParams.get('fonte')
    const assignedTo = searchParams.get('assigned_to')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    let query = supabase
      .from('crm_leads')
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, email),
        persona_fisica:persona_fisica_id(notion_id, nome_completo, contatti),
        persona_giuridica:persona_giuridica_id(notion_id, ragione_sociale, email, contatti_telefonici)
      `, { count: 'exact' })
    
    // Filtri
    if (status) query = query.eq('status', status)
    if (fonte) query = query.eq('fonte', fonte)
    if (assignedTo) query = query.eq('assigned_to', assignedTo)
    
    // Ricerca full-text
    if (search) {
      query = query.or(`nome_completo.ilike.%${search}%,email.ilike.%${search}%,azienda.ilike.%${search}%,telefono.ilike.%${search}%`)
    }
    
    // Ordinamento
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    
    // Paginazione
    query = query.range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      data,
      count,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento dei leads' },
      { status: 500 }
    )
  }
}

// POST /api/crm/leads - Crea nuovo lead
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validazione
    if (!body.nome_completo || !body.email) {
      return NextResponse.json(
        { error: 'Nome completo e email sono obbligatori' },
        { status: 400 }
      )
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    const leadData = {
      nome_completo: body.nome_completo,
      email: body.email,
      telefono: body.telefono || null,
      azienda: body.azienda || null,
      ruolo: body.ruolo || null,
      budget: body.budget || null,
      servizi_interesse: body.servizi_interesse || [],
      descrizione: body.descrizione || null,
      fonte: body.fonte || null,
      status: body.status || 'nuovo',
      note_interne: body.note_interne || null,
      assigned_to: body.assigned_to || user?.id || null,
      created_by: user?.id || null
    }
    
    const { data, error } = await supabase
      .from('crm_leads')
      .insert(leadData)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione del lead' },
      { status: 500 }
    )
  }
}

