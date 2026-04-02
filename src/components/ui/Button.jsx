function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-100 disabled:cursor-not-allowed disabled:opacity-70'

  const variants = {
    primary: 'bg-green-800 text-white shadow-sm hover:bg-green-900',
    secondary: 'border border-green-300 bg-green-50 text-green-900 hover:bg-green-100',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50',
    accent: 'bg-white text-gray-950 shadow-sm hover:bg-green-50',
    dark: 'bg-[#0B0F0C] text-white shadow-sm hover:bg-black',
    darkOutline: 'border border-slate-700 bg-slate-900 text-white hover:border-slate-600 hover:bg-slate-800',
    danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  }

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
