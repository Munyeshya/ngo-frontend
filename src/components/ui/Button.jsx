function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200'

  const variants = {
    primary: 'bg-green-800 text-white hover:bg-green-900',
    secondary: 'border border-green-200 bg-green-50 text-green-800 hover:bg-green-100',
    outline: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
    accent: 'bg-white text-black hover:bg-green-50',
    dark: 'bg-[#0B0F0C] text-white hover:bg-black',
    darkOutline: 'border border-white/15 bg-white/5 text-white hover:bg-white/10',
    danger: 'bg-red-600 text-white hover:bg-red-700',
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