function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Unauthorized</h1>
        <p className="mt-3 text-gray-600">You do not have permission to access this page.</p>
      </div>
    </div>
  )
}

export default UnauthorizedPage