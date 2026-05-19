'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { CrisisReason } from '@/types/app'

interface CrisModeProps {
  isCrisis: boolean
  reasons: CrisisReason[]
}

const reasonLabels: Record<CrisisReason, string> = {
  cash_below_500: 'Cash below survival threshold',
  rent_overdue: 'Rent is overdue',
  crisis_mode_flag: 'Crisis mode enabled',
  multiple_threats: 'Multiple active threats',
}

export function CrisisBanner({ isCrisis, reasons }: CrisModeProps) {
  const uniqueReasons = reasons.filter(r => r !== 'multiple_threats')

  return (
    <AnimatePresence>
      {isCrisis && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-crisis/20 border-b border-crisis/40 px-4 py-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-crisis flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-crisis text-xs font-medium uppercase tracking-widest">Crisis Mode Active</span>
              <div className="flex flex-wrap gap-x-3 mt-0.5">
                {uniqueReasons.map(r => (
                  <span key={r} className="text-crisis/70 text-[10px]">{reasonLabels[r]}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
