import { Navigation } from '@/components/layout/Navigation'
import { PlusButton } from '@/components/layout/PlusButton'
import { CommandBar } from '@/components/layout/CommandBar'

const IS_DEMO =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#080808] min-h-dvh">
      <CommandBar isDemoMode={IS_DEMO} />
      <main className="page-content">
        {children}
      </main>
      <Navigation />
      <PlusButton />
    </div>
  )
}
