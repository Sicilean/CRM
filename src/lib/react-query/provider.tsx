'use client'

/**
 * 🚀 OTTIMIZZAZIONE EGRESS: React Query Provider
 * 
 * Implementa cache client-side per ridurre chiamate duplicate al database
 * e migliorare performance dell'applicazione.
 * 
 * BENEFICI:
 * - Cache automatica delle query
 * - Riduzione chiamate duplicate
 * - Background refetching intelligente
 * - Gestione loading/error states
 * - Invalidazione automatica cache
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

/**
 * Configurazione ottimale React Query per Supabase
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 🚀 Cache per 5 minuti (dati non cambiano frequentemente)
        staleTime: 5 * 60 * 1000,
        
        // 🚀 Mantieni cache per 10 minuti anche se non usata
        gcTime: 10 * 60 * 1000,
        
        // 🚀 Refetch automatico quando finestra diventa visibile
        refetchOnWindowFocus: true,
        
        // 🚀 NON refetch al mount se dati sono fresh
        refetchOnMount: false,
        
        // 🚀 Retry solo 1 volta su errore (non 3 come default)
        retry: 1,
        
        // 🚀 Mostra dati cached mentre refetcha in background
        placeholderData: (previousData: any) => previousData,
      },
      mutations: {
        // Retry mutations solo in caso di errori di rete
        retry: 1,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: crea sempre nuovo client
    return makeQueryClient()
  } else {
    // Browser: riusa client esistente
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

interface ReactQueryProviderProps {
  children: ReactNode
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // NON usare useState per browser client (causa re-render e perdita cache)
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}

/**
 * Query keys standardizzati per invalidazione cache
 * 
 * @example
 * ```ts
 * // Usa nelle query
 * queryKey: queryKeys.personeGiuridiche.list({ provincia: 'MI' })
 * 
 * // Invalida dopo mutation
 * queryClient.invalidateQueries({ queryKey: queryKeys.personeGiuridiche.all })
 * ```
 */
export const queryKeys = {
  // Persone Giuridiche
  personeGiuridiche: {
    all: ['persone-giuridiche'] as const,
    lists: () => [...queryKeys.personeGiuridiche.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.personeGiuridiche.lists(), filters] as const,
    details: () => [...queryKeys.personeGiuridiche.all, 'detail'] as const,
    detail: (id: string) => 
      [...queryKeys.personeGiuridiche.details(), id] as const,
  },
  
  // Persone Fisiche
  personeFisiche: {
    all: ['persone-fisiche'] as const,
    lists: () => [...queryKeys.personeFisiche.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.personeFisiche.lists(), filters] as const,
    details: () => [...queryKeys.personeFisiche.all, 'detail'] as const,
    detail: (id: string) => 
      [...queryKeys.personeFisiche.details(), id] as const,
  },
  
  // Filter Options (cachedissimo!)
  filterOptions: {
    all: ['filter-options'] as const,
    provinces: () => [...queryKeys.filterOptions.all, 'provinces'] as const,
    organizationTypes: () => [...queryKeys.filterOptions.all, 'organization-types'] as const,
    comuni: () => [...queryKeys.filterOptions.all, 'comuni'] as const,
    settori: () => [...queryKeys.filterOptions.all, 'settori'] as const,
  },
  
  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => 
      [...queryKeys.projects.details(), id] as const,
  },
  
  // Quotes
  quotes: {
    all: ['quotes'] as const,
    lists: () => [...queryKeys.quotes.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.quotes.lists(), filters] as const,
    details: () => [...queryKeys.quotes.all, 'detail'] as const,
    detail: (id: string) => 
      [...queryKeys.quotes.details(), id] as const,
  },
  
  // Brand Kits
  brandKits: {
    all: ['brand-kits'] as const,
    lists: () => [...queryKeys.brandKits.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.brandKits.lists(), filters] as const,
    details: () => [...queryKeys.brandKits.all, 'detail'] as const,
    detail: (id: string) => 
      [...queryKeys.brandKits.details(), id] as const,
  },
} as const

