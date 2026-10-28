import { forwardRef, type InputHTMLAttributes } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`min-h-11 w-full rounded-lg border border-cellar-700/30 bg-white px-4 py-2.5 text-cellar-900 outline-none focus:border-wine-700 ${className}`}
        {...props}
      />
    )
  },
)
