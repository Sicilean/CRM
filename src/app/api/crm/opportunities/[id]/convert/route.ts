// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/crm/opportunities/[id]/convert - Converti opportunità in cliente
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Get opportunità con quotes
    const { data: opportunity, error: oppError } = await supabase
      .from('crm_opportunities')
      .select(`
        *,
        lead:lead_id(*),
        opportunity_quotes:crm_opportunity_quotes(
          quote:quote_id(*)
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (oppError) throw oppError
    
    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunità non trovata' },
        { status: 404 }
      )
    }
    
    // Verifica che ci sia almeno un preventivo accettato
    const acceptedQuotes = opportunity.opportunity_quotes?.filter(
      (oq: any) => oq.quote?.status === 'accepted'
    ) || []
    
    if (acceptedQuotes.length === 0) {
      return NextResponse.json(
        { error: 'Devi avere almeno un preventivo accettato per convertire in cliente' },
        { status: 400 }
      )
    }
    
    // 1. Aggiorna opportunità a "chiuso_vinto"
    await supabase
      .from('crm_opportunities')
      .update({
        stage: 'chiuso_vinto',
        closed_at: new Date().toISOString()
      })
      .eq('id', params.id)
    
    // 2. Aggiorna lead a "convertito"
    await supabase
      .from('crm_leads')
      .update({ status: 'convertito' })
      .eq('id', opportunity.lead_id)
    
    // 3. Marca cliente come "cliente = true" (se persona giuridica)
    if (opportunity.persona_giuridica_id) {
      await supabase
        .from('persone_giuridiche')
        .update({ cliente: true })
        .eq('notion_id', opportunity.persona_giuridica_id)
    }
    
    // 4. Opzionale: Crea progetti dai preventivi accettati
    const createdProjects = []
    if (body.createProjects) {
      for (const oq of acceptedQuotes) {
        const quote = oq.quote
        
        try {
          // Genera numero progetto (semplice sequenziale)
          const { data: lastProject } = await supabase
            .from('projects')
            .select('project_number')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          const nextNumber = lastProject?.project_number 
            ? parseInt(lastProject.project_number.split('-')[1] || '0') + 1
            : 1
          
          const projectNumber = `PRJ-${String(nextNumber).padStart(4, '0')}`
          
          // Crea progetto
          const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
              project_number: projectNumber,
              nome: quote.client_name || `Progetto da Preventivo ${quote.quote_number}`,
              descrizione: quote.notes || null,
              persona_fisica_id: opportunity.persona_fisica_id,
              persona_giuridica_id: opportunity.persona_giuridica_id,
              quote_id: quote.id,
              stato: 'contratto_firmato',
              data_firma_contratto: new Date().toISOString().split('T')[0],
              valore_preventivato: quote.total_amount
            })
            .select()
            .single()
          
          if (!projectError && project) {
            createdProjects.push(project)
          }
        } catch (projectErr) {
          console.error('Error creating project from quote:', projectErr)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      opportunity,
      createdProjects
    })
  } catch (error: any) {
    console.error('Error converting opportunity:', error)
    return NextResponse.json(
      { error: 'Errore nella conversione dell\'opportunità' },
      { status: 500 }
    )
  }
}

