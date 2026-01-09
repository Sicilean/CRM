// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { parseCSVToLeads } from '@/lib/crm-utils'

// POST /api/crm/leads/import - Import leads from CSV
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    if (!body.csvContent) {
      return NextResponse.json(
        { error: 'csvContent è obbligatorio' },
        { status: 400 }
      )
    }
    
    // Parse CSV
    const leadsData = parseCSVToLeads(body.csvContent)
    
    if (leadsData.length === 0) {
      return NextResponse.json(
        { error: 'Nessun lead valido trovato nel CSV' },
        { status: 400 }
      )
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Add metadata to each lead
    const leadsToInsert = leadsData.map(lead => ({
      ...lead,
      status: 'nuovo',
      created_by: user?.id || null,
      assigned_to: body.assigned_to || user?.id || null
    }))
    
    // Batch insert
    const { data, error } = await supabase
      .from('crm_leads')
      .insert(leadsToInsert)
      .select()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      leads: data
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error importing leads:', error)
    return NextResponse.json(
      { error: 'Errore nell\'import dei leads: ' + error.message },
      { status: 500 }
    )
  }
}

