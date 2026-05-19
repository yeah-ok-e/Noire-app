'use client'

import { useState, useEffect } from 'react'
import { DEMO_DATA, DEMO_USER_ID } from '@/lib/constants/demoData'
import type { Bill, Debt, CashUpdate, Reminder, IncomeSource, AssistanceProgram } from '@/types/database'

const IS_DEMO =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder_key'

const LOCAL_STORAGE_KEY = 'legacy_os_demo_data'

interface DemoStore {
  cashUpdates: CashUpdate[]
  bills: Bill[]
  debts: Debt[]
  reminders: Reminder[]
  incomeSources: IncomeSource[]
  assistancePrograms: AssistanceProgram[]
}

function getLocalStore(): DemoStore {
  if (typeof window === 'undefined') return {
    cashUpdates: DEMO_DATA.cashUpdates,
    bills: DEMO_DATA.bills,
    debts: DEMO_DATA.debts,
    reminders: DEMO_DATA.reminders,
    incomeSources: DEMO_DATA.incomeSources,
    assistancePrograms: DEMO_DATA.assistancePrograms,
  }
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore
  }
  return {
    cashUpdates: DEMO_DATA.cashUpdates,
    bills: DEMO_DATA.bills,
    debts: DEMO_DATA.debts,
    reminders: DEMO_DATA.reminders,
    incomeSources: DEMO_DATA.incomeSources,
    assistancePrograms: DEMO_DATA.assistancePrograms,
  }
}

function saveLocalStore(store: DemoStore) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // ignore
  }
}

export function useDemoMode() {
  const [isDemoMode] = useState(IS_DEMO)
  const [store, setStore] = useState<DemoStore>(getLocalStore)

  useEffect(() => {
    if (isDemoMode) {
      const loaded = getLocalStore()
      setStore(loaded)
    }
  }, [isDemoMode])

  const updateStore = (updates: Partial<DemoStore>) => {
    setStore(prev => {
      const next = { ...prev, ...updates }
      saveLocalStore(next)
      return next
    })
  }

  const addBill = (bill: Omit<Bill, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newBill: Bill = {
      ...bill,
      id: `bill-${Date.now()}`,
      user_id: DEMO_USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    updateStore({ bills: [...store.bills, newBill] })
    return newBill
  }

  const updateBill = (id: string, updates: Partial<Bill>) => {
    updateStore({
      bills: store.bills.map(b => b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b),
    })
  }

  const addDebt = (debt: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newDebt: Debt = {
      ...debt,
      id: `debt-${Date.now()}`,
      user_id: DEMO_USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    updateStore({ debts: [...store.debts, newDebt] })
    return newDebt
  }

  const addCashUpdate = (amount: number, note?: string, source?: string) => {
    const update: CashUpdate = {
      id: `cash-${Date.now()}`,
      user_id: DEMO_USER_ID,
      amount,
      note: note || null,
      source: source || null,
      created_at: new Date().toISOString(),
    }
    updateStore({ cashUpdates: [...store.cashUpdates, update] })
    return update
  }

  const getCurrentCash = () => {
    if (store.cashUpdates.length === 0) return DEMO_DATA.cashOnHand
    const sorted = [...store.cashUpdates].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    return sorted[0].amount
  }

  const addReminder = (reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: `rem-${Date.now()}`,
      user_id: DEMO_USER_ID,
      created_at: new Date().toISOString(),
    }
    updateStore({ reminders: [...store.reminders, newReminder] })
    return newReminder
  }

  const completeReminder = (id: string) => {
    updateStore({
      reminders: store.reminders.map(r =>
        r.id === id ? { ...r, completed: true, completed_at: new Date().toISOString() } : r
      ),
    })
  }

  return {
    isDemoMode,
    store,
    getCurrentCash,
    addBill,
    updateBill,
    addDebt,
    addCashUpdate,
    addReminder,
    completeReminder,
    demoData: DEMO_DATA,
    userId: DEMO_USER_ID,
  }
}
