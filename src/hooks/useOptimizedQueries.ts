/**
 * 🚀 OTTIMIZZAZIONE EGRESS: Hook ottimizzati con React Query
 * 
 * Custom hooks che utilizzano React Query per cache automatica
 * e riduzione chiamate duplicate al database.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/react-query/provider'
import {
  getPersoneGiuridichePaginated,
  getUniqueFilterOptions,
  getTableCount,
  PERSONE_GIURIDICHE_DETAIL_FIELDS,
} from '@/lib/supabase/query-helpers'

// ===== PERSONE GIURIDICHE =====

/**
 * Hook ottimizzato per lista persone giuridiche con cache
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = usePersoneGiuridiche({
 *   page: 0,
 *   searchQuery: 'Acme',
 *   filters: { provincia: 'MI' }
 * })
 * ```
 */
export function usePersoneGiuridiche(options: {
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
  enabled?: boolean
} = {}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: queryKeys.personeGiuridiche.list({
      page: options.page,
      searchQuery: options.searchQuery,
      filters: options.filters,
      orderBy: options.orderBy,
      orderDirection: options.orderDirection,
    }),
    queryFn: () => getPersoneGiuridichePaginated(supabase, options),
    enabled: options.enabled !== false,
    // 🚀 Cache per 5 minuti (configurato globalmente)
  })
}

/**
 * Hook ottimizzato per dettaglio persona giuridica
 * 
 * @example
 * ```tsx
 * const { data: persona, isLoading } = usePersonaGiuridica('abc-123')
 * ```
 */
export function usePersonaGiuridica(notionId: string, enabled = true) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: queryKeys.personeGiuridiche.detail(notionId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('persone_giuridiche')
        .select(PERSONE_GIURIDICHE_DETAIL_FIELDS)
        .eq('notion_id', notionId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: enabled && !!notionId,
    // 🚀 Cache più lunga per dettagli (10 minuti)
    staleTime: 10 * 60 * 1000,
  })
}

// ===== FILTER OPTIONS (SUPER CACHED) =====

/**
 * Hook per opzioni filtri (province)
 * Cache molto aggressiva perché raramente cambiano
 * 
 * @example
 * ```tsx
 * const { data: provinces } = useUniqueProvinces()
 * ```
 */
export function useUniqueProvinces() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: queryKeys.filterOptions.provinces(),
    queryFn: () => getUniqueFilterOptions(supabase, 'provinces'),
    // 🚀 Cache MOLTO lunga: le province non cambiano spesso!
    staleTime: 30 * 60 * 1000, // 30 minuti
    gcTime: 60 * 60 * 1000, // 1 ora
  })
}

/**
 * Hook per tipi organizzazione
 */
export function useOrganizationTypes() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: queryKeys.filterOptions.organizationTypes(),
    queryFn: () => getUniqueFilterOptions(supabase, 'organization_types'),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

/**
 * Hook per comuni
 */
export function useUniqueComuni() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: queryKeys.filterOptions.comuni(),
    queryFn: () => getUniqueFilterOptions(supabase, 'comuni'),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

/**
 * Hook per settori
 */
export function useUniqueSettori() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: queryKeys.filterOptions.settori(),
    queryFn: () => getUniqueFilterOptions(supabase, 'settori'),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

// ===== COUNTS (OTTIMIZZATI) =====

/**
 * Hook per conteggi tabella (usa head: true)
 * 
 * @example
 * ```tsx
 * const { data: count } = useTableCount('persone_giuridiche', { provincia: 'MI' })
 * ```
 */
export function useTableCount(
  table: string,
  filters?: Record<string, any>,
  enabled = true
) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: [table, 'count', filters],
    queryFn: () => getTableCount(supabase, table, filters),
    enabled,
    // 🚀 Cache conteggi per 2 minuti
    staleTime: 2 * 60 * 1000,
  })
}

// ===== MUTATIONS CON INVALIDAZIONE AUTOMATICA =====

/**
 * Hook per creare persona giuridica con invalidazione cache
 * 
 * @example
 * ```tsx
 * const createPersona = useCreatePersonaGiuridica()
 * await createPersona.mutateAsync({ ragione_sociale: 'Acme' })
 * ```
 */
export function useCreatePersonaGiuridica() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('persone_giuridiche')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    onSuccess: () => {
      // 🚀 Invalida automaticamente tutte le liste
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.personeGiuridiche.lists() 
      })
    },
  })
}

/**
 * Hook per aggiornare persona giuridica
 */
export function useUpdatePersonaGiuridica() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result, error } = await supabase
        .from('persone_giuridiche')
        .update(data)
        .eq('notion_id', id)
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    onSuccess: (_data, variables) => {
      // 🚀 Invalida liste e dettaglio specifico
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.personeGiuridiche.lists() 
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.personeGiuridiche.detail(variables.id) 
      })
    },
  })
}

/**
 * Hook per eliminare persona giuridica
 */
export function useDeletePersonaGiuridica() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('persone_giuridiche')
        .delete()
        .eq('notion_id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      // 🚀 Invalida tutte le liste
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.personeGiuridiche.lists() 
      })
    },
  })
}

// ===== PREFETCH UTILITIES =====

/**
 * Utility per pre-caricare dati in background
 * Utile per hover states o navigazione anticipata
 * 
 * @example
 * ```tsx
 * const prefetchPersona = usePrefetchPersonaGiuridica()
 * 
 * <div onMouseEnter={() => prefetchPersona('abc-123')}>
 *   Link
 * </div>
 * ```
 */
export function usePrefetchPersonaGiuridica() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return (notionId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.personeGiuridiche.detail(notionId),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('persone_giuridiche')
          .select(PERSONE_GIURIDICHE_DETAIL_FIELDS)
          .eq('notion_id', notionId)
          .single()
        
        if (error) throw error
        return data
      },
    })
  }
}

