'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  DollarSign,
  Gem,
  Home,
  Heart,
  BookOpen,
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { label: 'Command', href: '/command', Icon: LayoutDashboard },
  { label: 'Money', href: '/money', Icon: DollarSign },
  { label: 'Noire', href: '/noire', Icon: Gem },
  { label: 'Family', href: '/family', Icon: Home },
  { label: 'Body', href: '/body', Icon: Heart },
  { label: 'Legacy', href: '/legacy', Icon: BookOpen },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border pb-safe">
      <div className="flex items-center justify-around px-1">
        {navItems.map(({ label, href, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2.5 px-1',
                'transition-colors duration-200 relative min-w-0',
                isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full" />
              )}
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[9px] uppercase tracking-wider font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
