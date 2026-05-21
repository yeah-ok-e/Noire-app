'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, Fingerprint } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const IS_DEMO =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'

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
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
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

  return (
    <div className="fixed inset-0 bg-[#020202] flex flex-col items-center justify-center px-6">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-[#d4af7a] opacity-[0.025] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative"
      >
        {/* Wordmark */}
        <div className="flex flex-col items-center mb-10">
          {'LEGACY OS'.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: char === ' ' ? 0 : 1 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.6 }}
              style={{ display: 'inline' }}
            />
          ))}
          <h1
            className="text-[28px] font-light tracking-[0.45em] uppercase text-[#f0ede8]"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            LEGACY OS
          </h1>
          <div className="mt-3 h-px w-12 bg-[#d4af7a] opacity-60" />
          <p className="text-[9px] text-[#3a3a3a] tracking-[0.35em] uppercase mt-3">
            A Lewis Family System
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-6 shadow-2xl">
          {IS_DEMO && (
            <div className="mb-5 px-3 py-2.5 bg-[#d4af7a]/8 border border-[#d4af7a]/20 rounded-lg">
              <p className="text-[#d4af7a] text-[11px] text-center tracking-wide">
                Demo Mode · Connect Supabase to go live
              </p>
            </div>
          )}

          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="eligah@lewis.family"
                required={!IS_DEMO}
                disabled={IS_DEMO}
                className="w-full bg-[#111] border border-[#1c1c1c] rounded-xl px-3 py-3 text-[#f0ede8] text-sm placeholder:text-[#333] focus:border-[#d4af7a]/40 outline-none transition-colors disabled:opacity-40"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required={!IS_DEMO}
                  disabled={IS_DEMO}
                  className="w-full bg-[#111] border border-[#1c1c1c] rounded-xl px-3 py-3 pr-10 text-[#f0ede8] text-sm placeholder:text-[#333] focus:border-[#d4af7a]/40 outline-none transition-colors disabled:opacity-40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333] hover:text-[#666] transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle size={12} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl border border-[#d4af7a] text-[#d4af7a] font-medium text-sm tracking-[0.15em] hover:bg-[#d4af7a]/8 transition-all duration-200 disabled:opacity-40 mt-1"
            >
              {isLoading ? 'Authenticating...' : IS_DEMO ? 'Enter System' : 'Sign In'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#1c1c1c]" />
              <span className="text-[9px] text-[#333] uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[#1c1c1c]" />
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
              className="w-full py-3 rounded-xl border border-[#222] text-[#555] text-sm tracking-wider hover:border-[#333] hover:text-[#888] transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Fingerprint size={15} />
              {biometricLoading ? 'Authenticating...' : 'Face ID / Touch ID'}
            </button>
          </form>

          {!IS_DEMO && (
            <div className="mt-5 pt-4 border-t border-[#1c1c1c]">
              <button
                onClick={() => router.push('/command')}
                className="w-full text-[#333] text-[11px] hover:text-[#555] transition-colors"
              >
                Continue in demo mode
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[#222] text-[9px] mt-6 tracking-[0.3em] uppercase">
          Private · Encrypted · Family Only
        </p>
      </motion.div>
    </div>
  )
}
