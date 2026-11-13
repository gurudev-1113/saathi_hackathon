import React, { useEffect, useState, useRef } from 'react'
import { Cpu, CheckCircle2, FileSearch, Sparkles, AlertCircle, RefreshCw, FileText } from 'lucide-react'
import { uploadAndAnalyzeReport } from '../services/api'

export default function ProcessingState({ file, onComplete, onCancel, onLoadDemo }) {
  const [progress, setProgress] = useState(20)
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState(null)
  const [apiResponse, setApiResponse] = useState(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    if (!file) {
      // Demo report processing fallback
      const t1 = setTimeout(() => { setProgress(60); setCurrentStep(2) }, 800)
      const t2 = setTimeout(() => { setProgress(90); setCurrentStep(3) }, 1600)
      const t3 = setTimeout(() => { setProgress(100); onComplete(null) }, 2200)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }

    // Real API Call to FastAPI Backend
    const processUpload = async () => {
      try {
        setProgress(30)
        setCurrentStep(1) // Uploading & validating safe temp file

        const pTimer = setTimeout(() => {
          if (isMountedRef.current && !error) {
            setProgress(65)
            setCurrentStep(2) // Extracting text stream / OCR
          }
        }, 700)

        const result = await uploadAndAnalyzeReport(file)

        clearTimeout(pTimer)
        if (!isMountedRef.current) return

        setProgress(95)
        setCurrentStep(3) // Parsing detected biomarkers

        setTimeout(() => {
          if (isMountedRef.current) {
            setProgress(100)
            onComplete(result)
          }
        }, 400)
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message || 'An unexpected error occurred while communicating with the backend.')
        }
      }
    }

    processUpload()

    return () => {
      isMountedRef.current = false
    }
  }, [file, onComplete])

  const steps = [
    { id: 1, title: 'Safe Upload & Temp Validation', desc: 'Validating MIME type and securing temporary sandbox' },
    { id: 2, title: 'Text & Table Extraction', desc: 'Digital PDF text stream extraction / Tesseract OCR' },
    { id: 3, title: 'Biomarker Row Identification', desc: 'Factually isolating parameters without fabricating values' },
  ]

  // Error State View
  if (error) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Extraction Could Not Complete</h2>
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-left leading-relaxed">
            {error}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Upload a Different File
          </button>

          {onLoadDemo && (
            <button
              onClick={() => onLoadDemo(0)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-md shadow-teal-600/20"
            >
              <FileText className="w-3.5 h-3.5" />
              Try Interactive Sample Report
            </button>
          )}
        </div>
      </div>
    )
  }

  // Active Loading View
  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-8 animate-fadeIn">
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 rounded-3xl bg-teal-500/20 animate-ping" />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-teal-500/30">
          <Sparkles className="w-9 h-9 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Processing Report via FastAPI...
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {file ? `Analyzing ${file.name} (${(file.size / 1024).toFixed(1)} KB)` : 'Analyzing sample report'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 max-w-md mx-auto">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>{steps[currentStep - 1]?.title}</span>
          <span className="text-teal-600 font-bold">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md mx-auto text-left space-y-3 shadow-sm">
        {steps.map((s) => {
          const isDone = currentStep > s.id || progress === 100
          const isCurrent = currentStep === s.id && progress < 100

          return (
            <div key={s.id} className="flex items-start gap-3 text-xs">
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <span className={`font-semibold block ${isDone || isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>
                  {s.title}
                </span>
                <span className="text-slate-400 text-[11px] block">{s.desc}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-2 space-y-3">
        <p className="text-[11px] text-slate-400">
          Connected to live backend at <code>/api/reports/analyze</code>
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
        >
          Cancel Upload
        </button>
      </div>
    </div>
  )
}
