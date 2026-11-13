import React, { useState } from 'react'
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Printer, 
  Search, 
  HelpCircle, 
  Copy, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Sparkles, 
  Info, 
  Code2, 
  Cpu, 
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Cloud,
  HardDrive,
  Trash2
} from 'lucide-react'
import { saveReportToHistory, isSupabaseConfigured } from '../services/supabase'
import ReportChat from './ReportChat'

export default function ResultsView({ report, user, onBackToUpload, onSwitchDemo, onDeleteSavedReport }) {
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'attention' | 'normal'
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedQuestions, setCopiedQuestions] = useState(false)
  const [showRawText, setShowRawText] = useState(false)
  
  // Save State
  const [isSaved, setIsSaved] = useState(Boolean(report.isFromHistory))
  const [saving, setSaving] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')
  const [saveError, setSaveError] = useState('')
  const [showSaveExplainer, setShowSaveExplainer] = useState(false)

  if (!report) return null

  const isApiExtracted = Boolean(report.isRealExtraction)

  // Filter biomarkers if standard format
  const filteredBiomarkers = (report.biomarkers || []).filter((bm) => {
    const matchesSearch = bm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bm.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bm.plainMeaning?.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilter === 'attention') {
      return bm.status === 'elevated' || bm.status === 'low' || bm.status === 'out_of_range'
    }
    if (activeFilter === 'normal') {
      return bm.status === 'normal' || bm.status === 'within_range'
    }
    return true
  })

  const handleCopyQuestions = () => {
    const questions = report.doctorQuestions || []
    const questionsText = questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    navigator.clipboard.writeText(
      `Questions to ask my doctor regarding ${report.title}:\n\n${questionsText}\n\nGenerated for educational preparation by ReportSaathi.`
    )
    setCopiedQuestions(true)
    setTimeout(() => setCopiedQuestions(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSaveReport = async () => {
    if (!user) {
      alert('Please sign in to save reports to your history.')
      return
    }

    setSaving(true)
    setSaveError('')
    setSaveSuccessMsg('')

    try {
      const res = await saveReportToHistory(user, report)
      setIsSaved(true)
      if (res.isCloud) {
        setSaveSuccessMsg('Saved to Supabase with Row Level Security.')
      } else {
        setSaveSuccessMsg('Saved to local browser history (Demo Mode).')
      }
      setTimeout(() => setSaveSuccessMsg(''), 4000)
    } catch (err) {
      setSaveError(err.message || 'Failed to save report.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={onBackToUpload}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Explain Another Report
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Optional Save to History Button */}
          {user && !report.isFromHistory && (
            <div className="relative">
              <button
                onClick={handleSaveReport}
                disabled={saving || isSaved}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition shadow-sm ${
                  isSaved
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600 shadow-teal-600/20 active:scale-95'
                }`}
              >
                {saving ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : isSaved ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Saved to History
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    Save to My History
                  </>
                )}
              </button>
            </div>
          )}

          {/* Delete Option if Viewing from History */}
          {report.isFromHistory && onDeleteSavedReport && (
            <button
              onClick={() => onDeleteSavedReport(report.id, report.title)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete from History
            </button>
          )}

          {onSwitchDemo && !isApiExtracted && (
            <button
              onClick={onSwitchDemo}
              className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-2 rounded-xl transition"
            >
              Switch Demo Panel
            </button>
          )}

          <button
            onClick={() => setShowRawText(!showRawText)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition shadow-sm ${
              showRawText 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            {showRawText ? 'Hide Raw Text' : 'View Raw Extracted Text'}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Summary
          </button>
        </div>
      </div>

      {/* Save Success/Error Feedback Alerts */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setShowSaveExplainer(!showSaveExplainer)}
            className="text-[11px] underline font-semibold text-emerald-900"
          >
            What was stored?
          </button>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Storage Transparency Explainer (Collapsible) */}
      {showSaveExplainer && (
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs space-y-2 animate-fadeIn border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-teal-300">Data Storage & Privacy Disclosure</span>
            <button
              onClick={() => setShowSaveExplainer(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed">
            <strong>What is stored:</strong> Only your structured summary (report title, date, parameter names, observed numbers, and educational plain-language definitions).
          </p>
          <p className="leading-relaxed text-slate-300">
            <strong>What is NOT stored:</strong> We never store, upload, or retain your raw PDF files, scanned images, patient IDs, or camera photos. You can delete saved records at any time.
          </p>
        </div>
      )}

      {/* Prominent Educational Disclaimer Banner */}
      <div className="bg-amber-50/90 border-l-4 border-amber-500 p-4 sm:p-5 rounded-r-2xl shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-amber-900 uppercase tracking-wider">
              Educational & Informational Notice Only
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              ReportSaathi provides patient-friendly translations and terminology definitions strictly for educational purposes. It does <strong>not</strong> provide medical diagnoses, treatment advice, or prescriptions. Values and reference ranges are never invented. Always consult your qualified physician for medical decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Unclear Report Warning Banner */}
      {report.unclearWarning && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold block text-rose-900 mb-0.5">Clarity Advisory</span>
            <span>{report.unclearWarning}</span>
          </div>
        </div>
      )}

      {/* Raw Extracted Text Viewer Modal / Accordion */}
      {showRawText && report.rawText && (
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-slate-200">Raw Extracted Document Stream</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {report.rawText.length} characters • Method: {report.extractionMethod || 'native_pdf'}
            </span>
          </div>
          <pre className="text-xs font-mono text-teal-200/90 bg-slate-950 p-4 rounded-2xl overflow-x-auto max-h-80 whitespace-pre-wrap leading-relaxed">
            {report.rawText}
          </pre>
        </div>
      )}

      {/* Report Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                {report.specimen || 'Clinical Lab Specimen'}
              </span>

              {report.aiEngine && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Cpu className="w-3 h-3 text-indigo-500" />
                  {report.aiEngine === 'gemini' ? 'Gemini AI Explanation' : 'Factual Extractor'}
                </span>
              )}

              {report.isFromHistory && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Loaded from Saved History
                </span>
              )}

              <span className="text-xs text-slate-400">• Report ID: {report.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {report.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Source: {report.labName} • Date: {report.date}
            </p>
          </div>

          {/* Counts */}
          <div className="flex items-center gap-2">
            <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl text-center min-w-[70px]">
              <span className="block text-lg font-black text-emerald-700">
                {report.summary?.normalCount ?? 0}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Normal
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl text-center min-w-[70px]">
              <span className="block text-lg font-black text-amber-700">
                {report.summary?.attentionCount ?? 0}
              </span>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                Attention
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-center min-w-[70px]">
              <span className="block text-lg font-black text-slate-700">
                {report.biomarkers?.length || 0}
              </span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Extracted
              </span>
            </div>
          </div>
        </div>

        {/* High-level Plain English Summary */}
        <div className="pt-6 space-y-3">
          <div className="flex items-center gap-2 text-teal-700">
            <Sparkles className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Overall Plain-Language Assessment</h2>
          </div>
          <p className="text-base font-bold text-slate-800 leading-snug">
            "{report.summary?.headline || 'Extraction and Analysis Complete'}"
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {report.summary?.overview || report.message || 'All extracted markers and reference intervals have been parsed directly from your document.'}
          </p>
        </div>
      </div>

      {/* Extracted Biomarkers Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Extracted Laboratory Values & Plain Explanations</h2>
            <p className="text-xs text-slate-500">
              Source facts from the report are strictly separated from educational AI explanations.
            </p>
          </div>

          {/* Filter Chips & Search Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search biomarker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                All ({(report.biomarkers || []).length})
              </button>
              <button
                onClick={() => setActiveFilter('attention')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeFilter === 'attention' ? 'bg-white text-amber-700 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Review
              </button>
              <button
                onClick={() => setActiveFilter('normal')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeFilter === 'normal' ? 'bg-white text-emerald-700 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Normal
              </button>
            </div>
          </div>
        </div>

        {/* Biomarkers Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBiomarkers.map((bm, idx) => {
            const isOut = bm.status === 'elevated' || bm.status === 'low' || bm.status === 'out_of_range'
            const isNormal = bm.status === 'normal' || bm.status === 'within_range'

            return (
              <div
                key={bm.id || idx}
                className={`bg-white rounded-2xl border p-5 transition hover:shadow-md flex flex-col justify-between ${
                  !isNormal ? 'border-amber-200 bg-gradient-to-b from-amber-50/20 to-white' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {bm.category || 'Diagnostic Parameter'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {bm.name}
                      </h3>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isOut
                          ? 'bg-amber-100 text-amber-800'
                          : isNormal
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isOut ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : isNormal ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5" />
                      )}
                      {bm.statusLabel || (isNormal ? 'Normal' : isOut ? 'Review' : 'Reported')}
                    </span>
                  </div>

                  {/* Quantitative Source Values */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Source Value</span>
                      <span className="text-lg font-black text-slate-900">
                        {bm.value}{' '}
                        <span className="text-xs font-semibold text-slate-500">{bm.unit || ''}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Report Reference Range</span>
                      <span className="text-xs font-bold text-slate-700">
                        {bm.referenceInterval || 'Not stated by lab'}
                      </span>
                    </div>
                  </div>

                  {/* Plain Language Meaning */}
                  {bm.plainMeaning && (
                    <div className="space-y-1 text-xs text-slate-700 leading-relaxed bg-teal-50/40 p-2.5 rounded-xl border border-teal-100/60">
                      <strong className="text-teal-900 font-semibold block text-[11px] uppercase tracking-wider">
                        Plain-Language Explanation:
                      </strong>
                      <p>{bm.plainMeaning}</p>
                    </div>
                  )}

                  {/* Clinical Context */}
                  {bm.clinicalContext && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      <span className="font-semibold text-slate-700">Clinical Context:</span> {bm.clinicalContext}
                    </p>
                  )}
                </div>

                {/* Clarity or Lifestyle Note */}
                {(bm.clarityNote || bm.lifestyleNote) && (
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>{bm.clarityNote || bm.lifestyleNote}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredBiomarkers.length === 0 && (
          <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No biomarkers matched your filter. You can view the full extracted document above via "View Raw Extracted Text".
          </div>
        )}
      </div>

      {/* Doctor Questions */}
      {report.doctorQuestions && report.doctorQuestions.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-teal-300 mb-1">
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Patient Consultation Preparation</span>
              </div>
              <h3 className="text-xl font-bold">Suggested Questions for Your Doctor</h3>
              <p className="text-xs text-slate-300">
                Informed questions to ask your physician regarding these observed values.
              </p>
            </div>

            <button
              onClick={handleCopyQuestions}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition self-start sm:self-auto"
            >
              {copiedQuestions ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-teal-300" />
                  Copy Questions
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            {report.doctorQuestions.map((q, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start gap-3 hover:bg-white/10 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {q}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report-Specific AI Educational Chat Assistant */}
      <ReportChat report={report} />
    </div>
  )
}
