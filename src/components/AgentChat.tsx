'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'

interface Agent {
  code: string
  title: string
  domain: string
  color: string
}

interface Message {
  role: 'user' | 'agent'
  text: string
}

interface Props {
  agent: Agent | null
  onClose: () => void
}

export function AgentChat({ agent, onClose }: Props) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (agent) {
      setMessages([{
        role: 'agent',
        text: `${agent.code} online. My jurisdiction: ${agent.domain}. What do you need?`,
      }])
    }
  }, [agent])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading || !agent) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)
    try {
      const res = await fetch('/api/alfred', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          directive: userMsg,
          agentContext: `You are ${agent.code} — ${agent.title}. Your domain: ${agent.domain}. Stay strictly within your jurisdiction. Do not answer questions outside your domain. Refer to other agents when appropriate.`,
        }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'agent', text: data.response || 'No response.' }])
    } catch {
      setMessages(m => [...m, { role: 'agent', text: 'Temporarily unavailable.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send()
  }

  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex flex-col"
          style={{ background: 'rgba(2,2,2,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: agent.color, boxShadow: `0 0 8px ${agent.color}`,
                }}
              />
              <div>
                <p style={{ color: agent.color, fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }}>
                  {agent.code}
                </p>
                <p style={{ color: '#444', fontSize: '10px', letterSpacing: '0.08em' }}>
                  {agent.domain}
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ color: '#444', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '12px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? '#1a1a1a' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.06)' : `${agent.color}22`}`,
                    color: '#f0ede8',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {msg.role === 'agent' && (
                    <p style={{ color: agent.color, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      {agent.code}
                    </p>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    border: `1px solid ${agent.color}22`,
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      style={{ width: '5px', height: '5px', borderRadius: '50%', background: agent.color }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="px-4 py-4 flex-shrink-0 flex gap-3 items-end"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Ask ${agent.code}...`}
              rows={2}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                color: '#f0ede8',
                fontSize: '14px',
                padding: '10px 14px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'Georgia, serif',
                lineHeight: '1.5',
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: input.trim() ? agent.color : '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <Send size={15} color={input.trim() ? '#020202' : '#333'} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
