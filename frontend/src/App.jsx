import React, { useState } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import UploadArea from './components/UploadArea'
import ProcessingState from './components/ProcessingState'
import ResultsView from './components/ResultsView'
import SavedHistoryView from './components/SavedHistoryView'
import AuthPage from './components/AuthPage'
import { sampleReports } from './data/sampleReports'
import { deleteReportFromHistory } from './services/supabase'

export default function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing' | 'upload' | 'processing' | 'results' | 'history'
  const [activeReport, setActiveReport] = useState(sampleReports[0])
  const [activeDemoIndex, setActiveDemoIndex] = useState(0)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('reportsaathi_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const handleLoginSuccess = (userObj) => {
    setUser(userObj)
    setCurrentView('landing')
    try {
      localStorage.setItem('reportsaathi_user', JSON.stringify(userObj))
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogout = () => {
    setUser(null)
    try {
      localStorage.removeItem('reportsaathi_user')
    } catch (e) {
      console.error(e)
    }
  }

  const handleLoadDemo = (index = 0) => {
    setActiveDemoIndex(index)
    setActiveReport(sampleReports[index] || sampleReports[0])
    setCurrentView('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSwitchDemo = () => {
    const nextIndex = activeDemoIndex === 0 ? 1 : 0
    handleLoadDemo(nextIndex)
  }

  const handleStartProcessing = (file) => {
    setUploadedFile(file)
    setCurrentView('processing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleProcessingComplete = (apiResult) => {
    if (apiResult && apiResult.extracted_text) {
      const gemini = apiResult.gemini_analysis
      let biomarkers = []
      let headline = `Extraction complete: ${apiResult.character_count} characters.`
      let overview = apiResult.message
      let doctorQuestions = []
      let unclearWarning = null

      if (gemini) {
        headline = gemini.overall_headline
        overview = gemini.overall_plain_summary
        doctorQuestions = gemini.suggested_doctor_questions || []
        unclearWarning = gemini.unclear_report_warning

        biomarkers = (gemini.explained_biomarkers || []).map((b, idx) => {
          const isNormal = b.ai_explanation.status_indicator === 'within_range'
          const isOut = b.ai_explanation.status_indicator === 'out_of_range'

          return {
            id: `bm-gemini-${idx}`,
            name: b.source_fact.test_name,
            category: 'Analyzed Laboratory Finding',
            value: b.source_fact.extracted_value,
            unit: b.source_fact.unit || '',
            referenceInterval: b.source_fact.reference_range || 'Not provided in document',
            status: isNormal ? 'normal' : isOut ? 'elevated' : 'unclear',
            statusLabel: isNormal ? 'Optimal' : isOut ? 'Review Needed' : 'Reported',
            plainMeaning: b.ai_explanation.simple_language_explanation,
            clinicalContext: b.ai_explanation.clinical_context,
            clarityNote: b.ai_explanation.clarity_note,
          }
        })
      }

      // Fallback if no structured biomarkers in gemini
      if (biomarkers.length === 0 && apiResult.detected_rows) {
        biomarkers = apiResult.detected_rows.map((row, idx) => ({
          id: `bm-row-${idx}`,
          name: row.test_name || `Test ${idx + 1}`,
          category: 'Extracted Marker',
          value: row.observed_value || 'Present',
          unit: row.unit || '',
          referenceInterval: row.reference_interval || 'Not stated on report',
          status: 'normal',
          statusLabel: 'Observed',
          plainMeaning: `Reported value in document: ${row.observed_value} ${row.unit || ''}`,
          clinicalContext: 'Discuss with your physician to evaluate in context.',
        }))
      }

      const parsedReport = {
        id: `rep-${Date.now()}`,
        isRealExtraction: true,
        title: apiResult.filename,
        labName: 'Processed via FastAPI & Gemini API Engine',
        date: new Date().toISOString().split('T')[0],
        specimen: `${apiResult.file_type} Document (${(apiResult.file_size_bytes / 1024).toFixed(1)} KB)`,
        extractionMethod: apiResult.extraction_method,
        aiEngine: apiResult.ai_engine_used,
        aiStatusMessage: apiResult.ai_status_message,
        rawText: apiResult.extracted_text,
        unclearWarning: unclearWarning,
        summary: {
          headline: headline,
          overview: overview,
          normalCount: biomarkers.filter((b) => b.status === 'normal').length,
          attentionCount: biomarkers.filter((b) => b.status !== 'normal').length,
        },
        biomarkers: biomarkers,
        doctorQuestions: doctorQuestions,
      }

      setActiveReport(parsedReport)
    } else {
      setActiveReport(sampleReports[0])
    }

    setCurrentView('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenSavedReport = (historyItem) => {
    const reportFromHistory = {
      id: historyItem.id,
      isFromHistory: true,
      title: historyItem.report_title,
      labName: 'Saved Report Summary (Supabase / Local)',
      date: historyItem.report_date,
      specimen: historyItem.specimen_type || 'Saved Specimen',
      aiEngine: historyItem.ai_engine || 'gemini',
      summary: {
        headline: historyItem.headline,
        overview: historyItem.summary_overview,
        normalCount: historyItem.normal_count,
        attentionCount: historyItem.attention_count,
      },
      biomarkers: historyItem.biomarkers || [],
      doctorQuestions: historyItem.doctor_questions || [],
    }
    setActiveReport(reportFromHistory)
    setCurrentView('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteSavedReport = async (id, title) => {
    if (!window.confirm(`Delete "${title}" from your history?`)) return
    try {
      await deleteReportFromHistory(id)
      setCurrentView('history')
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  const handleNavigate = (view) => {
    setCurrentView(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 1. If not logged in, show dedicated full-screen Login / Create Account page first!
  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />
  }

  // 2. Once logged in, show complete Dashboard experience
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        currentView={currentView}
        onNavigate={handleNavigate}
        onLoadDemo={handleLoadDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {currentView === 'upload' && (
          <UploadArea
            onStartProcessing={handleStartProcessing}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {currentView === 'history' && (
          <SavedHistoryView
            user={user}
            onOpenReport={handleOpenSavedReport}
            onNavigateToUpload={() => handleNavigate('upload')}
          />
        )}

        {currentView === 'processing' && (
          <ProcessingState
            file={uploadedFile}
            onComplete={handleProcessingComplete}
            onCancel={() => handleNavigate('upload')}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {currentView === 'results' && (
          <ResultsView
            report={activeReport}
            user={user}
            onBackToUpload={() => handleNavigate('upload')}
            onSwitchDemo={handleSwitchDemo}
            onDeleteSavedReport={handleDeleteSavedReport}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
            <span>
              <strong>ReportSaathi</strong> • Educational Medical Lab Report Explainer
            </span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            Strictly for educational health literacy. Does not replace professional clinical advice.
          </div>
        </div>
      </footer>
    </div>
  )
}
