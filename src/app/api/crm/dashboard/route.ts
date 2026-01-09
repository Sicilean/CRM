import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Query KPIs usando la view
    const { data: kpis, error } = await supabase
      .from('crm_dashboard_kpis')
      .select('*')
      .single()
    
    if (error) throw error
    
    return NextResponse.json(kpis)
  } catch (error: any) {
    console.error('Error fetching CRM dashboard KPIs:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento dei KPI' },
      { status: 500 }
    )
  }
}

