import { useEffect, useState } from 'react'
import { ArrowLeft, FileText, Printer } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import RichTextContent from '../../components/common/RichTextContent'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function ProjectTransparencyReportPage() {
  const { projectId } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api.get(endpoints.projectTransparencyReport(projectId))
      .then((response) => {
        if (!active) return
        const data = response?.data?.data || response?.data
        setReport(data)
        document.title = `${data?.project?.title || 'Project'} Transparency Report`
      })
      .catch((requestError) => {
        if (!active) return
        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.detail ||
            'This transparency report is not available.'
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      document.title = 'NGO Transparency'
    }
  }, [projectId])

  if (loading) {
    return <div className="min-h-screen bg-gray-100 p-8 text-center text-sm text-gray-500">Generating report...</div>
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md bg-white p-6 text-center">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <Link to={`/projects/${projectId}`} className="mt-4 inline-block text-xs font-semibold text-green-800">Return to project</Link>
        </div>
      </div>
    )
  }

  const { project, funding, cashouts, updates, impact_metrics: impactMetrics, beneficiaries } = report

  return (
    <div className="print-report-shell min-h-screen bg-gray-100 px-4 py-6 text-gray-900 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between print:hidden">
        <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700">
          <ArrowLeft size={14} /> Back to project
        </Link>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 bg-green-800 px-4 py-2 text-xs font-semibold text-white">
          <Printer size={14} /> Print or save PDF
        </button>
      </div>

      <main className="mx-auto max-w-5xl bg-white p-7 shadow-sm print:max-w-none print:p-0 print:shadow-none">
        <header className="border-b-2 border-green-800 pb-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-800">NGO Transparency</p>
              <h1 className="mt-2 text-2xl font-bold">Project Transparency Report</h1>
              <p className="mt-1 text-lg font-semibold text-gray-700">{project.title}</p>
            </div>
            <div className="text-right text-[10px] leading-5 text-gray-500">
              <p>Generated {formatDate(report.generated_at)}</p>
              <p>Status: {String(project.status || '').replace(/_/g, ' ')}</p>
              <p>Location: {project.location || 'Not specified'}</p>
            </div>
          </div>
        </header>

        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-gray-800">Project Overview</h2>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-gray-600">{project.description}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
            <div className="bg-gray-50 p-3"><span className="text-gray-500">Type</span><p className="mt-1 font-semibold">{project.project_type_display}</p></div>
            <div className="bg-gray-50 p-3"><span className="text-gray-500">Start</span><p className="mt-1 font-semibold">{formatDate(project.start_date)}</p></div>
            <div className="bg-gray-50 p-3"><span className="text-gray-500">End</span><p className="mt-1 font-semibold">{formatDate(project.end_date)}</p></div>
            <div className="bg-gray-50 p-3"><span className="text-gray-500">Staff</span><p className="mt-1 font-semibold">{project.created_by || 'Not recorded'}</p></div>
          </div>
        </section>

        <section className="mt-7 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-gray-800">Funding Accountability</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
            <div className="border border-gray-200 p-3"><span className="text-gray-500">Target</span><p className="mt-1 font-bold">{formatCurrency(funding.target_amount)}</p></div>
            <div className="border border-gray-200 p-3"><span className="text-gray-500">Received</span><p className="mt-1 font-bold">{formatCurrency(funding.total_donated)}</p></div>
            <div className="border border-gray-200 p-3"><span className="text-gray-500">Spent</span><p className="mt-1 font-bold">{formatCurrency(funding.total_spent)}</p></div>
            <div className="border border-gray-200 p-3"><span className="text-gray-500">Available</span><p className="mt-1 font-bold">{formatCurrency(funding.available_balance)}</p></div>
          </div>

          {funding.monthly_donations?.length > 0 ? (
            <table className="mt-4 min-w-full text-[10px]">
              <thead><tr className="border-b border-gray-300 text-left"><th className="py-2">Donation month</th><th className="py-2 text-right">Completed donations</th></tr></thead>
              <tbody>{funding.monthly_donations.map((row) => <tr key={row.month} className="border-b border-gray-100"><td className="py-2">{formatDate(row.month)}</td><td className="py-2 text-right font-semibold">{formatCurrency(row.amount)}</td></tr>)}</tbody>
            </table>
          ) : null}
        </section>

        <section className="mt-7">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-gray-800">Spending Details</h2>
          {cashouts.length === 0 ? <p className="mt-2 text-xs text-gray-500">No spending has been recorded.</p> : cashouts.map((cashout) => (
            <div key={cashout.id} className="mt-3 break-inside-avoid border border-gray-200 p-3">
              <div className="flex justify-between gap-4 text-[11px]"><div><p className="font-bold">{formatCurrency(cashout.amount)}</p><p className="mt-1 text-gray-500">{cashout.purpose}</p></div><div className="text-right text-gray-500"><p>{formatDate(cashout.created_at)}</p><p>Balance {formatCurrency(cashout.remaining_balance)}</p></div></div>
              {cashout.items?.length > 0 ? (
                <table className="mt-3 min-w-full text-[10px]"><thead><tr className="border-b border-gray-200 text-left"><th className="py-1.5">Item</th><th>Description</th><th>Qty</th><th className="text-right">Amount</th></tr></thead><tbody>{cashout.items.map((item) => <tr key={item.id} className="border-b border-gray-100"><td className="py-1.5 font-semibold">{item.item_name}</td><td>{item.description || '-'}</td><td>{Number(item.quantity)}</td><td className="text-right">{formatCurrency(item.amount)}</td></tr>)}</tbody></table>
              ) : null}
            </div>
          ))}
        </section>

        <section className="mt-7">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-gray-800">Measured Impact</h2>
          {impactMetrics.length === 0 ? <p className="mt-2 text-xs text-gray-500">No impact metrics have been recorded.</p> : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">{impactMetrics.map((metric) => <div key={metric.id} className="break-inside-avoid border border-gray-200 p-3 text-[10px]"><div className="flex justify-between gap-3"><p className="text-xs font-bold">{metric.name}</p><p className="font-bold text-green-800">{Number(metric.progress_percentage).toFixed(1)}%</p></div><p className="mt-1 text-gray-500">{Number(metric.current_value)} of {Number(metric.target_value)} {metric.unit}</p>{metric.records?.slice(0, 5).map((record) => <div key={record.id} className="mt-1.5 flex justify-between border-t border-gray-100 pt-1.5"><span>{record.recorded_at}</span><span>{Number(record.value)} {metric.unit}</span></div>)}</div>)}</div>
          )}
        </section>

        <section className="mt-7">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-gray-800">Progress Evidence</h2>
          <p className="mt-1 text-[10px] text-gray-500">{beneficiaries.length} active beneficiary records and {updates.length} published updates.</p>
          {updates.map((update) => (
            <article key={update.id} className="mt-3 break-inside-avoid border-l-2 border-green-700 pl-3">
              <div className="flex justify-between gap-4"><h3 className="text-xs font-bold">{update.title}</h3><span className="text-[9px] text-gray-500">{formatDate(update.created_at)}</span></div>
              <RichTextContent html={update.description} className="mt-1 text-[10px] leading-5" />
              {update.documents?.length > 0 ? <div className="mt-1 flex flex-wrap gap-2">{update.documents.map((document) => <a key={document.id} href={document.file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[9px] font-semibold text-green-800"><FileText size={10} />{document.title || 'Evidence PDF'}</a>)}</div> : null}
            </article>
          ))}
        </section>

        <footer className="mt-8 border-t border-gray-300 pt-3 text-[9px] leading-4 text-gray-500">
          This report is generated from the platform's current completed donations, recorded spending, project updates, and impact measurements. Supporting PDFs remain available through their evidence links in the digital report.
        </footer>
      </main>
    </div>
  )
}

export default ProjectTransparencyReportPage
