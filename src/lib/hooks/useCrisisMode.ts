'use client'

import { useMemo } from 'react'
import type { Bill } from '@/types/database'
import type { CrisisReason } from '@/types/app'

interface UseCrisisModeParams {
  cashAmount: number
  bills: Bill[]
  crisisModeFlag?: boolean
}

export function useCrisisMode({ cashAmount, bills, crisisModeFlag = false }: UseCrisisModeParams) {
  const result = useMemo(() => {
    const reasons: CrisisReason[] = []

    if (cashAmount < 500) {
      reasons.push('cash_below_500')
    }

    const hasOverdueRent = bills.some(
      b => b.category === 'rent' && b.status === 'overdue'
    )
    if (hasOverdueRent) {
      reasons.push('rent_overdue')
    }

    if (crisisModeFlag) {
      reasons.push('crisis_mode_flag')
    }

    if (reasons.length >= 2) {
      reasons.push('multiple_threats')
    }

    return {
      isCrisis: reasons.length > 0,
      reasons,
      cashAmount,
    }
  }, [cashAmount, bills, crisisModeFlag])

  return result
}
