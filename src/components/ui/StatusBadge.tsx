import { clsx } from 'clsx'

type StatusVariant =
  | 'overdue' | 'pending' | 'paid' | 'partial' | 'deferred'
  | 'active' | 'negotiating'
  | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn' | 'follow-up'
  | 'researching' | 'approved' | 'denied' | 'enrolled' | 'closed'
  | 'open' | 'in-progress' | 'pending-landlord' | 'resolved'
  | 'new' | 'warm' | 'hot' | 'lost'
  | 'planning' | 'paused' | 'complete'
  | 'sold-out' | 'discontinued' | 'sample'
  | 'critical' | 'high' | 'medium' | 'low'
  | string

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

const statusConfig: Record<string, { bg: string; text: string; label?: string }> = {
  overdue: { bg: 'bg-crisis/20', text: 'text-crisis', label: 'Overdue' },
  pending: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'Pending' },
  paid: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Paid' },
  partial: { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'Partial' },
  deferred: { bg: 'bg-text-muted/20', text: 'text-text-muted', label: 'Deferred' },
  active: { bg: 'bg-accent/15', text: 'text-accent', label: 'Active' },
  negotiating: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Negotiating' },
  applied: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Applied' },
  screening: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'Screening' },
  interview: { bg: 'bg-accent/15', text: 'text-accent', label: 'Interview' },
  offer: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Offer' },
  rejected: { bg: 'bg-crisis/20', text: 'text-crisis', label: 'Rejected' },
  withdrawn: { bg: 'bg-text-muted/20', text: 'text-text-muted', label: 'Withdrawn' },
  'follow-up': { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'Follow-up' },
  researching: { bg: 'bg-text-secondary/20', text: 'text-text-secondary', label: 'Researching' },
  approved: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Approved' },
  denied: { bg: 'bg-crisis/20', text: 'text-crisis', label: 'Denied' },
  enrolled: { bg: 'bg-accent/15', text: 'text-accent', label: 'Enrolled' },
  closed: { bg: 'bg-text-muted/20', text: 'text-text-muted', label: 'Closed' },
  open: { bg: 'bg-crisis/20', text: 'text-crisis', label: 'Open' },
  'in-progress': { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'In Progress' },
  'pending-landlord': { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'Pending Landlord' },
  resolved: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Resolved' },
  new: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'New' },
  warm: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'Warm' },
  hot: { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'Hot' },
  lost: { bg: 'bg-text-muted/20', text: 'text-text-muted', label: 'Lost' },
  planning: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Planning' },
  paused: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'Paused' },
  complete: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Complete' },
  'sold-out': { bg: 'bg-crisis/20', text: 'text-crisis', label: 'Sold Out' },
  discontinued: { bg: 'bg-text-muted/20', text: 'text-text-muted', label: 'Discontinued' },
  sample: { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'Sample' },
  critical: { bg: 'bg-crisis/20', text: 'text-crisis', label: 'Critical' },
  high: { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'High' },
  medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'Medium' },
  low: { bg: 'bg-text-muted/20', text: 'text-text-muted', label: 'Low' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: 'bg-text-muted/20', text: 'text-text-secondary' }
  const label = config.label || status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide uppercase',
        config.bg,
        config.text,
        className
      )}
    >
      {label}
    </span>
  )
}
