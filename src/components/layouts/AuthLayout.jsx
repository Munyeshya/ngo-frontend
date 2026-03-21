import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout