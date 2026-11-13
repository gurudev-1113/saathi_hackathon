import React, { useState, useRef } from 'react'
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Download,
  PlayCircle
} from 'lucide-react'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']

export default function UploadArea({ onStartProcessing, onLoadDemo }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [loadingSample, setLoadingSample] = useState(false)
  const inputRef = useRef(null)

  const validateAndSetFile = (file) => {
    setErrorMessage('')
    if (!file) return

    // Type check
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png)$/i)) {
      setErrorMessage('Unsupported file format. Please upload a PDF, JPG, or PNG image.')
      setSelectedFile(null)
      return
    }

    // Size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  // 1-Click test with generated digital PDF sample
  const handleTestWithDummyPdf = async (filename) => {
    setLoadingSample(true)
    setErrorMessage('')
    try {
      const response = await fetch(`/${filename}`)
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`)
      }
      const blob = await response.blob()
      const sampleFile = new File([blob], filename, { type: 'application/pdf' })
      setSelectedFile(sampleFile)
      onStartProcessing(sampleFile)
    } catch (err) {
      setErrorMessage(`Could not load sample PDF: ${err.message}`)
    } finally {
      setLoadingSample(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Your Laboratory Report
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Upload a clear digital PDF or photo of your blood work, metabolic panel, or pathology results.
        </p>
      </div>

      {/* Quick Sample Downloads / 1-Click Test Bar */}
      <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
              Ready-to-Use Digital PDF Lab Reports
            </span>
          </div>
          <span className="text-[10px] text-teal-700 font-medium">Text-searchable • Guaranteed 100% extractable</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            disabled={loadingSample}
            onClick={() => handleTestWithDummyPdf('Sample_Comprehensive_Metabolic_Panel.pdf')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-teal-800 border border-teal-300 hover:bg-teal-100 transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            <PlayCircle className="w-3.5 h-3.5 text-teal-600" />
            Test with Metabolic Panel PDF
          </button>

          <button
            type="button"
            disabled={loadingSample}
            onClick={() => handleTestWithDummyPdf('Sample_Complete_Blood_Count.pdf')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-teal-800 border border-teal-300 hover:bg-teal-100 transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            <PlayCircle className="w-3.5 h-3.5 text-teal-600" />
            Test with Complete Blood Count PDF
          </button>

          <a
            href="/Sample_Comprehensive_Metabolic_Panel.pdf"
            download="Sample_Comprehensive_Metabolic_Panel.pdf"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-slate-600 hover:text-slate-900 bg-white/70 hover:bg-white border border-slate-200 transition ml-auto"
            title="Download PDF to computer"
          >
            <Download className="w-3 h-3 text-slate-500" />
            Save PDF
          </a>
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          dragActive
            ? 'border-teal-500 bg-teal-50/60 scale-[1.01]'
            : selectedFile
            ? 'border-teal-400 bg-teal-50/30 cursor-default'
            : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-slate-50/60 shadow-sm'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          /* Selected File View */
          <div className="w-full max-w-md bg-white p-5 rounded-2xl border border-teal-200 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                  {selectedFile.type.includes('pdf') ? (
                    <FileText className="w-6 h-6" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-left truncate">
                  <p className="text-sm font-bold text-slate-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)} • Ready to upload to backend</p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFile(null)
                  setErrorMessage('')
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onStartProcessing(selectedFile)}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.99] transition shadow-md shadow-teal-600/30 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Explain Report via FastAPI
              </button>
            </div>
          </div>
        ) : (
          /* Empty Dragzone view */
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-bold text-slate-800">
                Drag and drop your report here, or <span className="text-teal-600 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400">
                Supports text-based digital PDF, JPG, PNG files up to 10MB
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Safe temporary file processing with automatic disk cleanup
            </div>
          </div>
        )}
      </div>

      {/* Validation Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Demo Option */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Want to preview the completed results UI directly?</h2>
          <p className="text-xs text-slate-500">Explore the interactive explanation cards and doctor questions with preloaded mock data.</p>
        </div>

        <button
          type="button"
          onClick={() => onLoadDemo(0)}
          className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold text-teal-700 bg-white border border-teal-200 hover:bg-teal-50 transition shadow-sm flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          View Sample Results UI
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
