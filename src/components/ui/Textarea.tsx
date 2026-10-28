import { forwardRef, type TextareaHTMLAttributes } from 'react'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-lg border border-cellar-700/30 bg-white px-4 py-2.5 text-cellar-900 outline-none focus:border-wine-700 ${className}`}
        {...props}
      />
    )
  },
)
