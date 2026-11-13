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
  Code2
} from 'lucide-react'

export default function ResultsView({ report, onBackToUpload, onSwitchDemo }) {
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'attention' | 'normal'
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedQuestions, setCopiedQuestions] = useState(false)
  const [showRawText, setShowRawText] = useState(false)

  if (!report) return null

  const isApiExtracted = Boolean(report.isRealExtraction)

  // Filter biomarkers if standard format
  const filteredBiomarkers = (report.biomarkers || []).filter((bm) => {
    const matchesSearch = bm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bm.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bm.plainMeaning?.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilter === 'attention') {
      return bm.status === 'elevated' || bm.status === 'low'
    }
    if (activeFilter === 'normal') {
      return bm.status === 'normal'
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

        <div className="flex items-center gap-2">
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

      {/* Prominent Educational Disclaimer Banner */}
      <div className="bg-amber-50/90 border-l-4 border-amber-500 p-4 sm:p-5 rounded-r-2xl shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-amber-900 uppercase tracking-wider">
              Educational & Informational Notice
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              ReportSaathi provides text extraction and terminology definitions strictly for health literacy. It does <strong>not</strong> provide medical diagnoses, treatment changes, or clinical evaluations. Missing values or reference ranges are never invented. Always consult your treating physician.
            </p>
          </div>
        </div>
      </div>

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
              {report.extractionMethod && (
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Method: {report.extractionMethod}
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
                {report.summary?.normalCount ?? (report.biomarkers?.filter(b => b.status === 'normal').length || 0)}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Normal
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl text-center min-w-[70px]">
              <span className="block text-lg font-black text-amber-700">
                {report.summary?.attentionCount ?? (report.biomarkers?.filter(b => b.status !== 'normal').length || 0)}
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
                Detected
              </span>
            </div>
          </div>
        </div>

        {/* High-level Plain English Summary */}
        <div className="pt-6 space-y-3">
          <div className="flex items-center gap-2 text-teal-700">
            <Sparkles className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Document Summary</h2>
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
            <h2 className="text-xl font-bold text-slate-900">Extracted Laboratory Values</h2>
            <p className="text-xs text-slate-500">Factually extracted from document text without inventing missing values.</p>
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
            const isElevated = bm.status === 'elevated'
            const isLow = bm.status === 'low'
            const isNormal = bm.status === 'normal'

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
                        isElevated
                          ? 'bg-amber-100 text-amber-800'
                          : isLow
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isElevated ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : isLow ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      {bm.statusLabel || (isNormal ? 'Normal' : 'Out of Range')}
                    </span>
                  </div>

                  {/* Quantitative Values */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Observed Value</span>
                      <span className="text-lg font-black text-slate-900">
                        {bm.value}{' '}
                        <span className="text-xs font-semibold text-slate-500">{bm.unit || ''}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Standard Interval</span>
                      <span className="text-xs font-bold text-slate-700">
                        {bm.minNormal && bm.maxNormal
                          ? `${bm.minNormal} - ${bm.maxNormal} ${bm.unit || ''}`
                          : bm.referenceInterval || 'As specified by lab'}
                      </span>
                    </div>
                  </div>

                  {/* Plain Language Meaning */}
                  {bm.plainMeaning && (
                    <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 font-semibold">In simple terms:</strong> {bm.plainMeaning}
                    </div>
                  )}
                </div>

                {bm.lifestyleNote && (
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>{bm.lifestyleNote}</span>
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
    </div>
  )
}
