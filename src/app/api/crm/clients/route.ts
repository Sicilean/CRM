import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { calculateCustomerCLV } from '@/lib/crm-utils'

// GET /api/crm/clients - Lista clienti con CLV
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    
    const clientType = searchParams.get('client_type') // 'persona_fisica' o 'persona_giuridica' o 'all'
    const sortBy = searchParams.get('sort_by') || 'clv'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    
    // Query clienti
    const clientsData = []
    
    // Persone Giuridiche clienti
    if (!clientType || clientType === 'all' || clientType === 'persona_giuridica') {
      const { data: pg, error: pgError } = await supabase
        .from('persone_giuridiche')
        .select('notion_id, ragione_sociale')
        .eq('cliente', true)
      
      if (!pgError && pg) {
        const clients = pg as any[]
        for (const client of clients) {
          const clv = await calculateCustomerCLV(client.notion_id, 'persona_giuridica')
          if (clv) {
            clientsData.push(clv)
          }
        }
      }
    }
    
    // Persone Fisiche clienti (con almeno un quote accepted)
    if (!clientType || clientType === 'all' || clientType === 'persona_fisica') {
      const { data: acceptedQuotes } = await supabase
        .from('quotes')
        .select('persona_fisica_id')
        .eq('status', 'accepted')
        .not('persona_fisica_id', 'is', null)
      
      if (acceptedQuotes) {
        const quotes = acceptedQuotes as any[]
        const uniquePfIds = [...new Set(quotes.map(q => q.persona_fisica_id))]
        
        for (const pfId of uniquePfIds) {
          if (pfId) {
            const clv = await calculateCustomerCLV(pfId, 'persona_fisica')
            if (clv) {
              clientsData.push(clv)
            }
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

