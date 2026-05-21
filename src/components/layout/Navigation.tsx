'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  DollarSign,
  Gem,
  Home,
  BookOpen,
  Bot,
  Radio,
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { label: 'Command', href: '/command', Icon: LayoutDashboard },
  { label: 'Money', href: '/money', Icon: DollarSign },
  { label: 'Noire', href: '/noire', Icon: Gem },
  { label: 'Social', href: '/social', Icon: Radio },
  { label: 'Family', href: '/family', Icon: Home },
  { label: 'Legacy', href: '/legacy', Icon: BookOpen },
  { label: 'Alfred', href: '/alfred', Icon: Bot },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed z-50 rounded-2xl"
      style={{
        bottom: '16px',
        left: '12px',
        right: '12px',
        background: 'rgba(8, 8, 8, 0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04) inset',
      }}
    >
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map(({ label, href, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-0.5 rounded-xl transition-all duration-200 relative min-w-0',
                isActive
                  ? 'text-[#d4af7a]'
                  : 'text-[#555555] hover:text-[#888888]'
              )}
              style={isActive ? { background: 'rgba(212,175,122,0.08)' } : {}}
            >
              <Icon size={17} strokeWidth={isActive ? 2 : 1.5} />
              <span
                className="uppercase font-medium leading-none tracking-wider"
                style={{ fontSize: '7px' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
