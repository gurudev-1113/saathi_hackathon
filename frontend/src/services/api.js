const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`)
  if (!response.ok) {
    throw new Error(`Health check returned HTTP ${response.status}`)
  }
  return response.json()
}

export async function uploadAndAnalyzeReport(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/reports/analyze`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let errorMessage = `Server error (HTTP ${response.status})`
    try {
      const errJson = await response.json()
      if (errJson && errJson.detail) {
        errorMessage = errJson.detail
      }
    } catch {
      // Fallback
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export async function sendReportChatMessage({ message, reportTitle, reportText, biomarkers, chatHistory }) {
  const payload = {
    message: message.trim(),
    report_title: reportTitle || 'Laboratory Report',
    report_text: reportText || null,
    biomarkers: (biomarkers || []).map((b) => ({
      name: b.name,
      value: b.value,
      unit: b.unit,
      referenceInterval: b.referenceInterval,
      plainMeaning: b.plainMeaning,
      clinicalContext: b.clinicalContext,
    })),
    chat_history: (chatHistory || []).map((h) => ({
      role: h.role,
      content: h.content,
    })),
  }

  const response = await fetch(`${API_BASE_URL}/api/reports/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let errorMessage = `Chat error (HTTP ${response.status})`
    try {
      const errJson = await response.json()
      if (errJson && errJson.detail) {
        errorMessage = errJson.detail
      }
    } catch {}
    throw new Error(errorMessage)
  }

  return response.json()
}
