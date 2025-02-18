import React from 'react'

const formatContent = (content: string) => {
  // Split content into lines
  const lines = content.split('\n');
  
  return lines.map((line, index) => {
    // Handle double asterisk sections (smaller headers)
    if (line.startsWith('**') && line.endsWith('**')) {
      const headerText = line.replace(/\*\*/g, '');
      return <h3 key={index} className="text-xl font-semibold text-ecodify-earth mt-6 mb-3">{headerText}</h3>;
    }
    
    // Handle single asterisk sections (major headers)
    if (line.startsWith('*') && line.endsWith('*')) {
      const headerText = line.replace(/\*/g, '');
      return <h2 key={index} className="text-2xl font-bold text-ecodify-moss mt-8 mb-4">{headerText}</h2>;
    }
    
    // Questions (lines starting with numbers)
    if (/^\d+\./.test(line)) {
      return (
        <div key={index} className="my-4">
          <p className="text-lg text-ecodify-moss">{line}</p>
        </div>
      );
    }
    
    // URLs
    if (line.startsWith('http')) {
      return <a key={index} href={line} className="text-ecodify-sage hover:text-ecodify-moss underline" target="_blank" rel="noopener noreferrer">{line}</a>;
    }
    
    // Regular text
    if (line.trim()) {
      return <p key={index} className="my-2 text-ecodify-earth">{line}</p>;
    }
    
    // Empty lines
    return <br key={index} />;
  });
};

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

      const response = await fetch('/api/enhance-document', {
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
      const response = await fetch('/api/download-pdf', {
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="eco-input group">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null)
              setError(null)
            }}
            className="w-full"
          />
          <p className="mt-2 text-sm text-ecodify-earth/60 group-hover:text-ecodify-earth/80">
            Upload a PDF or DOCX file (max 10MB)
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="eco-button w-full"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enhancing...
            </>
          ) : 'Enhance Worksheet'}
        </button>
      </form>

      {enhancedContent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ecodify-moss">Enhanced Content:</h2>
            <button
              onClick={handleDownloadPDF}
              disabled={downloadLoading}
              className="eco-button"
            >
              {downloadLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <span>Download PDF</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </>
              )}
            </button>
          </div>
          <div className="eco-card !bg-white/95 overflow-auto">
            <div className="prose prose-lg prose-headings:text-ecodify-moss prose-p:text-ecodify-earth">
              {formatContent(enhancedContent)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 