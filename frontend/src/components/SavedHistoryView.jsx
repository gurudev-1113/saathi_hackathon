import React, { useState, useEffect } from 'react'
import { 
  Database, 
  Trash2, 
  ArrowRight, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Cloud, 
  HardDrive,
  Info
} from 'lucide-react'
import { getReportHistory, deleteReportFromHistory, isSupabaseConfigured } from '../services/supabase'

export default function SavedHistoryView({ user, onOpenReport, onNavigateToUpload }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const records = await getReportHistory(user)
      setHistory(records)
    } catch (err) {
      setError(err.message || 'Unable to load report history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadHistory()
    }
  }, [user])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from your saved history? This cannot be undone.`)) {
      return
    }

    setDeletingId(id)
    try {
      await deleteReportFromHistory(id)
      setHistory((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Saved Reports</h1>
          </div>
          <p className="text-xs text-slate-500">
            Past summaries saved by you. Only structured parameters are retained.
          </p>
        </div>

        {/* Supabase Status Pill */}
        <div className="flex items-center gap-2">
          {isSupabaseConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              Supabase Connected (RLS Active)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <HardDrive className="w-3.5 h-3.5 text-amber-600" />
              Local Demo Mode (No Supabase Env)
            </span>
          )}

          <button
            onClick={loadHistory}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
            title="Refresh history"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-900 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          <span className="font-bold block">Patient Data Minimization</span>
          <p className="text-teal-800/90 leading-relaxed">
            ReportSaathi stores only your structured biomarker summaries for personal reference. 
            Raw report files and medical scans are never stored or retained on any server.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading your saved report history...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center space-y-2">
          <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
          <p className="font-bold">Error loading history</p>
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && history.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h2 className="text-base font-bold text-slate-900">No Saved Reports Yet</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              When you analyze a lab report, you can optionally choose to save its structured summary here for future review.
            </p>
          </div>
          <button
            onClick={onNavigateToUpload}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-md shadow-teal-600/20"
          >
            Upload a Report Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* History Cards List */}
      {!loading && !error && history.length > 0 && (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-teal-400 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {item.report_title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    {item.specimen_type || 'Lab Specimen'}
                  </span>
                  {item.isLocalDemo && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                      Local Demo
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium line-clamp-1">
                  "{item.headline}"
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.report_date}
                  </span>
                  <span className="text-emerald-700 font-semibold">
                    {item.normal_count || 0} Normal
                  </span>
                  <span className="text-amber-700 font-semibold">
                    {item.attention_count || 0} Attention
                  </span>
                  <span>
                    {(item.biomarkers || []).length} Biomarkers
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  onClick={() => onOpenReport(item)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition"
                >
                  View Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.report_title)}
                  disabled={deletingId === item.id}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                  title="Delete from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
