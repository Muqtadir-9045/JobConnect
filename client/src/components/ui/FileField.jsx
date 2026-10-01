import { useId, useRef } from 'react'
import Button from './Button'

export default function FileField({ label, hint, error, accept, fileName, onChange, disabled, className }) {
  const id = useId()
  const inputRef = useRef(null)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled}>
          Choose file
        </Button>
        <span className="min-w-0 flex-1 truncate text-sm text-slate-600">{fileName || 'No file chosen'}</span>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="sr-only"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
