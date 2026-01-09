import { createClient } from '@/lib/supabase/client'
import { Quote, PersonaFisica, PersonaGiuridica, CrmLead } from '@/types/database.types'
import { DEFAULT_NEXT_CONTACT_DAYS, CSV_LEAD_TEMPLATE_HEADERS, CSV_LEAD_TEMPLATE_SAMPLE } from './crm-constants'

// Type per import lead da CSV
interface LeadFromCSV {
  nome_completo: string
  email: string
  telefono?: string
  azienda?: string
  ruolo?: string
  budget?: number | null
  servizi_interesse?: string[]
  descrizione?: string
  fonte?: string
  note_interne?: string
}

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
type QuoteForCLV = Pick<Quote, 'id' | 'total_amount' | 'status' | 'created_at'>

/**
 * Calcola il Customer Lifetime Value per un cliente
 */
export async function calculateCustomerCLV(
  clientId: string,
  clientType: 'persona_fisica' | 'persona_giuridica'
): Promise<CustomerCLVResult | null> {
  const supabase = createClient()
  
  try {
    // Query quotes per il cliente
    const column = clientType === 'persona_fisica' ? 'persona_fisica_id' : 'persona_giuridica_id'
    const { data: quotes, error: quotesError } = await (supabase
      .from('quotes') as any)
      .select('id, total_amount, status, created_at')
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
      return sum + (parseFloat(String(q.total_amount)) || 0)
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
    console.error('Error calculating CLV:', error)
    return null
  }
}


/**
 * Formatta valuta in Euro
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

/**
 * Calcola la data di prossimo contatto (default +5 giorni da oggi)
 */
export function calculateNextContactDate(fromDate?: Date, daysOffset = DEFAULT_NEXT_CONTACT_DAYS): Date {
  const date = fromDate || new Date()
  date.setDate(date.getDate() + daysOffset)
  return date
}

/**
 * Genera CSV template per import leads
 */
export function generateLeadsCSVTemplate(): string {
  const headers = CSV_LEAD_TEMPLATE_HEADERS.join(',')
  const sample = CSV_LEAD_TEMPLATE_SAMPLE.map(value => `"${value}"`).join(',')
  return `${headers}\n${sample}`
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export leads to CSV
 */
export function exportLeadsToCSV(leads: CrmLead[]): string {
  const headers = CSV_LEAD_TEMPLATE_HEADERS
  const rows = leads.map(lead => {
    return [
      lead.nome_completo || '',
      lead.email || '',
      lead.telefono || '',
      lead.azienda || '',
      lead.ruolo || '',
      lead.budget || '',
      Array.isArray(lead.servizi_interesse) ? lead.servizi_interesse.join('; ') : '',
      lead.descrizione || '',
      lead.fonte || '',
      lead.note_interne || ''
    ].map(value => `"${value}"`).join(',')
  })
  
  return [headers.join(','), ...rows].join('\n')
}

/**
 * Parse CSV to leads
 */
export function parseCSVToLeads(csvContent: string): LeadFromCSV[] {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '')
  if (lines.length < 2) return [] // At least header + 1 row
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const leads: LeadFromCSV[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const lead: LeadFromCSV = { nome_completo: '', email: '' }
    
    headers.forEach((header, index) => {
      const value = values[index]
      if (header === 'budget') {
        lead[header] = value ? parseFloat(value) : null
      } else if (header === 'servizi_interesse') {
        lead[header] = value ? value.split(';').map((s: string) => s.trim()) : []
      } else {
        lead[header] = value || null
      }
    })
    
    // Validazione base
    if (lead.nome_completo && lead.email) {
      leads.push(lead)
    }
  }
  
  return leads
}

/**
 * Formatta data in formato italiano
 */
export function formatDateItalian(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d)
}

/**
 * Formatta data e ora in formato italiano
 */
export function formatDateTimeItalian(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

/**
 * Calcola giorni tra due date
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Verifica se un follow-up è scaduto
 */
export function isFollowUpOverdue(dueDate: string | Date): boolean {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  return due < new Date()
}

