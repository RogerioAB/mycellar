import { forwardRef, type SelectHTMLAttributes } from 'react'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = '', ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`min-h-11 w-full rounded-lg border border-cellar-700/30 bg-white px-4 py-2.5 text-cellar-900 outline-none focus:border-wine-700 ${className}`}
        {...props}
      />
    )
  },
)
