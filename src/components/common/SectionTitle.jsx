function SectionTitle({ badge, title, text, center = false, light = false }) {
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {badge ? (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
            light
              ? 'bg-white/10 text-green-200'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {badge}
        </span>
      ) : null}

      <h2
        className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl ${
          light ? 'text-white' : 'text-gray-900'
        }`}
      >
        {title}
      </h2>

      {text ? (
        <p
          className={`mt-4 text-base leading-8 sm:text-lg ${
            light ? 'text-white/70' : 'text-gray-600'
          }`}
        >
          {text}
        </p>
      ) : null}
    </div>
  )
}

export default SectionTitle