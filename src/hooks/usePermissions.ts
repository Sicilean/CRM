'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UserPermission {
  permission_id: string
  resource: string
  action: string
  source: 'role' | 'individual'
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isAgente, setIsAgente] = useState(false)

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      const supabase = createClient()
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Check super admin
      const { data: superAdminResult } = await supabase.rpc('is_super_admin')
      setIsSuperAdmin(!!superAdminResult)

      // Check admin
      const { data: adminResult } = await supabase.rpc('is_admin')
      setIsAdmin(!!adminResult)

      // Check agente
      const { data: agenteResult } = await supabase.rpc('is_agente')
      setIsAgente(!!agenteResult)

      // Get user permissions
      const { data: permsData } = await supabase.rpc('get_user_permissions')
      setPermissions(permsData || [])
    } catch (error) {
      console.error('Error loading permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (resource: string, action: string): boolean => {
    // Super admin ha sempre tutti i permessi
    if (isSuperAdmin) return true

    // Check in permissions list
    return permissions.some(
      p => p.resource === resource && p.action === action
    )
  }

  const hasAnyPermission = (checks: Array<{ resource: string; action: string }>): boolean => {
    return checks.some(({ resource, action }) => hasPermission(resource, action))
  }

  const hasAllPermissions = (checks: Array<{ resource: string; action: string }>): boolean => {
    return checks.every(({ resource, action }) => hasPermission(resource, action))
  }

  const canRead = (resource: string) => hasPermission(resource, 'SELECT')
  const canCreate = (resource: string) => hasPermission(resource, 'INSERT')
  const canUpdate = (resource: string) => hasPermission(resource, 'UPDATE')
  const canDelete = (resource: string) => hasPermission(resource, 'DELETE')

  return {
    permissions,
    loading,
    isAdmin,
    isSuperAdmin,
    isAgente,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    reload: loadPermissions
  }
}

