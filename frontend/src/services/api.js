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
