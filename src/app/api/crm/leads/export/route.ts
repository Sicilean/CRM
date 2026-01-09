import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { exportLeadsToCSV } from '@/lib/crm-utils'

// GET /api/crm/leads/export - Export leads to CSV
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Fetch all leads
    const { data: leads, error } = await supabase
      .from('crm_leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Generate CSV
    const csv = exportLeadsToCSV(leads || [])
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error: any) {
    console.error('Error exporting leads:', error)
    return NextResponse.json(
      { error: 'Errore nell\'export dei leads' },
      { status: 500 }
    )
  }
}

