import React, { useState } from 'react'
import { 
  HeartPulse, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  ShieldAlert,
  Bot,
  Activity,
  Check
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../services/supabase'

export default function AuthPage({ onLoginSuccess }) {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(true)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfoMessage('')

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!agreedToTerms) {
      setError('Please accept the Educational Terms & Privacy Policy.')
      return
    }

    setLoading(true)

    // 1. Try Supabase Auth if configured and not demo account
    if (isSupabaseConfigured && supabase && !email.includes('@reportsaathi.org')) {
      try {
        if (tab === 'login') {
          const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          })

          if (authError) {
            // Check if user doesn't exist yet
            if (authError.message.toLowerCase().includes('invalid login credentials')) {
              setError('Invalid email or password. New user? Click "Create Account" or use the 1-Click Demo account.')
            } else {
              setError(authError.message)
            }
            setLoading(false)
            return
          }

          if (data?.user) {
            onLoginSuccess({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
              isSupabaseUser: true,
            })
            setLoading(false)
            return
          }
        } else {
          // Register
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
              data: {
                full_name: fullName.trim() || email.split('@')[0],
              },
            },
          })

          if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
          }

          if (data?.user) {
            // Check if confirmation email was sent or session established
            if (data.session) {
              onLoginSuccess({
                id: data.user.id,
                email: data.user.email,
                name: fullName.trim() || data.user.email.split('@')[0],
                isSupabaseUser: true,
              })
            } else {
              setInfoMessage('Account created! A confirmation email has been sent. You can also sign in directly or use the Demo Account.')
            }
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn('Supabase auth attempt encountered an issue:', err)
        // Fallback gracefully for seamless user testing
      }
    }

    // 2. Demo / Fallback login flow
    setTimeout(() => {
      setLoading(false)
      const name = tab === 'register' && fullName ? fullName.trim() : email.split('@')[0]
      onLoginSuccess({
        id: `usr-${Date.now()}`,
        email: email.trim(),
        name: name,
        isDemoSession: true,
      })
    }, 400)
  }

  const handleUseDemoAccount = () => {
    setEmail('patient.demo@reportsaathi.org')
    setPassword('demopass123')
    setFullName('Demo Patient')
    setError('')
    setInfoMessage('')
  }

  const handleGuestLogin = () => {
    onLoginSuccess({
      id: 'guest-user',
      email: 'guest@reportsaathi.org',
      name: 'Guest Explorer',
      isGuest: true,
    })
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-[#e8f1fc] via-[#e2edfd] to-[#f4f7fe] overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Soft atmospheric gradient waves & ethereal light glows matching the futuristic reference */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {/* Soft cyan-blue luminous curve */}
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-cyan-200/40 via-blue-200/30 to-transparent blur-3xl" />
        {/* Soft violet-blue wave */}
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-indigo-200/40 via-sky-200/30 to-transparent blur-3xl" />
        {/* Central gentle glow */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
      </div>

      {/* Top Left Brand Bar */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-20 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-xl tracking-tight text-slate-900">ReportSaathi</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-full">
            AI Lab Companion
          </span>
        </div>
      </div>

      {/* Main Two-Column Stage */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-12">
        {/* Left Column: Stylized Brand Typography & Conversational AI Bubbles */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-8 px-2 sm:px-6">
          {/* Subtle AI Dialogue Bubbles */}
          <div className="flex flex-col space-y-3 max-w-md">
            <div className="self-start inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white/70 backdrop-blur-md border border-white/80 shadow-sm text-xs text-slate-600 font-medium animate-fadeIn">
              <Bot className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>I can help you understand your complex medical reports.</span>
            </div>

            <div className="self-start inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white/70 backdrop-blur-md border border-white/80 shadow-sm text-xs text-slate-600 font-medium delay-100 animate-fadeIn">
              <Activity className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span>Give me just one second, and I will extract every biomarker.</span>
            </div>

            <div className="self-start inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white/80 backdrop-blur-md border border-blue-100 shadow-sm text-xs text-blue-900 font-medium delay-200 animate-fadeIn">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>I'll need to verify your account first to keep your data private.</span>
            </div>
          </div>

          {/* Futuristic Display Branding */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600/80">
              THE PATIENT-FIRST HEALTH PLATFORM
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]">
              Report<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500">Saathi</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal max-w-lg leading-relaxed">
              Demystifying blood tests, metabolic panels, and pathology scans into transparent, 8th-grade language with strict clinical safety guardrails.
            </p>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-xs">
              <div className="text-blue-600 font-bold text-xs">Zero Fabrication</div>
              <div className="text-[11px] text-slate-500">Only facts on paper</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-xs">
              <div className="text-indigo-600 font-bold text-xs">Row-Level Security</div>
              <div className="text-[11px] text-slate-500">Supabase protected</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-xs col-span-2 sm:col-span-1">
              <div className="text-teal-600 font-bold text-xs">Grounded Chat</div>
              <div className="text-[11px] text-slate-500">Answers from report</div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Strictly educational companion. Does not diagnose or prescribe medicine.</span>
          </div>
        </div>

        {/* Right Column: Floating Frosted Glass Authentication Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-500/5 border border-white/90 p-7 sm:p-9 relative">
            {/* Card Header Title */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {tab === 'login' ? 'Sign in to ReportSaathi' : 'Create an Account'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {tab === 'login' 
                  ? 'Access your educational dashboard and report analysis history' 
                  : 'Start translating your medical lab tests in clear simple English'}
              </p>
            </div>

            {/* Minimal Tabs */}
            <div className="flex items-center border-b border-slate-200/80 mb-6 text-sm">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); setInfoMessage('') }}
                className={`flex-1 pb-3 font-semibold transition relative text-center ${
                  tab === 'login' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Sign In
                {tab === 'login' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => { setTab('register'); setError(''); setInfoMessage('') }}
                className={`flex-1 pb-3 font-semibold transition relative text-center ${
                  tab === 'register' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Create Account
                {tab === 'register' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{infoMessage}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              )}

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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={handleUseDemoAccount}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Fill Demo Credentials
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
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

              {/* Agreement checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-500 leading-tight">
                  I agree to the <span className="text-slate-700 font-semibold">User Agreement</span> and <span className="text-slate-700 font-semibold">Privacy Policy</span>. I understand ReportSaathi is an educational tool, not a doctor.
                </span>
              </label>

              {/* Main Gradient Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Actions */}
            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={handleUseDemoAccount}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                1-Click Demo Fill
              </button>

              <button
                type="button"
                onClick={handleGuestLogin}
                className="hover:text-slate-800 underline underline-offset-2"
              >
                Continue as Guest →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}