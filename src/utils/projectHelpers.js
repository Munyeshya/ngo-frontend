export function formatCurrency(value) {
  const amount = Number(value || 0)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getProjectImage(project) {
  return (
    project.feature_image ||
    project.image ||
    'https://images.unsplash.com/photo-1593113598332-cd59a93d7c2b?auto=format&fit=crop&w=1200&q=80'
  )
}

export function getProjectProgress(project) {
  const value =
    project.funding_percentage ??
    project.progress ??
    0

  const progress = Number(value)

  if (Number.isNaN(progress)) return 0
  if (progress < 0) return 0
  if (progress > 100) return 100

  return progress
}

export function getProjectRaised(project) {
  return formatCurrency(project.total_donated ?? project.raised ?? 0)
}

export function getProjectGoal(project) {
  return formatCurrency(project.target_amount ?? project.goal ?? 0)
}

export function getProjectSlugOrId(project) {
  return project.slug || project.id
}

export function getProjectStatusLabel(project) {
  if (project.is_goal_reached) return 'Goal Reached'
  if (project.status) return String(project.status).replace(/_/g, ' ')
  return 'Active'
}