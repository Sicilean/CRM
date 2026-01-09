// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/crm/leads/[id]/activities - Crea attività per lead
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validazione
    if (!body.activity_type || !body.description) {
      return NextResponse.json(
        { error: 'activity_type e description sono obbligatori' },
        { status: 400 }
      )
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    const activityData = {
      lead_id: params.id,
      activity_type: body.activity_type,
      subject: body.subject || null,
      description: body.description,
      outcome: body.outcome || null,
      activity_date: body.activity_date || new Date().toISOString(),
      due_date: body.due_date || null,
      completed: body.completed || false,
      created_by: user?.id || null
    }
    
    const { data, error } = await supabase
      .from('crm_activities')
      .insert(activityData as any)
      .select(`
        *,
        created_user:created_by(id, full_name)
      `)
      .single()
    
    if (error) throw error
    
    // Se l'attività non è un task e non è una nota, aggiorna anche il lead
    if (!['task', 'nota'].includes(body.activity_type)) {
      // @ts-ignore - Supabase typing issue with dynamic updates
      const updateQuery = supabase
        .from('crm_leads')
        .update({
          data_ultimo_contatto: activityData.activity_date,
          metodo_ultimo_contatto: body.activity_type,
          ...(body.update_status ? { status: body.update_status } : {})
        })
        .eq('id', params.id)
      
      await updateQuery
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'attività' },
      { status: 500 }
    )
  }
}

// GET /api/crm/leads/[id]/activities - Lista attività del lead
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('crm_activities')
      .select(`
        *,
        created_user:created_by(id, full_name)
      `)
      .eq('lead_id', params.id)
      .order('activity_date', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento delle attività' },
      { status: 500 }
    )
  }
}

