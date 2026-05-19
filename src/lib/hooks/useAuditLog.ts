'use client'

import { useCallback } from 'react'
import { useDemoMode } from './useDemoMode'

const AUDIT_LOCAL_KEY = 'legacy_os_audit_log'

export interface AuditEntry {
  id: string
  action: string
  resource_type: string
  resource_id?: string
  previous_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  performed_by: string
  created_at: string
}

function getLocalAuditLog(): AuditEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(AUDIT_LOCAL_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveLocalAuditLog(entries: AuditEntry[]) {
  if (typeof window === 'undefined') return
  try {
    // Keep last 200 entries
    const trimmed = entries.slice(-200)
    localStorage.setItem(AUDIT_LOCAL_KEY, JSON.stringify(trimmed))
  } catch {
    // ignore
  }
}

export function useAuditLog() {
  const { isDemoMode } = useDemoMode()

  const logAction = useCallback(async (params: {
    action: string
    resource_type: string
    resource_id?: string
    previous_value?: Record<string, unknown>
    new_value?: Record<string, unknown>
  }) => {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...params,
      performed_by: isDemoMode ? 'demo_user' : 'user',
      created_at: new Date().toISOString(),
    }

    if (isDemoMode) {
      const log = getLocalAuditLog()
      saveLocalAuditLog([...log, entry])
      return entry
    }

    // In production, would write to Supabase audit_logs table
    return entry
  }, [isDemoMode])

  const getAuditLog = useCallback((): AuditEntry[] => {
    if (isDemoMode) {
      return getLocalAuditLog().reverse()
    }
    return []
  }, [isDemoMode])

  const rollbackEntry = useCallback((entry: AuditEntry) => {
    // For MVP: only roll back bill status and cash updates
    if (entry.resource_type === 'bill' && entry.previous_value) {
      const log = getLocalAuditLog()
      const rollbackEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        action: 'rollback',
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        previous_value: entry.new_value,
        new_value: entry.previous_value,
        performed_by: 'user',
        created_at: new Date().toISOString(),
      }
      saveLocalAuditLog([...log, rollbackEntry])
    }
  }, [])

  return { logAction, getAuditLog, rollbackEntry }
}
