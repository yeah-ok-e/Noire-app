'use client'

import { useState, useEffect, useCallback } from 'react'
import { set, get } from 'idb-keyval'

const OFFLINE_CACHE_KEY = 'legacy_os_offline_cache'

export interface OfflineCacheData {
  cashOnHand: number
  overdueItems: Array<{ name: string; amount: number; type: string }>
  bills: Array<{ name: string; amount: number; status: string; due_date: string | null }>
  debts: Array<{ creditor: string; amount: number }>
  emergencyContacts: Array<{ name: string; phone?: string; relationship: string }>
  reminders: Array<{ title: string; priority: string; due_at: string | null }>
  nextMoves: string[]
  assistancePrograms: Array<{ name: string; status: string; appointmentDate?: string }>
  lastSynced: string
}

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false)
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const [offlineData, setOfflineData] = useState<OfflineCacheData | null>(null)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
    }

    setIsOffline(!navigator.onLine)

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Load cached data
    get(OFFLINE_CACHE_KEY).then((cached: OfflineCacheData | undefined) => {
      if (cached) {
        setOfflineData(cached)
        setLastSynced(cached.lastSynced)
      }
    }).catch(() => {})

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const cacheData = useCallback(async (data: Omit<OfflineCacheData, 'lastSynced'>) => {
    const cacheEntry: OfflineCacheData = {
      ...data,
      lastSynced: new Date().toISOString(),
    }
    try {
      await set(OFFLINE_CACHE_KEY, cacheEntry)
      setLastSynced(cacheEntry.lastSynced)
      setOfflineData(cacheEntry)
    } catch {
      // IndexedDB not available
    }
  }, [])

  return {
    isOffline,
    lastSynced,
    offlineData,
    cacheData,
  }
}
