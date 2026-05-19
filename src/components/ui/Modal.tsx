'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={clsx(
              'fixed bottom-0 left-0 right-0 z-50 md:inset-0 md:flex md:items-center md:justify-center',
            )}
          >
            <div
              className={clsx(
                'bg-surface border border-border rounded-t-2xl md:rounded-2xl w-full md:max-w-lg',
                'shadow-2xl max-h-[90vh] overflow-y-auto',
                className
              )}
              onClick={e => e.stopPropagation()}
            >
              {title && (
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h2 className="text-text-primary font-serif text-lg">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              <div className="p-5">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
