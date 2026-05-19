'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { clsx } from 'clsx'
import type { CardVariant } from '@/types/app'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: CardVariant
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-surface border border-border',
  threat: 'bg-surface border border-crisis shadow-[0_0_12px_rgba(192,57,43,0.2)]',
  opportunity: 'bg-surface border border-accent shadow-[0_0_12px_rgba(212,175,122,0.15)]',
  glass: 'bg-glow backdrop-blur-sm border border-border/50',
  crisis: 'bg-[rgba(192,57,43,0.1)] border border-crisis',
}

export function Card({ variant = 'default', children, className, hoverable = false, ...props }: CardProps) {
  return (
    <motion.div
      className={clsx(
        'rounded-lg p-4',
        variantStyles[variant],
        hoverable && 'cursor-pointer transition-all duration-200',
        className
      )}
      whileHover={hoverable ? { scale: 1.01, y: -1 } : undefined}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
