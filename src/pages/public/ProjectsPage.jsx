import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

function ProjectsPage() {
  const projects = [
    {
      id: 1,
      title: 'Community Health Support',
      description: 'Help fund essential health programs for vulnerable families.',
      progress: 65,
    },
    {
      id: 2,
      title: 'School Materials Drive',
      description: 'Provide books, bags, and supplies for students in need.',
      progress: 42,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="mt-2 text-gray-600">Browse active causes and support the work that matters most.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="p-6">
            <h2 className="text-xl font-semibold text-gray-900">{project.title}</h2>
            <p className="mt-3 text-sm text-gray-600">{project.description}</p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-semibold text-green-800">{project.progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-200">
                <div
                  className="h-2.5 rounded-full bg-green-800"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-6">
              <Button className="w-full">View Project</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ProjectsPage