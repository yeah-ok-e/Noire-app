'use client'

import { useState } from 'react'
import { Input, Select, Textarea } from './Input'
import type { FormField } from '@/types/app'

interface QuickAddFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, string | number | boolean>) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isLoading?: boolean
}

export function QuickAddForm({ fields, onSubmit, onCancel, submitLabel = 'Add', isLoading = false }: QuickAddFormProps) {
  const [values, setValues] = useState<Record<string, string | number | boolean>>(() => {
    const defaults: Record<string, string | number | boolean> = {}
    fields.forEach(f => {
      if (f.defaultValue !== undefined) defaults[f.name] = f.defaultValue
      else if (f.type === 'checkbox') defaults[f.name] = false
      else defaults[f.name] = ''
    })
    return defaults
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    fields.forEach(f => {
      if (f.required && !values[f.name] && values[f.name] !== 0) {
        newErrors[f.name] = `${f.label} is required`
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(values)
  }

  const handleChange = (name: string, value: string | number | boolean) => {
    setValues(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {fields.map(field => {
        if (field.type === 'select' && field.options) {
          return (
            <Select
              key={field.name}
              label={field.label}
              options={field.options}
              placeholder={field.placeholder}
              value={String(values[field.name] ?? '')}
              onChange={e => handleChange(field.name, e.target.value)}
              error={errors[field.name]}
            />
          )
        }
        if (field.type === 'textarea') {
          return (
            <Textarea
              key={field.name}
              label={field.label}
              placeholder={field.placeholder}
              value={String(values[field.name] ?? '')}
              onChange={e => handleChange(field.name, e.target.value)}
              error={errors[field.name]}
            />
          )
        }
        if (field.type === 'checkbox') {
          return (
            <label key={field.name} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(values[field.name])}
                onChange={e => handleChange(field.name, e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-sm text-text-secondary">{field.label}</span>
            </label>
          )
        }
        return (
          <Input
            key={field.name}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            value={String(values[field.name] ?? '')}
            onChange={e => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
            error={errors[field.name]}
          />
        )
      })}

      <div className="flex gap-3 mt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary text-sm hover:bg-surface-2 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-lg border border-accent text-accent text-sm font-medium hover:bg-accent/10 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
