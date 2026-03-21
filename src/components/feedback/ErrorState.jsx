import Button from '../ui/Button'

function ErrorState({
  title = 'Something went wrong',
  message = 'Unable to load data right now.',
  onRetry,
}) {
  return (
    <div className="rounded-[28px] border border-red-200 bg-white px-6 py-14 text-center">
      <p className="text-2xl font-semibold text-gray-900">{title}</p>
      <p className="mt-3 text-sm leading-7 text-gray-600">{message}</p>

      {onRetry ? (
        <div className="mt-6">
          <Button onClick={onRetry}>Try Again</Button>
        </div>
      ) : null}
    </div>
  )
}

export default ErrorState