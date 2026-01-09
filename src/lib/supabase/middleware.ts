import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database.types'

// Rotte bloccate per gli agenti commerciali (solo admin)
const BLOCKED_ROUTES = [
  '/commerciale/services-mapping',
  '/commerciale/quote-settings',
  '/servizi/new',
  '/servizi/macro-aree',
]

// Pattern per rotte di edit servizi
const BLOCKED_PATTERNS = [
  /^\/servizi\/[^/]+\/edit$/,
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Verifica se l'utente è agente
  let isAgente = false
  if (user) {
    try {
      const { data } = await supabase.rpc('is_agente')
      isAgente = !!data
    } catch (error) {
      console.error('Error checking agente role:', error)
    }
  }

  // Blocca accesso alle rotte di configurazione per gli agenti
  const isBlockedRoute = BLOCKED_ROUTES.includes(pathname) || 
    BLOCKED_PATTERNS.some(pattern => pattern.test(pathname))
  
  if (isBlockedRoute && isAgente) {
    // Reindirizza alla dashboard commerciale
    return NextResponse.redirect(new URL('/commerciale', request.url))
  }

  // Se l'utente non è loggato e prova ad accedere a rotte protette
  if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/forgot-password') && !pathname.startsWith('/reset-password') && !pathname.startsWith('/preventivo/')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se l'utente è loggato e va alla root, reindirizza alla dashboard
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/commerciale', request.url))
  }

  return supabaseResponse
}


