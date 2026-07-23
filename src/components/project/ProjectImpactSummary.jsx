import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'

import endpoints from '../../api/endpoints'
import publicApi from '../../api/publicApi'

function normalizeList(payload) {
  const data = payload?.data || payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

function ProjectImpactSummary({ projectId }) {
  const [metrics, setMetrics] = useState([])

  useEffect(() => {
    let active = true

    publicApi
      .get(endpoints.projectImpactMetrics, { params: { project: projectId, is_active: true } })
      .then((response) => {
        if (active) setMetrics(normalizeList(response.data))
      })
      .catch(() => {
        if (active) setMetrics([])
      })

    return () => {
      active = false
    }
  }, [projectId])

  if (metrics.length === 0) return null

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2">
        <Activity size={17} className="text-green-700" />
        <h2 className="text-xl font-bold text-gray-900">Measured Impact</h2>
      </div>
      <p className="mt-1 text-xs text-gray-500">Latest recorded outcomes against project targets.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => {
          const progress = Number(metric.progress_percentage || 0)
          return (
            <div key={metric.id} className="border border-gray-200 bg-[#FCFCFB] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{metric.name}</h3>
                  <p className="mt-1 text-[11px] leading-5 text-gray-500">{metric.description || 'Measured project outcome.'}</p>
                </div>
                <span className="text-xs font-bold text-green-800">{progress.toFixed(1)}%</span>
              </div>

              <p className="mt-3 text-lg font-bold text-gray-900">
                {Number(metric.current_value)} <span className="text-xs font-medium text-gray-500">{metric.unit}</span>
              </p>
              <div className="mt-2 h-2 bg-gray-200">
                <div className="h-2 bg-green-700" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <p className="mt-1.5 text-[10px] text-gray-500">Target: {Number(metric.target_value)} {metric.unit}</p>

              {metric.records?.length > 0 ? (
                <div className="mt-3 divide-y divide-gray-100 border-t border-gray-100">
                  {metric.records.slice(0, 3).map((record) => (
                    <div key={record.id} className="flex items-center justify-between gap-3 py-2 text-[10px]">
                      <span className="text-gray-500">{record.recorded_at}</span>
                      <span className="font-semibold text-gray-800">{Number(record.value)} {metric.unit}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default ProjectImpactSummary
