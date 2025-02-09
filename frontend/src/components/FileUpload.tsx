import React from 'react'

export default function FileUpload() {
  const [file, setFile] = React.useState<File | null>(null)
  const [enhancedContent, setEnhancedContent] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [downloadLoading, setDownloadLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const validateFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please upload a PDF or DOCX file')
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size must be less than 10MB')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    const formData = new FormData()
    
    try {
      validateFile(file)
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/api/enhance-document', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      
      setEnhancedContent(data.enhanced_content)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setEnhancedContent('')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!enhancedContent) return
    
    setDownloadLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:8000/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
        },
        credentials: 'include',
        body: JSON.stringify(enhancedContent)
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'enhanced_worksheet.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      setError(error instanceof Error ? error.message : 'Failed to download PDF')
    } finally {
      setDownloadLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null)
              setError(null)
            }}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-2">
            Upload a PDF or DOCX file (max 10MB)
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enhancing...
            </span>
          ) : 'Enhance Worksheet'}
        </button>
      </form>

      {enhancedContent && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Enhanced Content:</h2>
            <button
              onClick={handleDownloadPDF}
              disabled={downloadLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {downloadLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </span>
              ) : 'Download PDF'}
            </button>
          </div>
          <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
            <pre className="whitespace-pre-wrap text-gray-800 font-sans text-base">
              {enhancedContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
} 