import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Initialize Supabase only if valid non-empty credentials exist
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_ANON_KEY.includes('your_supabase')
)

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

const LOCAL_STORAGE_KEY = 'reportsaathi_saved_history'

function isValidUUID(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

/**
 * Saves a structured report summary.
 * Strictly avoids storing raw uploaded document files or medical scans.
 */
export async function saveReportToHistory(user, report) {
  if (!user) {
    throw new Error('You must be signed in to save report history.')
  }

  const payload = {
    report_title: report.title || 'Laboratory Report',
    report_date: report.date || new Date().toISOString().split('T')[0],
    specimen_type: report.specimen || 'Clinical Specimen',
    headline: report.summary?.headline || 'Laboratory Findings Overview',
    summary_overview: report.summary?.overview || report.message || '',
    normal_count: report.summary?.normalCount || 0,
    attention_count: report.summary?.attentionCount || 0,
    total_tests: report.biomarkers?.length || 0,
    biomarkers: (report.biomarkers || []).map((b) => ({
      name: b.name,
      value: b.value,
      unit: b.unit,
      referenceInterval: b.referenceInterval,
      status: b.status,
      statusLabel: b.statusLabel,
      plainMeaning: b.plainMeaning,
      clinicalContext: b.clinicalContext,
      clarityNote: b.clarityNote,
    })),
    doctor_questions: report.doctorQuestions || [],
    ai_engine: report.aiEngine || 'gemini',
  }

  // 1. If user is authenticated with Supabase and has a valid UUID
  if (isSupabaseConfigured && supabase && isValidUUID(user.id)) {
    try {
      const { data, error } = await supabase
        .from('report_history')
        .insert({
          ...payload,
          user_id: user.id,
        })
        .select()
        .single()

      if (!error && data) {
        return { data, isCloud: true }
      }
      console.warn('Supabase insert fallback:', error?.message)
    } catch (err) {
      console.warn('Supabase cloud insert failed, falling back to local session store:', err)
    }
  }

  // 2. Demo / Guest fallback: Local storage with clear disclosure
  const localId = `local-hist-${Date.now()}`
  const localItem = {
    ...payload,
    id: localId,
    user_email: user.email,
    created_at: new Date().toISOString(),
    isLocalDemo: true,
  }

  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    const updated = [localItem, ...existing]
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
    return { data: localItem, isCloud: false }
  } catch (err) {
    throw new Error('Failed to save to local browser storage.')
  }
}

/**
 * Fetches saved reports for the authenticated user.
 */
export async function getReportHistory(user) {
  if (!user) return []

  // 1. If Supabase is configured and user has valid UUID
  if (isSupabaseConfigured && supabase && isValidUUID(user.id)) {
    try {
      const { data, error } = await supabase
        .from('report_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        return data
      }
    } catch (err) {
      console.warn('Supabase cloud fetch failed, falling back to local storage:', err)
    }
  }

  // 2. Demo / local fallback
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    return existing.filter((item) => item.user_email === user.email || user.isGuest)
  } catch {
    return []
  }
}

/**
 * Deletes a report from history.
 */
export async function deleteReportFromHistory(reportId) {
  if (isSupabaseConfigured && supabase && isValidUUID(reportId)) {
    try {
      const { error } = await supabase
        .from('report_history')
        .delete()
        .eq('id', reportId)

      if (!error) return true
    } catch (err) {
      console.warn('Supabase delete failed, falling back:', err)
    }
  }

  // Local storage fallback
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    const filtered = existing.filter((item) => item.id !== reportId)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (err) {
    throw new Error('Failed to delete report from local storage.')
  }
}
