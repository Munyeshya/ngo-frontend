function SectionTitle({ badge, title, text, center = false }) {
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {badge ? (
        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          {badge}
        </span>
      ) : null}

      <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h2>

      {text ? <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">{text}</p> : null}
    </div>
  )
}

export default SectionTitle