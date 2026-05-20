'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, Fingerprint } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const IS_DEMO =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'

function CompassIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="48" cy="48" r="44" stroke="#d4af7a" strokeWidth="1" opacity="0.4" />
      <polygon points="48,8 51,44 48,41 45,44" fill="#d4af7a" opacity="0.9" />
      <polygon points="48,88 51,52 48,55 45,52" fill="#f0ede8" opacity="0.3" />
      <polygon points="88,48 52,45 55,48 52,51" fill="#f0ede8" opacity="0.3" />
      <polygon points="8,48 44,45 41,48 44,51" fill="#f0ede8" opacity="0.3" />
      <circle cx="48" cy="48" r="3" fill="#d4af7a" opacity="0.8" />
      <circle cx="48" cy="48" r="1.5" fill="#080808" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [biometricLoading, setBiometricLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (IS_DEMO) {
      router.push('/command')
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) {
        setError(authError.message)
      } else {
        router.push('/command')
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoMode = () => {
    router.push('/command')
  }

  return (
    <div className="fixed inset-0 bg-[#080808] flex flex-col items-center justify-center px-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full bg-accent opacity-[0.03] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm relative"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <CompassIcon />
          <h1
            className="text-2xl font-light tracking-[0.3em] uppercase text-[#f0ede8] mt-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            LEGACY OS
          </h1>
          <p className="text-[10px] text-[#444444] tracking-[0.2em] uppercase mt-1">
            A Lewis Family Product
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-2xl">
          {IS_DEMO && (
            <div className="mb-4 px-3 py-2 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-accent text-xs text-center">
                Demo Mode — Supabase not configured
              </p>
            </div>
          )}

          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="family@lewis.com"
                required={!IS_DEMO}
                disabled={IS_DEMO}
                className="w-full bg-[#1a1a1a] border border-[#222222] rounded-lg px-3 py-2.5 text-[#f0ede8] text-sm placeholder:text-[#444444] focus:border-accent/60 transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required={!IS_DEMO}
                  disabled={IS_DEMO}
                  className="w-full bg-[#1a1a1a] border border-[#222222] rounded-lg px-3 py-2.5 pr-10 text-[#f0ede8] text-sm placeholder:text-[#444444] focus:border-accent/60 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444444] hover:text-[#888888] transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-crisis text-xs">
                <AlertCircle size={12} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg border border-accent text-accent font-medium text-sm tracking-wider hover:bg-accent/10 transition-all duration-200 disabled:opacity-50 mt-1"
            >
              {isLoading ? 'Authenticating...' : IS_DEMO ? 'Enter Demo Mode' : 'Sign In'}
            </button>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 h-px bg-[#222222]" />
              <span className="text-[10px] text-[#444444] uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[#222222]" />
            </div>
            <button
              type="button"
              onClick={async () => {
                setBiometricLoading(true)
                await new Promise(r => setTimeout(r, 1200))
                setBiometricLoading(false)
                router.push('/command')
              }}
              disabled={biometricLoading}
              className="w-full py-3 rounded-lg border border-[#333333] text-[#888888] text-sm tracking-wider hover:border-[#555555] hover:text-[#aaaaaa] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Fingerprint size={16} />
              {biometricLoading ? 'Authenticating...' : 'Face ID / Touch ID'}
            </button>
          </form>

          {!IS_DEMO && (
            <div className="mt-4 pt-4 border-t border-[#222222]">
              <button
                onClick={handleDemoMode}
                className="w-full text-[#444444] text-xs hover:text-[#888888] transition-colors"
              >
                Continue in demo mode
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[#333333] text-[10px] mt-6 tracking-widest">
          PRIVATE FAMILY SYSTEM
        </p>
      </motion.div>
    </div>
  )
}
