import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

function LoginPage() {
  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
      <p className="mt-2 text-sm text-gray-600">Login to continue to your account.</p>

      <form className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none ring-0 transition focus:border-green-700"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none ring-0 transition focus:border-green-700"
          />
        </div>

        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </Card>
  )
}

export default LoginPage