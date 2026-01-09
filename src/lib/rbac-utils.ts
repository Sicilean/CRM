/**
 * RBAC Utility Functions
 * Helper functions per gestione ruoli e permessi
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { Database } from '@/types/database.types'
import type { GetUserPermissionsResult } from '@/types/supabase-rpc.types'

/**
 * Verifica se l'utente corrente è super admin
 */
export async function checkIsSuperAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.rpc('is_super_admin')
    return !!data
  } catch (error) {
    logger.error('Error checking super admin:', error)
    return false
  }
}

/**
 * Verifica se l'utente corrente è admin (super admin o admin role)
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.rpc('is_admin')
    return !!data
  } catch (error) {
    logger.error('Error checking admin:', error)
    return false
  }
}

/**
 * Verifica se l'utente corrente è agente commerciale
 */
export async function checkIsAgente(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.rpc('is_agente')
    return !!data
  } catch (error) {
    logger.error('Error checking agente:', error)
    return false
  }
}

/**
 * Verifica se l'utente corrente ha un permesso specifico
 */
export async function checkHasPermission(resource: string, action: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.rpc('has_permission', {
      resource_name: resource,
      action_name: action
    })
    return !!data
  } catch (error) {
    logger.error('Error checking permission:', error)
    return false
  }
}

/**
 * Get tutti i permessi dell'utente corrente
 */
export async function getUserPermissions(): Promise<GetUserPermissionsResult> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.rpc('get_user_permissions', {})
    return (data as GetUserPermissionsResult) || []
  } catch (error) {
    logger.error('Error getting user permissions:', error)
    return []
  }
}

/**
 * Middleware helper per proteggere API routes
 * 
 * @example
 * export async function POST(request: NextRequest) {
 *   const hasAccess = await requirePermission('quotes', 'INSERT')
 *   if (!hasAccess) {
 *     return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
 *   }
 *   // ... resto della logica
 * }
 */
export async function requirePermission(resource: string, action: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Check autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return false
  }

  // Check permission
  const { data } = await supabase.rpc('has_permission', {
    resource_name: resource,
    action_name: action
  })

  return !!data
}

/**
 * Middleware helper per proteggere API routes (richiede admin)
 */
export async function requireAdmin(): Promise<boolean> {
  const supabase = await createClient()
  
  // Check autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return false
  }

  // Check admin
  const { data } = await supabase.rpc('is_admin')
  return !!data
}

/**
 * Middleware helper per proteggere API routes (richiede super admin)
 */
export async function requireSuperAdmin(): Promise<boolean> {
  const supabase = await createClient()
  
  // Check autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return false
  }

  // Check super admin
  const { data } = await supabase.rpc('is_super_admin')
  return !!data
}

/**
 * Middleware helper per proteggere API routes (richiede agente)
 */
export async function requireAgente(): Promise<boolean> {
  const supabase = await createClient()
  
  // Check autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return false
  }

  // Check agente
  const { data } = await supabase.rpc('is_agente')
  return !!data
}

/**
 * Get info su ruoli e permessi di un utente specifico
 */
export async function getUserRolesAndPermissions(userId: string) {
  try {
    const supabase = await createClient()

    // Get roles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role:roles(*)')
      .eq('user_id', userId)

    // Get permissions
    const { data: permissions } = await supabase.rpc('get_user_permissions', {
      target_user_id: userId
    })

    // Type per il risultato della query con relation
    interface UserRoleWithRole {
      role: {
        id: string
        name: string
        description: string | null
      } | null
    }

    return {
      roles: (userRoles?.data?.map((ur: UserRoleWithRole) => ur.role) || []).filter((r): r is NonNullable<typeof r> => r !== null),
      permissions: (permissions as GetUserPermissionsResult) || []
    }
  } catch (error) {
    logger.error('Error getting user roles and permissions:', error)
    return { roles: [], permissions: [] }
  }
}

/**
 * Lista tutti i resource disponibili (utile per UI admin)
 */
export async function getAllResources(): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('permissions')
      .select('resource')
      .order('resource')

    if (error || !data) return []

    // Unique resources
    return Array.from(new Set(data.map((p) => p.resource)))
  } catch (error) {
    logger.error('Error getting resources:', error)
    return []
  }
}

/**
 * Mapping azioni SQL style <-> REST style
 */
export const ACTION_MAPPING = {
  SELECT: 'read',
  INSERT: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  // Reverse mapping
  read: 'SELECT',
  create: 'INSERT',
  update: 'UPDATE',
  delete: 'DELETE'
} as const

/**
 * Converti action da REST a SQL style
 */
export function toSQLAction(action: string): string {
  return ACTION_MAPPING[action as keyof typeof ACTION_MAPPING] as string || action.toUpperCase()
}

/**
 * Converti action da SQL a REST style
 */
export function toRESTAction(action: string): string {
  return ACTION_MAPPING[action as keyof typeof ACTION_MAPPING] as string || action.toLowerCase()
}

