import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get the function URL (local or production)
const getFunctionUrl = (functionName: string) => {
  if (process.env.NODE_ENV === 'development') {
    return `http://127.0.0.1:54321/functions/v1/${functionName}`;
  }
  return null; // Let Supabase client handle it in production
};

// Helper function to determine if we should use Vercel API routes
const shouldUseVercelApi = () => {
  // Check if we're in production and deployed to Vercel
  return process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
};

// Get the Supabase anon key for authorization
const getSupabaseAnonKey = () => {
  // This is the default local development anon key
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
};

// Extended options type for function invocation
interface ExtendedFunctionInvokeOptions {
  body: any;
  url?: string | null;
}

const formatContent = (content: string) => {
  // Split content into lines
  const lines = content.split('\n');
  
  // Format each line
  return lines.map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
};

const FileUploadSupabase: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile) {
      // Check if file is a PDF
      if (!selectedFile.type.includes('pdf')) {
        setError('Please upload a PDF file');
        setFile(null);
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Check if we should use Vercel API routes
      if (shouldUseVercelApi()) {
        // Use Vercel API routes in production
        console.log('Using Vercel API routes for document enhancement');
        
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', file);
        
        // Send the file to the Vercel API route
        const response = await fetch('/api/enhance-document', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Error processing document: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.enhanced_content) {
          throw new Error('Invalid response data from server');
        }
        
        // Set the enhanced content
        setEnhancedContent(data.enhanced_content);
      }
      // For development environment, bypass Supabase storage
      else if (process.env.NODE_ENV === 'development') {
        // Create a FormData object to send the file directly
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subject', 'biology');
        
        // Send the file directly to the Edge Function
        const functionUrl = getFunctionUrl('enhance-document');
        console.log('Calling Edge Function at:', functionUrl);
        const response = await fetch(functionUrl!, {
          method: 'POST',
          body: formData,
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${getSupabaseAnonKey()}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Error processing document: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.enhanced_content) {
          throw new Error('Invalid response data from server');
        }
        
        // Set the enhanced content
        setEnhancedContent(data.enhanced_content);
      } else {
        // Production flow - use Supabase storage
        // 1. Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `documents/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);
          
        if (uploadError) {
          throw new Error(`Error uploading file: ${uploadError.message}`);
        }
        
        // 2. Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        
        // 3. Call Supabase Edge Function to process the document
        const options: ExtendedFunctionInvokeOptions = {
          body: { 
            fileUrl: publicUrl,
            subject: 'biology'
          },
          url: getFunctionUrl('enhance-document') // Use local URL in development
        };
        
        const { data, error: functionError } = await supabase.functions
          .invoke('enhance-document', options as any);
        
        if (functionError) {
          throw new Error(`Error processing document: ${functionError.message}`);
        }
        
        if (!data || !data.enhanced_content) {
          throw new Error('Invalid response data from server');
        }
        
        // 4. Set the enhanced content
        setEnhancedContent(data.enhanced_content);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!enhancedContent) {
      setError('No content to download');
      return;
    }

    setDownloadLoading(true);
    try {
      // Check if we should use Vercel API routes
      if (shouldUseVercelApi()) {
        // Use Vercel API routes in production
        console.log('Using Vercel API routes for PDF generation');
        
        // Send the content to the Vercel API route
        const response = await fetch('/api/download-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: enhancedContent }),
        });
        
        if (!response.ok) {
          throw new Error(`Error generating PDF: ${response.statusText}`);
        }
        
        // Get the PDF as a blob
        const pdfBlob = await response.blob();
        
        // Create a download link
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'enhanced-document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      // For development environment, use fetch directly
      else if (process.env.NODE_ENV === 'development') {
        // Call Supabase Edge Function to generate PDF
        const options: ExtendedFunctionInvokeOptions = {
          body: { content: enhancedContent },
          url: getFunctionUrl('generate-pdf') // Use local URL in development
        };
        
        const functionUrl = getFunctionUrl('generate-pdf');
        console.log('Calling PDF Generation at:', functionUrl);
        const response = await fetch(functionUrl!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${getSupabaseAnonKey()}`,
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify({ content: enhancedContent }),
        });
        
        if (!response.ok) {
          throw new Error(`Error generating PDF: ${response.statusText}`);
        }
        
        // Get the PDF as a blob
        const pdfBlob = await response.blob();
        
        // Create a download link
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'enhanced-document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Production flow - use Supabase functions
        const options: ExtendedFunctionInvokeOptions = {
          body: { content: enhancedContent },
          url: getFunctionUrl('generate-pdf') // Use local URL in development
        };
        
        const { data, error } = await supabase.functions
          .invoke('generate-pdf', options as any);
          
        if (error) {
          throw new Error(`Error generating PDF: ${error.message}`);
        }
        
        if (!data || !data.pdfBase64) {
          throw new Error('Invalid response data from server');
        }
        
        // Convert base64 to blob
        const byteCharacters = atob(data.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create a download link
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'enhanced-document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Upload Document (Supabase)</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select PDF Document</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-gray-700 border border-gray-300 rounded py-2 px-3"
            accept=".pdf"
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          disabled={!file || loading}
        >
          {loading ? 'Processing...' : 'Enhance Document'}
        </button>
      </form>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {enhancedContent && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold">Enhanced Content</h3>
            <button
              onClick={handleDownloadPDF}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm"
              disabled={downloadLoading}
            >
              {downloadLoading ? 'Generating PDF...' : 'Download as PDF'}
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap">
            {formatContent(enhancedContent)}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSupabase; 