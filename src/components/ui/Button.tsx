import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-wine-700 text-white hover:bg-wine-600 disabled:bg-wine-700/40',
  secondary: 'border border-wine-700 text-wine-700 hover:bg-wine-50 disabled:opacity-40',
  ghost: 'text-wine-700 hover:bg-wine-50 disabled:opacity-40',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`min-h-11 rounded-lg px-5 py-2.5 font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
