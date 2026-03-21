import Card from '../../components/ui/Card'

function DashboardHomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome to the management area.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-gray-500">Total Projects</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500">Total Donations</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500">Beneficiaries</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500">Subscribers</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </Card>
      </div>
    </div>
  )
}

export default DashboardHomePage