import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { calculateCustomerCLVForAgent, calculateCustomerCLV } from '@/lib/crm-utils-server'

// GET /api/crm/clients - Lista clienti con CLV
// Admin/Super Admin: vedono tutti i clienti
// Agenti: vedono solo i clienti con cui hanno lavorato (creato preventivi)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Ottieni utente corrente
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }
    
    // Verifica se l'utente è admin
    const { data: isAdminResult } = await supabase.rpc('is_admin')
    const isAdmin = !!isAdminResult
    
    const searchParams = request.nextUrl.searchParams
    
    const clientType = searchParams.get('client_type') // 'persona_fisica' o 'persona_giuridica' o 'all'
    const sortBy = searchParams.get('sort_by') || 'clv'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    
    // Query clienti
    const clientsData = []
    
    // Admin vede tutti i quote, agente vede solo i suoi
    let quotesQuery = supabase
      .from('quotes')
      .select('id, persona_fisica_id, persona_giuridica_id, status, total_amount, created_by')
    
    if (!isAdmin) {
      quotesQuery = quotesQuery.eq('created_by', user.id)
    }
    
    const { data: agentQuotes } = await quotesQuery
    
    if (!agentQuotes || agentQuotes.length === 0) {
      return NextResponse.json({ data: [], count: 0 })
    }
    
    // Persone Giuridiche clienti
    // Admin: tutti i clienti | Agente: solo quelli con preventivi creati da lui
    if (!clientType || clientType === 'all' || clientType === 'persona_giuridica') {
      const pgIds = [...new Set(agentQuotes.filter(q => q.persona_giuridica_id).map(q => q.persona_giuridica_id))]
      
      for (const pgId of pgIds) {
        if (pgId) {
          // Admin calcola CLV globale, agente calcola solo suo
          const clv = isAdmin 
            ? await calculateCustomerCLV(pgId, 'persona_giuridica')
            : await calculateCustomerCLVForAgent(pgId, 'persona_giuridica', user.id)
          if (clv) {
            clientsData.push(clv)
          }
        }
      }
    }
    
    // Persone Fisiche clienti
    // Admin: tutti i clienti | Agente: solo quelli con preventivi creati da lui
    if (!clientType || clientType === 'all' || clientType === 'persona_fisica') {
      const pfIds = [...new Set(agentQuotes.filter(q => q.persona_fisica_id).map(q => q.persona_fisica_id))]
      
      for (const pfId of pfIds) {
        if (pfId) {
          // Admin calcola CLV globale, agente calcola solo suo
          const clv = isAdmin
            ? await calculateCustomerCLV(pfId, 'persona_fisica')
            : await calculateCustomerCLVForAgent(pfId, 'persona_fisica', user.id)
          if (clv) {
            clientsData.push(clv)
          }
        }
      }
    }
    
    // Ordinamento
    if (sortBy === 'clv') {
      clientsData.sort((a, b) => {
        const diff = b.customerLifetimeValue - a.customerLifetimeValue
        return sortOrder === 'desc' ? diff : -diff
      })
    } else if (sortBy === 'name') {
      clientsData.sort((a, b) => {
        const diff = a.customerName.localeCompare(b.customerName)
        return sortOrder === 'desc' ? -diff : diff
      })
    }
    
    return NextResponse.json({
      data: clientsData,
      count: clientsData.length
    })
  } catch (error: any) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento dei clienti' },
      { status: 500 }
    )
  }
}

