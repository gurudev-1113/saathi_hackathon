import React from 'react'
import { Upload, FileText, Sparkles, ShieldCheck, HelpCircle, ArrowRight, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react'
import { sampleReports } from '../data/sampleReports'

export default function LandingPage({ onNavigate, onLoadDemo }) {
  return (
    <div className="space-y-12 pb-12">
      {/* Top Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white p-8 md:p-14 shadow-2xl">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            Empowering Health Literacy for Patients & Families
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Medical lab reports explained in <span className="text-teal-300 underline decoration-teal-400/40">simple language</span>.
          </h1>

          <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
            No more confusing acronyms or alarming numbers without context. ReportSaathi breaks down your lab test values, reference ranges, and biological markers into clear, conversational English.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('upload')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              Upload Lab Report
            </button>

            <button
              onClick={() => onLoadDemo(0)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition backdrop-blur-sm"
            >
              <FileText className="w-4 h-4 text-teal-300" />
              Try Sample Report
              <ArrowRight className="w-4 h-4 opacity-70" />
            </button>
          </div>

          <div className="pt-4 flex items-center gap-6 text-xs text-teal-200/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              PDF, JPG, PNG Supported
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              100% Free & Educational
            </span>
          </div>
        </div>
      </section>

      {/* How it Works (3 Steps) */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">How ReportSaathi Works</h2>
          <p className="text-sm text-slate-500">Three simple steps from confusing paper slip to peace of mind.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Upload Document</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload your lab report as a digital PDF or take a clear photo with your phone camera (.jpg, .png).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Automated Extraction</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Biomarkers, test values, and normal reference ranges are parsed into structured, color-coded health indicators.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Plain English Breakdown</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Get an 8th-grade explanation for each marker, lifestyle context, and smart questions to ask your doctor.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demo Cards Preview */}
      <section className="bg-slate-100/70 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Explore Sample Laboratory Reports</h2>
            <p className="text-xs text-slate-500">Test the results interface instantly without uploading any file.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 w-fit">
            Ready to inspect
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sampleReports.map((report, idx) => (
            <div
              key={report.id}
              onClick={() => onLoadDemo(idx)}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-500 shadow-sm hover:shadow-md cursor-pointer transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                    {report.specimen}
                  </span>
                  <span className="text-xs text-slate-400">{report.date}</span>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition text-base">
                  {report.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {report.summary.overview}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">
                  {report.biomarkers.length} Biomarkers Analyzed
                </span>
                <span className="text-teal-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  View Demo Results <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Boundary / Disclaimer Grid */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Our Educational Commitment & Scope</h2>
            <p className="text-xs text-slate-500">Understanding what ReportSaathi does and does not do.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> What ReportSaathi Does
            </h3>
            <ul className="text-xs text-emerald-800 space-y-1.5 list-disc list-inside">
              <li>Translates medical jargon into easy-to-read, conversational language.</li>
              <li>Highlights whether test markers fall within standard reference intervals.</li>
              <li>Helps formulate informed questions for your next doctor’s appointment.</li>
              <li>Protects patient privacy through client-side data stripping.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
            <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> What ReportSaathi Does NOT Do
            </h3>
            <ul className="text-xs text-rose-800 space-y-1.5 list-disc list-inside">
              <li>Does NOT provide medical diagnosis or replace a licensed physician.</li>
              <li>Does NOT prescribe, change, or recommend medication dosages.</li>
              <li>Does NOT evaluate emergency symptoms. (For emergencies, call 911 or local ER).</li>
              <li>Does NOT treat medical conditions.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
