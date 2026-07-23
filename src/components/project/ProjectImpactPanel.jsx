import { useEffect, useState } from 'react'
import { BarChart3, Plus, Target, Trash2, X } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import { useToast } from '../feedback/ToastProvider'
import Button from '../ui/Button'
import Card from '../ui/Card'

function normalizeList(payload) {
  const data = payload?.data || payload
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

function todayValue() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function errorMessage(error, fallback) {
  const data = error?.response?.data
  const nested = data && typeof data === 'object'
    ? Object.values(data).flat(3).find((value) => typeof value === 'string')
    : null
  return data?.message || data?.detail || nested || fallback
}

function ProjectImpactPanel({ projectId }) {
  const { showToast } = useToast()
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMetricForm, setShowMetricForm] = useState(false)
  const [activeMetricId, setActiveMetricId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [metricForm, setMetricForm] = useState({
    name: '',
    unit: '',
    target_value: '',
    description: '',
  })
  const [recordForm, setRecordForm] = useState({
    value: '',
    recorded_at: todayValue(),
    note: '',
  })

  async function loadMetrics() {
    const response = await api.get(endpoints.projectImpactMetrics, {
      params: { project: projectId },
    })
    setMetrics(normalizeList(response.data))
  }

  useEffect(() => {
    let active = true

    async function initialize() {
      try {
        setLoading(true)
        const response = await api.get(endpoints.projectImpactMetrics, {
          params: { project: projectId },
        })
        if (active) setMetrics(normalizeList(response.data))
      } catch (error) {
        if (active) {
          showToast({ type: 'error', message: errorMessage(error, 'Impact metrics could not be loaded.') })
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    initialize()
    return () => {
      active = false
    }
  }, [projectId])

  async function createMetric(event) {
    event.preventDefault()
    try {
      setSaving(true)
      await api.post(endpoints.projectImpactMetrics, {
        project: Number(projectId),
        ...metricForm,
      })
      await loadMetrics()
      setMetricForm({ name: '', unit: '', target_value: '', description: '' })
      setShowMetricForm(false)
      showToast({ type: 'success', message: 'Impact metric created.' })
    } catch (error) {
      showToast({ type: 'error', message: errorMessage(error, 'Impact metric could not be created.') })
    } finally {
      setSaving(false)
    }
  }

  async function createRecord(event) {
    event.preventDefault()
    try {
      setSaving(true)
      await api.post(endpoints.projectImpactRecords, {
        metric: activeMetricId,
        ...recordForm,
      })
      await loadMetrics()
      setRecordForm({ value: '', recorded_at: todayValue(), note: '' })
      setActiveMetricId(null)
      showToast({ type: 'success', message: 'Impact measurement recorded.' })
    } catch (error) {
      showToast({ type: 'error', message: errorMessage(error, 'Measurement could not be recorded.') })
    } finally {
      setSaving(false)
    }
  }

  async function deleteMetric(metric) {
    if (!window.confirm(`Delete the “${metric.name}” metric and its history?`)) return
    try {
      await api.delete(endpoints.projectImpactMetricDetails(metric.id))
      await loadMetrics()
      showToast({ type: 'success', message: 'Impact metric deleted.' })
    } catch (error) {
      showToast({ type: 'error', message: errorMessage(error, 'Metric could not be deleted.') })
    }
  }

  async function deleteRecord(recordId) {
    if (!window.confirm('Delete this impact measurement?')) return
    try {
      await api.delete(endpoints.projectImpactRecordDetails(recordId))
      await loadMetrics()
      showToast({ type: 'success', message: 'Impact measurement deleted.' })
    } catch (error) {
      showToast({ type: 'error', message: errorMessage(error, 'Measurement could not be deleted.') })
    }
  }

  if (loading) {
    return <Card className="p-5 text-xs text-gray-500">Loading impact monitoring...</Card>
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Impact Monitoring</h2>
            <p className="mt-1 text-xs text-gray-500">Track cumulative outcomes against clear targets.</p>
          </div>
          <Button className="px-3 py-2 text-xs" onClick={() => setShowMetricForm(true)}>
            <Plus size={13} className="mr-1.5" /> New Metric
          </Button>
        </div>

        {metrics.length === 0 ? (
          <div className="mt-4 bg-[#F8F8F6] p-5 text-center text-xs text-gray-500">
            Add the first measurable outcome for this project.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {metrics.map((metric) => {
              const progress = Number(metric.progress_percentage || 0)
              return (
                <div key={metric.id} className="border border-gray-200 bg-[#FCFCFB] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{metric.name}</p>
                      <p className="mt-1 text-[11px] text-gray-500">{metric.description || 'No description provided.'}</p>
                    </div>
                    <button type="button" onClick={() => deleteMetric(metric)} className="text-red-700" aria-label="Delete metric">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Current</p>
                      <p className="text-lg font-bold text-gray-900">{Number(metric.current_value)} <span className="text-xs font-medium text-gray-500">{metric.unit}</span></p>
                    </div>
                    <p className="text-xs font-semibold text-green-800">{progress.toFixed(1)}%</p>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200">
                    <div className="h-2 bg-green-700" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <p className="mt-1.5 text-[10px] text-gray-500">Target: {Number(metric.target_value)} {metric.unit}</p>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-[10px] text-gray-500">{metric.records?.length || 0} recent measurements</span>
                    <button
                      type="button"
                      onClick={() => setActiveMetricId(metric.id)}
                      className="text-[11px] font-semibold text-green-800"
                    >
                      Record progress
                    </button>
                  </div>

                  {metric.records?.length > 0 ? (
                    <div className="mt-2 divide-y divide-gray-100">
                      {metric.records.slice(0, 3).map((record) => (
                        <div key={record.id} className="flex items-center justify-between gap-3 py-1.5 text-[10px]">
                          <span className="text-gray-500">{record.recorded_at}</span>
                          <span className="font-semibold text-gray-800">{Number(record.value)} {metric.unit}</span>
                          <button type="button" onClick={() => deleteRecord(record.id)} className="text-red-700">Remove</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {showMetricForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-lg p-5">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-gray-900">New Impact Metric</h3><button type="button" onClick={() => setShowMetricForm(false)}><X size={16} /></button></div>
            <form onSubmit={createMetric} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input required placeholder="Metric name" value={metricForm.name} onChange={(event) => setMetricForm((current) => ({ ...current, name: event.target.value }))} className="h-9 border border-gray-200 px-3 text-xs outline-none focus:border-green-700" />
              <input required placeholder="Unit, e.g. people" value={metricForm.unit} onChange={(event) => setMetricForm((current) => ({ ...current, unit: event.target.value }))} className="h-9 border border-gray-200 px-3 text-xs outline-none focus:border-green-700" />
              <input required type="number" min="0.01" step="0.01" placeholder="Target value" value={metricForm.target_value} onChange={(event) => setMetricForm((current) => ({ ...current, target_value: event.target.value }))} className="h-9 border border-gray-200 px-3 text-xs outline-none focus:border-green-700 sm:col-span-2" />
              <textarea rows="3" placeholder="What does this metric measure?" value={metricForm.description} onChange={(event) => setMetricForm((current) => ({ ...current, description: event.target.value }))} className="border border-gray-200 px-3 py-2 text-xs outline-none focus:border-green-700 sm:col-span-2" />
              <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" className="px-3 py-2 text-xs" onClick={() => setShowMetricForm(false)}>Cancel</Button><Button type="submit" className="px-3 py-2 text-xs" disabled={saving}><Target size={13} className="mr-1.5" />Create Metric</Button></div>
            </form>
          </Card>
        </div>
      ) : null}

      {activeMetricId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-lg p-5">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-gray-900">Record Progress</h3><button type="button" onClick={() => setActiveMetricId(null)}><X size={16} /></button></div>
            <form onSubmit={createRecord} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input required type="number" min="0" step="0.01" placeholder="Current cumulative value" value={recordForm.value} onChange={(event) => setRecordForm((current) => ({ ...current, value: event.target.value }))} className="h-9 border border-gray-200 px-3 text-xs outline-none focus:border-green-700" />
                <input required type="date" max={todayValue()} value={recordForm.recorded_at} onChange={(event) => setRecordForm((current) => ({ ...current, recorded_at: event.target.value }))} className="h-9 border border-gray-200 px-3 text-xs outline-none focus:border-green-700" />
              </div>
              <textarea rows="3" placeholder="Evidence or observation note" value={recordForm.note} onChange={(event) => setRecordForm((current) => ({ ...current, note: event.target.value }))} className="w-full border border-gray-200 px-3 py-2 text-xs outline-none focus:border-green-700" />
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" className="px-3 py-2 text-xs" onClick={() => setActiveMetricId(null)}>Cancel</Button><Button type="submit" className="px-3 py-2 text-xs" disabled={saving}><BarChart3 size={13} className="mr-1.5" />Save Measurement</Button></div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

export default ProjectImpactPanel
