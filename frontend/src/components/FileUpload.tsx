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

const getApiUrl = (endpoint: string) => {
  // Use the API server URL in development
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3002${endpoint}`;
  }
  // Use relative path in production
  return endpoint;
}

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const selectedFile = e.target.files[0]
        validateFile(selectedFile)
        setFile(selectedFile)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid file')
        setFile(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('subject_area', 'biology')

    try {
      console.log('Making API request to:', getApiUrl('/api/enhance-document'))
      const response = await fetch(getApiUrl('/api/enhance-document'), {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.detail || errorData.error || `Server error: ${response.status}`)
        } else {
          const errorText = await response.text()
          console.error('Error response:', errorText)
          throw new Error(`Server error: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log('Response data:', data)
      
      if (!data.enhanced_content) {
        throw new Error('Invalid response data from server')
      }

      setEnhancedContent(data.enhanced_content)
      setError(null)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setEnhancedContent('')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!enhancedContent) {
      setError('No content to download')
      return
    }

    setDownloadLoading(true)
    try {
      const response = await fetch(getApiUrl('/api/download-pdf'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        },
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
            onChange={handleFileChange}
            className="w-full"
            disabled={loading}
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