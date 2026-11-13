import React, { useState } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import UploadArea from './components/UploadArea'
import ProcessingState from './components/ProcessingState'
import ResultsView from './components/ResultsView'
import AuthModal from './components/AuthModal'
import { sampleReports } from './data/sampleReports'

export default function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing' | 'upload' | 'processing' | 'results'
  const [activeReport, setActiveReport] = useState(sampleReports[0])
  const [activeDemoIndex, setActiveDemoIndex] = useState(0)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('reportsaathi_demo_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const handleLoginSuccess = (userObj) => {
    setUser(userObj)
    try {
      localStorage.setItem('reportsaathi_demo_user', JSON.stringify(userObj))
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogout = () => {
    setUser(null)
    try {
      localStorage.removeItem('reportsaathi_demo_user')
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
      // Map live backend API response
      const detectedBiomarkers = (apiResult.detected_rows || []).map((row, idx) => {
        let status = 'normal'
        let statusLabel = 'Within Normal Limits'
        let minVal = null
        let maxVal = null

        // Factual status determination if reference range numbers exist
        if (row.reference_interval) {
          const parts = row.reference_interval.match(/(\d+(?:\.\d+)?)/g)
          if (parts && parts.length >= 2) {
            minVal = parseFloat(parts[0])
            maxVal = parseFloat(parts[1])
            const numVal = parseFloat(row.observed_value)
            if (!isNaN(numVal) && !isNaN(minVal) && !isNaN(maxVal)) {
              if (numVal < minVal) {
                status = 'low'
                statusLabel = 'Below Reference'
              } else if (numVal > maxVal) {
                status = 'elevated'
                statusLabel = 'Above Reference'
              }
            }
          }
        }

        return {
          id: `bm-api-${idx}`,
          name: row.test_name || `Report Item ${idx + 1}`,
          category: 'Extracted Lab Marker',
          value: row.observed_value || 'Reported',
          unit: row.unit || '',
          minNormal: minVal,
          maxNormal: maxVal,
          referenceInterval: row.reference_interval || 'Not specified in line',
          status: status,
          statusLabel: statusLabel,
          plainMeaning: `Directly extracted from document line: "${row.raw_line}".`,
          lifestyleNote: 'Consult your clinician to interpret this finding in the context of your overall health profile.',
        }
      })

      // Generate focused doctor questions based on detected tests
      const doctorQuestions = (apiResult.detected_rows || [])
        .slice(0, 4)
        .map(
          (row) =>
            `Could you explain what my observed ${row.test_name} result of ${row.observed_value} ${row.unit || ''} means for my health?`
        )

      if (doctorQuestions.length === 0) {
        doctorQuestions.push(
          'What are the key clinical takeaways from this laboratory report?',
          'Do any of these extracted values indicate a need for follow-up testing or lifestyle modifications?'
        )
      }

      const parsedReport = {
        id: `api-${Date.now()}`,
        isRealExtraction: true,
        title: apiResult.filename,
        labName: 'Document Upload via FastAPI Extraction',
        date: new Date().toISOString().split('T')[0],
        specimen: `${apiResult.file_type} File (${(apiResult.file_size_bytes / 1024).toFixed(1)} KB)`,
        extractionMethod: apiResult.extraction_method,
        rawText: apiResult.extracted_text,
        message: apiResult.message,
        summary: {
          headline: `Successfully parsed ${apiResult.character_count} characters across ${apiResult.page_count} page(s).`,
          overview: `ReportSaathi extracted the document text using ${apiResult.extraction_method}. A total of ${detectedBiomarkers.length} biomarker row(s) were identified with observed numerical metrics.`,
          normalCount: detectedBiomarkers.filter((b) => b.status === 'normal').length,
          attentionCount: detectedBiomarkers.filter((b) => b.status !== 'normal').length,
        },
        biomarkers: detectedBiomarkers,
        doctorQuestions: doctorQuestions,
      }

      setActiveReport(parsedReport)
    } else {
      // Demo fallback
      setActiveReport(sampleReports[0])
    }

    setCurrentView('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigate = (view) => {
    setCurrentView(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
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
            onBackToUpload={() => handleNavigate('upload')}
            onSwitchDemo={handleSwitchDemo}
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

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}
