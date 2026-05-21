'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Paperclip, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { CaptureType } from './FloatMenu'

interface Props {
  type: CaptureType | null
  onClose: () => void
}

const TITLES: Record<CaptureType, string> = {
  cash: 'Cash Update',
  bill: 'Add Bill',
  journal: 'Journal Entry',
  checkin: 'Daily Check-in',
  lead: 'Noire Lead',
  artifact: 'Upload Artifact',
}

const PLACEHOLDERS: Record<CaptureType, string> = {
  cash: 'Source, context, what this means...',
  bill: 'Who, why, urgency...',
  journal: 'What happened. What you felt. What you built.',
  checkin: 'Energy, sleep, what moved today...',
  lead: 'Who they are, where they found you...',
  artifact: 'What this is, why it matters...',
}

const inputBase: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  color: '#f0ede8',
  fontSize: '15px',
  padding: '8px 0',
  outline: 'none',
  fontFamily: 'Georgia, serif',
}

export function CaptureModal({ type, onClose }: Props) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setName(''); setAmount(''); setNote(''); setFileName(null); setDone(false)
  }

  async function handleSubmit() {
    if (!type) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        if (type === 'cash') {
          await supabase.from('cash_updates').insert({
            user_id: user.id,
            amount: parseFloat(amount) || 0,
            note,
            source: 'manual',
          })
        } else if (type === 'bill') {
          await supabase.from('bills').insert({
            user_id: user.id,
            name: name || 'Untitled',
            amount: parseFloat(amount) || null,
            status: 'pending',
          })
        } else if (type === 'journal') {
          await supabase.from('journal_entries').insert({
            user_id: user.id,
            title: name || null,
            content: note || '—',
            is_private: true,
          })
        } else if (type === 'checkin') {
          await supabase.from('body_logs').insert({
            user_id: user.id,
            notes: note,
            log_date: new Date().toISOString().split('T')[0],
          })
        } else if (type === 'lead') {
          await supabase.from('noire_leads').insert({
            user_id: user.id,
            name: name || 'Unknown',
            value: parseFloat(amount) || null,
            notes: note,
            status: 'prospect',
          })
        }
      }
      setDone(true)
      setTimeout(() => { reset(); onClose() }, 1400)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const showName = type === 'bill' || type === 'journal' || type === 'lead' || type === 'artifact'
  const showAmount = type === 'cash' || type === 'bill' || type === 'lead'

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex flex-col justify-end"
          style={{ background: 'rgba(2,2,2,0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              background: 'rgba(8,8,8,0.99)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px 20px 0 0',
              maxHeight: '88vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span style={{ color: '#d4af7a', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>
                {type && TITLES[type]}
              </span>
              <button onClick={() => { reset(); onClose() }} style={{ color: '#444', padding: '4px' }}>
                <X size={16} />
              </button>
            </div>

            {done ? (
              <div className="flex flex-col items-center justify-center p-12 gap-3">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  style={{ color: '#d4af7a', fontSize: '32px' }}
                >
                  ✓
                </motion.div>
                <p style={{ color: '#666', fontSize: '13px', fontFamily: 'Georgia, serif' }}>Logged to system</p>
              </div>
            ) : (
              <div className="p-5 flex flex-col gap-5">
                {showName && (
                  <div>
                    <label style={{ display: 'block', color: '#444', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      {type === 'journal' ? 'Title (optional)' : type === 'bill' ? 'Bill name' : type === 'lead' ? 'Name / Business' : 'Document name'}
                    </label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={type === 'journal' ? 'Today in the Pressure Era...' : ''}
                      style={inputBase}
                    />
                  </div>
                )}

                {showAmount && (
                  <div>
                    <label style={{ display: 'block', color: '#444', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      {type === 'cash' ? 'Amount ($)' : type === 'bill' ? 'Amount due ($)' : 'Est. value ($)'}
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      style={{ ...inputBase, color: '#d4af7a', fontSize: '26px', fontFamily: 'inherit' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', color: '#444', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {type === 'journal' || type === 'checkin' ? 'Entry' : 'Note / Context'}
                  </label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder={type ? PLACEHOLDERS[type] : ''}
                    rows={5}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                      color: '#f0ede8',
                      fontSize: '14px',
                      padding: '12px',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'Georgia, serif',
                      lineHeight: '1.65',
                    }}
                  />
                </div>

                {/* Attachment */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '8px',
                      color: fileName ? '#d4af7a' : '#444',
                      fontSize: '11px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Paperclip size={12} />
                    <span>{fileName ? fileName.slice(0, 20) + (fileName.length > 20 ? '…' : '') : 'Attach'}</span>
                  </button>
                  <input ref={fileRef} type="file" className="hidden" onChange={e => setFileName(e.target.files?.[0]?.name ?? null)} />
                  <span style={{ color: '#2a2a2a', fontSize: '10px' }}>Receipt · Doc · Photo</span>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '15px',
                    background: '#d4af7a',
                    borderRadius: '12px',
                    color: '#020202',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                    border: 'none',
                    marginBottom: '8px',
                  }}
                >
                  <Send size={13} />
                  {submitting ? 'Saving...' : 'Log to System'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
