function LoadingState({ text = 'Loading...' }) {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-white px-6 py-14 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />
      <p className="mt-4 text-sm text-gray-600">{text}</p>
    </div>
  )
}

export default LoadingState