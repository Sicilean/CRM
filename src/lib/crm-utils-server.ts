import { createClient } from '@/lib/supabase/server'
import { Quote } from '@/types/database.types'

// Type per risposta calcolo CLV
interface CustomerCLVResult {
  customerId: string
  customerName: string
  customerType: 'persona_fisica' | 'persona_giuridica'
  totalQuotes: number
  acceptedQuotes: number
  conversionRate: number
  customerLifetimeValue: number
  firstPurchaseDate: string | null
  lastPurchaseDate: string | null
  activeProjects: number
}

// Type per quote nella query CLV
type QuoteForCLV = {
  id: string
  grand_total: number | null
  status: string | null
  created_at: string | null
}

/**
 * Calcola il Customer Lifetime Value GLOBALE per un cliente (per Admin)
 * Include tutti i preventivi di tutti gli agenti
 */
export async function calculateCustomerCLV(
  clientId: string,
  clientType: 'persona_fisica' | 'persona_giuridica'
): Promise<CustomerCLVResult | null> {
  const supabase = await createClient()
  
  try {
    // Query tutti i quotes per il cliente (senza filtro agente)
    const column = clientType === 'persona_fisica' ? 'persona_fisica_id' : 'persona_giuridica_id'
    const { data: quotes, error: quotesError } = await (supabase
      .from('quotes') as any)
      .select('id, grand_total, status, created_at')
      .eq(column, clientId)
    
    if (quotesError) throw quotesError
    
    // Query progetti attivi
    const { data: projects, error: projectsError } = await (supabase
      .from('projects') as any)
      .select('id')
      .eq(column, clientId)
      .in('stato', ['contratto_firmato', 'in_esecuzione', 'in_revisione'])
    
    if (projectsError) throw projectsError
    
    // Query nome cliente
    const { data: clientData, error: clientError } = await (supabase
      .from(clientType === 'persona_fisica' ? 'persone_fisiche' : 'persone_giuridiche') as any)
      .select(clientType === 'persona_fisica' ? 'nome_completo' : 'ragione_sociale')
      .eq('notion_id', clientId)
      .limit(1)
    
    if (clientError || !clientData || clientData.length === 0) {
      console.warn(`Cliente non trovato: ${clientId}`)
      return null
    }
    
    const client = clientData[0]
    
    // Calcoli
    const totalQuotes = quotes?.length || 0
    const acceptedQuotes = (quotes as QuoteForCLV[] | null)?.filter((q) => q.status === 'accepted') || []
    const acceptedQuotesCount = acceptedQuotes.length
    
    const customerLifetimeValue = acceptedQuotes.reduce((sum: number, q) => {
      return sum + (parseFloat(String(q.grand_total)) || 0)
    }, 0)
    
    const conversionRate = totalQuotes > 0 
      ? Math.round((acceptedQuotesCount / totalQuotes) * 100) 
      : 0
    
    const sortedByAsc = [...acceptedQuotes].sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
    const sortedByDesc = [...acceptedQuotes].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    
    const firstPurchaseDate = sortedByAsc.length > 0 ? sortedByAsc[0].created_at : null
    const lastPurchaseDate = sortedByDesc.length > 0 ? sortedByDesc[0].created_at : null
    
    const clientRecord = client as Record<string, unknown>
    const customerName = clientType === 'persona_fisica' 
      ? String(clientRecord.nome_completo || '')
      : String(clientRecord.ragione_sociale || '')
    
    return {
      customerId: clientId,
      customerName,
      customerType: clientType,
      totalQuotes,
      acceptedQuotes: acceptedQuotesCount,
      conversionRate,
      customerLifetimeValue,
      firstPurchaseDate,
      lastPurchaseDate,
      activeProjects: projects?.length || 0
    }
  } catch (error) {
    console.error('Error calculating CLV:', error)
    return null
  }
}

/**
 * Calcola il Customer Lifetime Value per un cliente filtrato per agente (server-side)
 */
export async function calculateCustomerCLVForAgent(
  clientId: string,
  clientType: 'persona_fisica' | 'persona_giuridica',
  agentId: string
): Promise<CustomerCLVResult | null> {
  const supabase = await createClient()
  
  try {
    // Query quotes per il cliente creati dall'agente
    const column = clientType === 'persona_fisica' ? 'persona_fisica_id' : 'persona_giuridica_id'
    const { data: quotes, error: quotesError } = await (supabase
      .from('quotes') as any)
      .select('id, grand_total, status, created_at')
      .eq(column, clientId)
      .eq('created_by', agentId)
    
    if (quotesError) throw quotesError
    
    // Query progetti attivi
    const { data: projects, error: projectsError } = await (supabase
      .from('projects') as any)
      .select('id')
      .eq(column, clientId)
      .in('stato', ['contratto_firmato', 'in_esecuzione', 'in_revisione'])
    
    if (projectsError) throw projectsError
    
    // Query nome cliente
    const { data: clientData, error: clientError } = await (supabase
      .from(clientType === 'persona_fisica' ? 'persone_fisiche' : 'persone_giuridiche') as any)
      .select(clientType === 'persona_fisica' ? 'nome_completo' : 'ragione_sociale')
      .eq('notion_id', clientId)
      .limit(1)
    
    // Se non trovo il cliente, ritorno null
    if (clientError || !clientData || clientData.length === 0) {
      console.warn(`Cliente non trovato: ${clientId}`)
      return null
    }
    
    const client = clientData[0]
    
    // Calcoli
    const totalQuotes = quotes?.length || 0
    const acceptedQuotes = (quotes as QuoteForCLV[] | null)?.filter((q) => q.status === 'accepted') || []
    const acceptedQuotesCount = acceptedQuotes.length
    
    const customerLifetimeValue = acceptedQuotes.reduce((sum: number, q) => {
      return sum + (parseFloat(String(q.grand_total)) || 0)
    }, 0)
    
    const conversionRate = totalQuotes > 0 
      ? Math.round((acceptedQuotesCount / totalQuotes) * 100) 
      : 0
    
    const sortedByAsc = [...acceptedQuotes].sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
    const sortedByDesc = [...acceptedQuotes].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    
    const firstPurchaseDate = sortedByAsc.length > 0 ? sortedByAsc[0].created_at : null
    const lastPurchaseDate = sortedByDesc.length > 0 ? sortedByDesc[0].created_at : null
    
    // Type guard per cliente
    const clientRecord = client as Record<string, unknown>
    const customerName = clientType === 'persona_fisica' 
      ? String(clientRecord.nome_completo || '')
      : String(clientRecord.ragione_sociale || '')
    
    return {
      customerId: clientId,
      customerName,
      customerType: clientType,
      totalQuotes,
      acceptedQuotes: acceptedQuotesCount,
      conversionRate,
      customerLifetimeValue,
      firstPurchaseDate,
      lastPurchaseDate,
      activeProjects: projects?.length || 0
    }
  } catch (error) {
    console.error('Error calculating CLV for agent:', error)
    return null
  }
}
