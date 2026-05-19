import { clsx } from 'clsx'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs text-text-secondary uppercase tracking-widest">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5',
            'text-text-primary text-sm placeholder:text-text-muted',
            'focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_1px_rgba(212,175,122,0.2)]',
            'transition-all duration-200',
            error && 'border-crisis focus:border-crisis',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-crisis">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs text-text-secondary uppercase tracking-widest">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            'w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5',
            'text-text-primary text-sm',
            'focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_1px_rgba(212,175,122,0.2)]',
            'transition-all duration-200 appearance-none',
            error && 'border-crisis',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-surface">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-crisis">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs text-text-secondary uppercase tracking-widest">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={3}
          className={clsx(
            'w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5',
            'text-text-primary text-sm placeholder:text-text-muted resize-none',
            'focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_1px_rgba(212,175,122,0.2)]',
            'transition-all duration-200',
            error && 'border-crisis',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-crisis">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
