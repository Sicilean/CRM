/**
 * 🚀 OTTIMIZZAZIONE EGRESS
 * 
 * Utility helper per query Supabase ottimizzate che riducono il consumo di bandwidth.
 * 
 * BEST PRACTICES:
 * 1. Sempre specificare campi con .select() invece di SELECT *
 * 2. Sempre usare .limit() per limitare risultati
 * 3. Usare paginazione per liste lunghe
 * 4. Evitare JSONB pesanti quando non necessari
 * 5. Usare RPC functions per aggregazioni
 */

import { SupabaseClient } from '@supabase/supabase-js'

// ===== CONFIGURAZIONE GLOBALE =====

/**
 * Limite default per query senza paginazione
 * Previene il caricamento accidentale di migliaia di righe
 */
export const DEFAULT_QUERY_LIMIT = 200

/**
 * Dimensione pagina standard per infinite scroll
 */
export const DEFAULT_PAGE_SIZE = 50

// ===== CAMPI SELEZIONATI OTTIMIZZATI =====

/**
 * Campi essenziali per lista persone giuridiche
 * Esclude JSONB pesanti come raw_notion_data, documenti complessi, ecc.
 */
export const PERSONE_GIURIDICHE_LIST_FIELDS = `
  notion_id,
  ragione_sociale,
  forma_giuridica,
  p_iva,
  codice_fiscale,
  sede_legale,
  comune,
  provincia,
  settore,
  tipo_organizzazione,
  relazioni_commerciali,
  created_at,
  updated_at
` as const

/**
 * Campi per selector (ancora più leggero)
 */
export const PERSONE_GIURIDICHE_SELECTOR_FIELDS = `
  notion_id,
  ragione_sociale,
  p_iva,
  email,
  contatti_telefonici,
  sede_legale,
  provincia,
  tipo_organizzazione,
  forma_giuridica
` as const

/**
 * Campi completi per dettaglio (esclude solo raw_notion_data)
 */
export const PERSONE_GIURIDICHE_DETAIL_FIELDS = `
  notion_id,
  ragione_sociale,
  forma_giuridica,
  p_iva,
  codice_fiscale,
  sdi_code,
  rea,
  sede_legale,
  comune,
  provincia,
  email,
  contatti_telefonici,
  sito_web,
  linkedin,
  facebook,
  instagram,
  x,
  youtube,
  tiktok,
  descrizione_core_business,
  settore,
  segmento,
  categoria_interna,
  tier_internal,
  tipo_organizzazione,
  relazioni_commerciali,
  data_costituzione,
  numero_addetti,
  certificazioni_standardizzate,
  fatturato_storico,
  dati_finanziari,
  documenti,
  note,
  created_at,
  updated_at
` as const

/**
 * Campi per persone fisiche - lista
 */
export const PERSONE_FISICHE_LIST_FIELDS = `
  notion_id,
  nome_completo,
  codice_fiscale,
  contatti,
  indirizzo,
  created_at,
  updated_at
` as const

/**
 * Campi per persone fisiche - selector
 */
export const PERSONE_FISICHE_SELECTOR_FIELDS = `
  notion_id,
  nome_completo,
  codice_fiscale,
  contatti,
  indirizzo
` as const

// ===== QUERY HELPER FUNCTIONS =====

/**
 * Ottiene lista paginata di persone giuridiche ottimizzata
 * 
 * @example
 * ```ts
 * const { data, count } = await getPersoneGiuridichePaginated(supabase, {
 *   page: 0,
 *   pageSize: 50,
 *   searchQuery: 'Acme',
 *   filters: { provincia: 'MI' }
 * })
 * ```
 */
export async function getPersoneGiuridichePaginated(
  supabase: SupabaseClient,
  options: {
    page?: number
    pageSize?: number
    searchQuery?: string
    filters?: {
      provincia?: string
      tipo_organizzazione?: string
      p_iva?: string
      forma_giuridica?: string
      settore?: string
      comune?: string
      relazioni_commerciali?: string[]
    }
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
  } = {}
) {
  const {
    page = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    searchQuery,
    filters = {},
    orderBy = 'ragione_sociale',
    orderDirection = 'asc'
  } = options

  let query = supabase
    .from('persone_giuridiche')
    .select(PERSONE_GIURIDICHE_LIST_FIELDS, { count: 'exact' })
    .order(orderBy, { ascending: orderDirection === 'asc' })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  // Applicare filtri
  if (filters.provincia) {
    query = query.eq('provincia', filters.provincia)
  }
  if (filters.tipo_organizzazione) {
    query = query.eq('tipo_organizzazione', filters.tipo_organizzazione)
  }
  if (filters.p_iva) {
    query = query.ilike('p_iva', `%${filters.p_iva}%`)
  }
  if (filters.forma_giuridica) {
    query = query.ilike('forma_giuridica', `%${filters.forma_giuridica}%`)
  }
  if (filters.settore) {
    query = query.ilike('settore', `%${filters.settore}%`)
  }
  if (filters.comune) {
    query = query.ilike('comune', `%${filters.comune}%`)
  }
  if (filters.relazioni_commerciali && filters.relazioni_commerciali.length > 0) {
    query = query.overlaps('relazioni_commerciali', filters.relazioni_commerciali)
  }

  // Ricerca full-text
  if (searchQuery?.trim()) {
    query = query.or(`ragione_sociale.ilike.%${searchQuery}%,p_iva.ilike.%${searchQuery}%,codice_fiscale.ilike.%${searchQuery}%,sede_legale.ilike.%${searchQuery}%,settore.ilike.%${searchQuery}%,descrizione_core_business.ilike.%${searchQuery}%,provincia.ilike.%${searchQuery}%,comune.ilike.%${searchQuery}%,rea.ilike.%${searchQuery}%`)
  }

  return query
}

/**
 * Ottiene opzioni uniche per filtri (ottimizzato con RPC)
 * 
 * @example
 * ```ts
 * const provinces = await getUniqueFilterOptions(supabase, 'provinces')
 * ```
 */
export async function getUniqueFilterOptions(
  supabase: SupabaseClient,
  type: 'provinces' | 'organization_types' | 'comuni' | 'settori'
): Promise<string[]> {
  try {
    const functionMap = {
      provinces: 'get_unique_provinces_optimized',
      organization_types: 'get_unique_organization_types_optimized',
      comuni: 'get_unique_comuni_optimized',
      settori: 'get_unique_settori_optimized'
    }

    const { data, error } = await supabase.rpc(functionMap[type])
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error fetching unique ${type}:`, error)
    // Fallback con LIMIT
    return []
  }
}

/**
 * Wrapper per aggiungere sempre un LIMIT di sicurezza
 * Previene query senza paginazione che scaricano migliaia di righe
 * 
 * @example
 * ```ts
 * const query = supabase.from('table').select('*')
 * const safeQuery = ensureLimit(query, 100)
 * ```
 */
export function ensureLimit<T>(
  query: any,
  limit: number = DEFAULT_QUERY_LIMIT
): any {
  // Nota: Supabase non espone metodi per controllare se limit è già applicato
  // Quindi applichiamo sempre il limit se non è una query con count
  return query.limit(limit)
}

/**
 * Helper per query count ottimizzate (head: true)
 * Non scarica dati, solo il conteggio
 * 
 * @example
 * ```ts
 * const count = await getTableCount(supabase, 'persone_giuridiche')
 * ```
 */
export async function getTableCount(
  supabase: SupabaseClient,
  table: string,
  filters?: Record<string, any>
): Promise<number> {
  let query = supabase
    .from(table)
    .select('*', { count: 'exact', head: true })

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
  }

  const { count } = await query
  return count || 0
}

// ===== TIPS E BEST PRACTICES =====

/**
 * 📚 GUIDA RAPIDA: Come ottimizzare le query Supabase
 * 
 * ❌ EVITA:
 * ```ts
 * // BAD: Scarica TUTTO
 * supabase.from('persone_giuridiche').select('*')
 * 
 * // BAD: Nessun LIMIT
 * supabase.from('persone_giuridiche').select('campo1, campo2')
 * 
 * // BAD: Scarica dati per count
 * const { data } = await supabase.from('table').select('*')
 * const count = data.length
 * ```
 * 
 * ✅ USA:
 * ```ts
 * // GOOD: Solo campi necessari + LIMIT
 * supabase.from('persone_giuridiche')
 *   .select(PERSONE_GIURIDICHE_LIST_FIELDS)
 *   .limit(50)
 * 
 * // GOOD: Paginazione
 * supabase.from('persone_giuridiche')
 *   .select('campo1, campo2')
 *   .range(0, 49)
 * 
 * // GOOD: Count senza scaricare dati
 * supabase.from('table').select('*', { count: 'exact', head: true })
 * 
 * // GOOD: RPC per aggregazioni
 * supabase.rpc('get_unique_provinces_optimized')
 * ```
 */

