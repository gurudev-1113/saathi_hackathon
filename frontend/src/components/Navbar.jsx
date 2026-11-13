import React, { useState } from 'react'
import { HeartPulse, Upload, FileText, User, LogOut, Menu, X, Database } from 'lucide-react'

export default function Navbar({ 
  user, 
  onLogout, 
  currentView, 
  onNavigate,
  onLoadDemo
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 tracking-tight">ReportSaathi</span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Medical Explainer
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Plain-language laboratory health companion</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3.5 py-2 rounded-lg transition ${
              currentView === 'landing' ? 'bg-teal-50 text-teal-700 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('upload')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
              currentView === 'upload' ? 'bg-teal-50 text-teal-700 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-4 h-4 text-teal-600" />
            Upload Report
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
              currentView === 'history' ? 'bg-teal-50 text-teal-700 font-semibold' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Database className="w-4 h-4 text-teal-600" />
            Saved Reports
          </button>
          <button
            onClick={() => onLoadDemo(0)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Sample Reports
          </button>
        </nav>

        {/* User Session & Logout */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs uppercase border border-teal-200 shadow-sm">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div className="text-left text-xs">
                  <span className="font-semibold text-slate-800 block truncate max-w-[130px]">{user.name || user.email}</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Logged in</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Log out of ReportSaathi"
                className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition border border-transparent hover:border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : null}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs uppercase border border-teal-200">
              {user.name ? user.name[0] : 'U'}
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg">
          <button
            onClick={() => { onNavigate('landing'); setMobileMenuOpen(false) }}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded-lg hover:bg-slate-50"
          >
            Overview
          </button>
          <button
            onClick={() => { onNavigate('upload'); setMobileMenuOpen(false) }}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-teal-600" />
            Upload Report
          </button>
          <button
            onClick={() => { onNavigate('history'); setMobileMenuOpen(false) }}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-teal-600" />
            Saved Reports
          </button>
          <button
            onClick={() => { onLoadDemo(0); setMobileMenuOpen(false) }}
            className="w-full text-left py-2 px-3 text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            Sample Reports
          </button>

          <div className="pt-3 border-t border-slate-100">
            {user && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{user.email}</p>
                  <p className="text-[10px] text-emerald-600">Active session</p>
                </div>
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false) }}
                  className="px-3 py-1.5 text-xs text-rose-600 font-semibold bg-rose-50 rounded-lg hover:bg-rose-100"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
