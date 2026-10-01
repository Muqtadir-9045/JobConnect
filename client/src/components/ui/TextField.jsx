import { useId } from 'react'
import { cn } from '../../utils/cn'

export default function TextField({ label, hint, error, multiline = false, options, className, ...props }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const controlProps = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    className: cn(
      'block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-base text-slate-900 ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm',
      multiline && 'resize-y',
      error ? 'ring-red-500 focus:ring-red-600' : 'ring-slate-300 focus:ring-brand-600',
    ),
    ...props,
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {options ? (
        <select {...controlProps}>
          {options.map(({ value, label: optionLabel }) => (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea {...controlProps} />
      ) : (
        <input {...controlProps} />
      )}
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
