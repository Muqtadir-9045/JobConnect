import { cn } from '../../utils/cn'

export default function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6', className)} {...props}>
      {children}
    </div>
  )
}
