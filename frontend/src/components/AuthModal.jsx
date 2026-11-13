import React, { useState } from 'react'
import { X, Mail, Lock, Eye, EyeOff, Check, HeartPulse, Sparkles } from 'lucide-react'

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!agreedToTerms) {
      setError('Please accept the Educational Terms & Privacy Agreement.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLoginSuccess({
        email: email.trim(),
        name: email.split('@')[0],
      })
      onClose()
    }, 600)
  }

  const handleUseDemoAccount = () => {
    setEmail('demo.patient@reportsaathi.org')
    setPassword('demopass123')
    setError('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft atmospheric gradient top */}
        <div className="h-32 bg-gradient-to-r from-teal-500/20 via-cyan-400/20 to-blue-500/20 p-6 flex flex-col justify-between relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 transition shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/30">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">ReportSaathi</span>
              <span className="block text-xs text-slate-600 font-medium">Educational Patient Companion</span>
            </div>
          </div>

          <div className="text-xs text-teal-800 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Sign in to save and review your lab summaries</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-4">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => { setTab('login'); setError('') }}
              className={`flex-1 pb-3 text-sm font-semibold transition relative ${
                tab === 'login'
                  ? 'text-teal-700'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
              {tab === 'login' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => { setTab('register'); setError('') }}
              className={`flex-1 pb-3 text-sm font-semibold transition relative ${
                tab === 'register'
                  ? 'text-teal-700'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
              {tab === 'register' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={handleUseDemoAccount}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Use Demo Credentials
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox agreement */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs text-slate-600 leading-tight">
                I understand ReportSaathi is an <strong>educational tool</strong> and does not provide clinical diagnoses or emergency care.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.99] transition shadow-md shadow-teal-600/20 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : tab === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Quick Demo Hint */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Demo Mode Active</span>
            <button
              type="button"
              onClick={handleUseDemoAccount}
              className="text-teal-600 hover:underline font-medium"
            >
              Auto-fill Demo Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
