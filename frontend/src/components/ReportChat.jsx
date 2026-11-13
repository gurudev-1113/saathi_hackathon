import React, { useState, useRef, useEffect } from 'react'
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  X, 
  ChevronDown, 
  HelpCircle, 
  ShieldAlert, 
  Bot, 
  User, 
  AlertCircle,
  CornerDownLeft,
  Maximize2,
  Minimize2,
  Trash2,
  Check
} from 'lucide-react'
import { sendReportChatMessage } from '../services/api'

export default function ReportChat({ report }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your educational assistant for **${report.title}**. You can ask me to explain any extracted test value or reference range in simple words.`,
      grounded: true,
    },
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen, messages])

  // Suggested prompt chips for immediate interaction
  const suggestedPrompts = [
    'Are any tests out of range?',
    'What does Fasting Glucose measure?',
    'What questions should I ask my doctor?',
    'Can you diagnose my condition?',
  ]

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || inputMessage
    if (!textToSend.trim() || loading) return

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!messageText) setInputMessage('')
    setLoading(true)

    try {
      const res = await sendReportChatMessage({
        message: textToSend.trim(),
        reportTitle: report.title,
        reportText: report.rawText,
        biomarkers: report.biomarkers,
        chatHistory: messages.filter((m) => m.id !== 'welcome'),
      })

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        grounded: res.grounded_in_report,
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered a communication issue: ${err.message}. Please try again or consult a clinician.`,
        isError: true,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Chat history cleared. I'm ready to answer questions about **${report.title}**.`,
        grounded: true,
      },
    ])
  }

  return (
    <>
      {/* Floating Trigger Pill when closed */}
      {!isOpen && (
        <aside 
          aria-label="Assistant trigger"
          className="fixed bottom-6 right-6 z-40 animate-bounce-short"
        >
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 text-white font-bold text-sm shadow-xl shadow-teal-700/30 hover:scale-105 active:scale-95 transition-all border border-teal-300/40 backdrop-blur-md"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
            </span>
            <MessageSquare className="w-4 h-4" />
            <span>Ask About This Report</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] uppercase tracking-wider font-extrabold text-teal-100">
              AI
            </span>
          </button>
        </aside>
      )}

      {/* Floating Chat Window when open */}
      {isOpen && (
        <aside 
          aria-label="Report assistant chat window"
          className={`fixed z-50 transition-all duration-300 ease-in-out ${
            isExpanded
              ? 'inset-4 sm:inset-10 max-w-4xl max-h-[88vh] mx-auto'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[440px] h-[600px] max-h-[85vh]'
          }`}
        >
          <div className="w-full h-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-teal-100 flex flex-col overflow-hidden animate-fadeIn">
            {/* Stunning Top Header Bar */}
            <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-teal-700/40 relative">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 to-cyan-300 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tracking-tight">ReportSaathi Assistant</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                      Grounded
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-200/80 truncate max-w-[210px] sm:max-w-[260px]">
                    Inquiring on: {report.title}
                  </p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearHistory}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-teal-200/70 hover:text-white hover:bg-white/10 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Restore window size' : 'Expand window'}
                  className="hidden sm:block p-1.5 rounded-lg text-teal-200/70 hover:text-white hover:bg-white/10 transition"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1.5 rounded-lg text-teal-200/70 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white text-xs">
              {messages.map((m) => {
                const isUser = m.role === 'user'

                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm ${
                        isUser
                          ? 'bg-slate-800 text-white'
                          : 'bg-teal-100 text-teal-800 border border-teal-200'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[82%] rounded-2xl p-3.5 leading-relaxed space-y-1.5 shadow-sm ${
                        isUser
                          ? 'bg-gradient-to-r from-teal-700 to-teal-800 text-white rounded-tr-none'
                          : m.isError
                          ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-none'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>

                      {/* Explicit badge when question asked about info outside report */}
                      {!isUser && m.grounded === false && (
                        <div className="pt-1.5 mt-1 border-t border-slate-100 text-[10px] text-amber-700 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          <span>Not in this report • Consult your doctor</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips (Quick Questions) */}
            <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Suggestions:
              </span>
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 hover:border-teal-300 transition shadow-2xs active:scale-95 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* STUNNING CHAT TOOLBAR & INPUT AREA */}
            <div className="p-3 bg-white border-t border-slate-200/80">
              <div className="p-1 rounded-2xl bg-gradient-to-r from-teal-500/30 via-cyan-400/20 to-indigo-500/30 shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-teal-500/40 transition">
                <div className="bg-white rounded-xl flex items-center gap-2 px-3 py-1.5">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about test results or ranges in this report..."
                    className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent resize-none focus:outline-none max-h-24 py-1"
                  />

                  {/* Send Button */}
                  <button
                    onClick={() => handleSend()}
                    disabled={!inputMessage.trim() || loading}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white flex items-center justify-center transition shadow-sm shadow-teal-600/30 disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95"
                    title="Send message (Enter)"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Safety Footnote */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1.5">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-500" />
                  Educational answers only • No medical diagnosis
                </span>
                <span>Press Enter to send</span>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  )
}
