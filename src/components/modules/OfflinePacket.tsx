'use client'

import { useState } from 'react'
import { Download, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import type { OfflineCacheData } from '@/lib/hooks/useOffline'

interface OfflinePacketProps {
  offlineData: OfflineCacheData | null
  isOffline: boolean
  lastSynced: string | null
  onRefresh?: () => void
}

export function OfflinePacket({ offlineData, isOffline, lastSynced, onRefresh }: OfflinePacketProps) {
  const [isOpen, setIsOpen] = useState(false)

  const data = offlineData || {
    cashOnHand: 234,
    overdueItems: [
      { name: 'Rent', amount: 1100, type: 'rent' },
    ],
    debts: [
      { creditor: 'Dana', amount: 100 },
      { creditor: 'Reggie', amount: 100 },
      { creditor: 'Mary', amount: 60 },
    ],
    emergencyContacts: [],
    nextMoves: [
      'Contact landlord about overdue rent',
      'Certify unemployment on Tuesday',
      'Attend LIHEAP appointment',
    ],
    assistancePrograms: [
      { name: 'LIHEAP', status: 'applied', appointmentDate: new Date(Date.now() + 2 * 86400000).toISOString() },
      { name: 'Township Emergency', status: 'applied' },
    ],
    lastSynced: lastSynced || new Date().toISOString(),
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all duration-150 w-full"
      >
        {isOffline ? <WifiOff size={14} className="text-crisis" /> : <Download size={14} />}
        <span>Offline Packet</span>
        {lastSynced && (
          <span className="ml-auto text-[10px] text-text-muted">
            {formatDate(lastSynced)}
          </span>
        )}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Offline Survival Packet">
        <div className="space-y-5 print:space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            {isOffline ? (
              <span className="flex items-center gap-1.5 text-crisis text-xs"><WifiOff size={12} />Offline</span>
            ) : (
              <span className="flex items-center gap-1.5 text-green-400 text-xs"><Wifi size={12} />Online</span>
            )}
            {onRefresh && !isOffline && (
              <button onClick={onRefresh} className="ml-auto text-text-muted hover:text-accent transition-colors">
                <RefreshCw size={14} />
              </button>
            )}
          </div>

          {/* Cash */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Cash on Hand</h3>
            <p className="text-2xl font-serif text-text-primary">{formatCurrency(data.cashOnHand)}</p>
          </div>

          {/* Overdue Items */}
          {data.overdueItems.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-crisis mb-2">Overdue</h3>
              <div className="space-y-1">
                {data.overdueItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{item.name}</span>
                    <span className="text-crisis">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Debts */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Active Debts</h3>
            <div className="space-y-1">
              {data.debts.map((debt, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{debt.creditor}</span>
                  <span className="text-text-primary">{formatCurrency(debt.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assistance */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Assistance Programs</h3>
            <div className="space-y-1">
              {data.assistancePrograms.map((prog, i) => (
                <div key={i} className="text-sm">
                  <span className="text-text-secondary">{prog.name}</span>
                  <span className="ml-2 text-accent text-xs">{prog.status}</span>
                  {prog.appointmentDate && (
                    <span className="ml-2 text-text-muted text-xs">{formatDate(prog.appointmentDate)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Next Moves */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Next Moves</h3>
            <ol className="space-y-1.5">
              {data.nextMoves.map((move, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-accent font-medium">{i + 1}.</span>
                  <span className="text-text-secondary">{move}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Emergency Contacts */}
          {data.emergencyContacts.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Emergency Contacts</h3>
              {data.emergencyContacts.map((c, i) => (
                <div key={i} className="text-sm text-text-secondary">
                  {c.name} — {c.relationship} {c.phone && `• ${c.phone}`}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-border">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 rounded-lg border border-accent text-accent text-sm font-medium hover:bg-accent/10 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={14} />
              Save / Print
            </button>
          </div>

          <p className="text-[10px] text-text-muted text-center">
            Last synced: {formatDate(data.lastSynced)}
          </p>
        </div>
      </Modal>
    </>
  )
}
