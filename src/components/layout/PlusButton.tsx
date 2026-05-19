'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const quickAddOptions = [
  { label: 'Cash Update', category: 'finance', href: '/money?add=cash' },
  { label: 'Add Bill', category: 'finance', href: '/money?add=bill' },
  { label: 'Add Debt', category: 'finance', href: '/money?add=debt' },
  { label: 'Job Application', category: 'income', href: '/income?add=application' },
  { label: 'Income Source', category: 'income', href: '/income?add=income' },
  { label: 'Assistance Update', category: 'income', href: '/income?add=assistance' },
  { label: 'Noire Lead', category: 'noire', href: '/noire?add=lead' },
  { label: 'Noire Sale', category: 'noire', href: '/noire?add=sale' },
  { label: 'Upload Artifact', category: 'artifacts', href: '/artifacts?add=artifact' },
  { label: 'Home Issue', category: 'home', href: '/family?add=issue' },
  { label: 'Add Thought', category: 'legacy', href: '/legacy?add=entry' },
  { label: 'Daily Check-in', category: 'wellness', href: '/body?add=checkin' },
]

const categoryOrder = ['finance', 'income', 'noire', 'artifacts', 'home', 'legacy', 'wellness']
const categoryLabels: Record<string, string> = {
  finance: 'Finance',
  income: 'Income',
  noire: 'Noire',
  artifacts: 'Artifacts',
  home: 'Home',
  legacy: 'Legacy',
  wellness: 'Wellness',
}

export function PlusButton() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const grouped = categoryOrder.reduce<Record<string, typeof quickAddOptions>>((acc, cat) => {
    acc[cat] = quickAddOptions.filter(o => o.category === cat)
    return acc
  }, {})

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4"
            >
              <div className="bg-surface border border-border rounded-2xl shadow-2xl max-h-[70vh] overflow-y-auto">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <span className="text-text-primary font-medium text-sm uppercase tracking-widest">Quick Add</span>
                  <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  {categoryOrder.map(cat => (
                    <div key={cat}>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">{categoryLabels[cat]}</p>
                      <div className="flex flex-wrap gap-2">
                        {grouped[cat]?.map(opt => (
                          <button
                            key={opt.href}
                            onClick={() => {
                              setIsOpen(false)
                              router.push(opt.href)
                            }}
                            className="px-3 py-1.5 bg-surface-2 border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all duration-150"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[72px] left-1/2 -translate-x-1/2 z-50 w-12 h-12 rounded-full bg-accent text-background flex items-center justify-center shadow-lg hover:bg-accent/90 transition-all duration-200"
        style={{ boxShadow: '0 0 20px rgba(212,175,122,0.4)' }}
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus size={22} strokeWidth={2.5} />
        </motion.div>
      </button>
    </>
  )
}
