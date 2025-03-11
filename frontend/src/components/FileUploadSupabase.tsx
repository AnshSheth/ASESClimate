import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get the function URL (local or production)
const getFunctionUrl = (functionName: string) => {
  if (process.env.NODE_ENV === 'development') {
    return `http://127.0.0.1:54321/functions/v1/${functionName}`;
  }
  // For production, use the Supabase project URL
  return `https://jinvvpncssntrttaajrb.supabase.co/functions/v1/${functionName}`;
};

// Get the Supabase anon key for authorization
const getSupabaseAnonKey = () => {
  // Use environment variables for production
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
  
  // Fallback to the correct production anon key
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppbnZ2cG5jc3NudHJ0dGFhanJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyOTQ2MjgsImV4cCI6MjA1Njg3MDYyOH0.KhdLWI7XtqTA3II3zEDhqkDTX7-0ZnzxBh-b7eScK9w';
};

// Helper function to create proper headers for Supabase Edge Functions
const getAuthHeaders = () => {
  const anon = getSupabaseAnonKey();
  return {
    'Authorization': `Bearer ${anon}`,
    'Accept': 'application/json',
  };
};

// Extended options type for function invocation
interface ExtendedFunctionInvokeOptions {
  body: any;
  url?: string | null;
}

const formatContent = (content: string) => {
  // Ensure proper paragraph breaks
  // First, normalize line breaks
  const normalizedContent = content.replace(/\r\n/g, '\n');
  
  // Process content as a whole first to handle multi-line elements
  let processedContent = normalizedContent;
  
  // Split content into lines for processing
  const lines = processedContent.split('\n');
  const formattedElements = [];
  
  let i = 0;
  let listItems = [];
  let inList = false;
  let listType = ''; // 'ordered' or 'unordered'
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Skip empty lines but add spacing
    if (!line) {
      if (inList) {
        // End the current list
        if (listType === 'unordered') {
          formattedElements.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-4 ml-4">
              {listItems}
            </ul>
          );
        } else {
          formattedElements.push(
            <ol key={`list-${i}`} className="list-decimal pl-6 mb-4 ml-4">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        inList = false;
      }
      
      i++;
      continue;
    }
    
    // Headers
    if (line.startsWith('# ')) {
      if (inList) {
        // End the current list
        if (listType === 'unordered') {
          formattedElements.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-4 ml-4">
              {listItems}
            </ul>
          );
        } else {
          formattedElements.push(
            <ol key={`list-${i}`} className="list-decimal pl-6 mb-4 ml-4">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        inList = false;
      }
      
      formattedElements.push(
        <h1 key={i} className="text-3xl font-bold mt-6 mb-4 text-ecodify-moss">
          {formatTextWithMarkdown(line.substring(2))}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      if (inList) {
        // End the current list
        if (listType === 'unordered') {
          formattedElements.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-4 ml-4">
              {listItems}
            </ul>
          );
        } else {
          formattedElements.push(
            <ol key={`list-${i}`} className="list-decimal pl-6 mb-4 ml-4">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        inList = false;
      }
      
      formattedElements.push(
        <h2 key={i} className="text-2xl font-bold mt-5 mb-3 text-ecodify-moss">
          {formatTextWithMarkdown(line.substring(3))}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      if (inList) {
        // End the current list
        if (listType === 'unordered') {
          formattedElements.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-4 ml-4">
              {listItems}
            </ul>
          );
        } else {
          formattedElements.push(
            <ol key={`list-${i}`} className="list-decimal pl-6 mb-4 ml-4">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        inList = false;
      }
      
      formattedElements.push(
        <h3 key={i} className="text-xl font-bold mt-4 mb-2 text-ecodify-moss">
          {formatTextWithMarkdown(line.substring(4))}
        </h3>
      );
    } 
    // Horizontal rule
    else if (line.match(/^(\*\*\*|\-\-\-)$/)) {
      if (inList) {
        // End the current list
        if (listType === 'unordered') {
          formattedElements.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-4 ml-4">
              {listItems}
            </ul>
          );
        } else {
          formattedElements.push(
            <ol key={`list-${i}`} className="list-decimal pl-6 mb-4 ml-4">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        inList = false;
      }
      
      formattedElements.push(
        <hr key={i} className="my-4 border-t-2 border-ecodify-earth/20" />
      );
    }
    // Blockquotes
    else if (line.startsWith('> ')) {
      if (inList) {
        // End the current list
        if (listType === 'unordered') {
          formattedElements.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-4 ml-4">
              {listItems}
            </ul>
          );
        } else {
          formattedElements.push(
            <ol key={`list-${i}`} className="list-decimal pl-6 mb-4 ml-4">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        inList = false;
      }
      
      formattedElements.push(
        <blockquote key={i} className="pl-4 border-l-4 border-ecodify-earth/30 italic my-4">
          {formatTextWithMarkdown(line.substring(2))}
        </blockquote>
      );
    }
    // Unordered lists (bullet points)
    else if (line.match(/^[\-\*\+]\s/)) {
      const listText = line.substring(2);
      
      // If we're in an ordered list, end it and start a new unordered list
      if (inList && listType === 'ordered') {
        formattedElements.push(
          <ol key={`list-${i}`} className="list-decimal pl-6 mb-4 ml-4">
            {listItems}
          </ol>
        );
        listItems = [];
      }
      
      listItems.push(
        <li key={`li-${i}`} className="mb-2">
          {formatTextWithMarkdown(listText)}
        </li>
      );
      inList = true;
      listType = 'unordered';
    }
    // Ordered lists (numbered)
    else if (line.match(/^\d+\.\s/)) {
      // Extract the number and text
      const match = line.match(/^(\d+)\.\s(.*)$/);
      
      if (match) {
        const [_, number, text] = match;
        
        // If we're in an unordered list, end it and start a new ordered list
        if (inList && listType === 'unordered') {
          formattedElements.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-4 ml-4">
              {listItems}
            </ul>
          );
          listItems = [];
        }
        
        listItems.push(
          <li key={`li-${i}`} className="mb-2" value={parseInt(number)}>
            {formatTextWithMarkdown(text)}
          </li>
        );
        inList = true;
        listType = 'ordered';
      }
    }
    // Regular paragraphs or sections with numbers (like "1. Climate-Related Examples:")
    else if (line.match(/^\d+\.\s+[A-Z]/)) {
      // This is likely a section header like "1. Climate-Related Examples:"
      if (inList) {
        // End the current list
        if (listType === 'unordered') {
          formattedElements.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-4 ml-4">
              {listItems}
            </ul>
          );
        } else {
          formattedElements.push(
            <ol key={`list-${i}`} className="list-decimal pl-6 mb-4 ml-4">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        inList = false;
      }
      
      formattedElements.push(
        <h3 key={i} className="text-xl font-bold mt-5 mb-3">
          {formatTextWithMarkdown(line)}
        </h3>
      );
    }
    // Regular paragraphs
    else {
      if (inList) {
        // End the current list
        if (listType === 'unordered') {
          formattedElements.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-4 ml-4">
              {listItems}
            </ul>
          );
        } else {
          formattedElements.push(
            <ol key={`list-${i}`} className="list-decimal pl-6 mb-4 ml-4">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        inList = false;
      }
      
      formattedElements.push(
        <p key={i} className="mb-4">
          {formatTextWithMarkdown(line)}
        </p>
      );
    }
    
    i++;
  }
  
  // If we ended with a list, add it
  if (inList && listItems.length > 0) {
    if (listType === 'unordered') {
      formattedElements.push(
        <ul key="final-list" className="list-disc pl-6 mb-4 ml-4">
          {listItems}
        </ul>
      );
    } else {
      formattedElements.push(
        <ol key="final-list" className="list-decimal pl-6 mb-4 ml-4">
          {listItems}
        </ol>
      );
    }
  }
  
  return formattedElements;
};

// Helper function to format text with bold, italic, etc.
const formatTextWithMarkdown = (text: string) => {
  if (!text) return null;
  
  // Replace bold and italic
  let formattedText = text;
  
  // Bold and italic
  formattedText = formattedText.replace(
    /\*\*\*(.*?)\*\*\*/g, 
    (_, content) => `<strong><em>${content}</em></strong>`
  );
  
  // Bold
  formattedText = formattedText.replace(
    /\*\*(.*?)\*\*/g, 
    (_, content) => `<strong>${content}</strong>`
  );
  
  // Italic
  formattedText = formattedText.replace(
    /\*(.*?)\*/g, 
    (_, content) => `<em>${content}</em>`
  );
  
  // Strikethrough
  formattedText = formattedText.replace(
    /~~(.*?)~~/g, 
    (_, content) => `<del>${content}</del>`
  );
  
  // Return as HTML
  return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
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
      // STEP 1: Extract text from PDF using our Next.js API route
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Extracting text from PDF using API route...');
      const extractionResponse = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!extractionResponse.ok) {
        const errorText = await extractionResponse.text();
        console.error('PDF extraction error:', errorText);
        throw new Error(`Error extracting PDF text: ${extractionResponse.statusText || errorText}`);
      }
      
      const extractionData = await extractionResponse.json();
      const extractedText = extractionData.text;
      
      console.log('PDF text extracted successfully, length:', extractedText.length);
      
      // STEP 2: Send the extracted text to the Edge Function for enhancement
      const functionUrl = getFunctionUrl('enhance-document');
      console.log('Calling Edge Function at:', functionUrl);
      
      // Create payload with extracted text instead of raw file
      const payload = {
        documentText: extractedText,
        subject: 'biology'
      };
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        mode: 'cors',
        credentials: 'omit',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error processing document: ${response.statusText || errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!data || !data.enhanced_content) {
        throw new Error('Invalid response data from server');
      }
      
      // Set the enhanced content
      setEnhancedContent(data.enhanced_content);
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
      // Ensure content is properly formatted for PDF generation
      // Normalize line breaks and ensure proper paragraph spacing
      const formattedContent = enhancedContent
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n') // Replace multiple line breaks with double line breaks
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters that cause encoding issues
      
      // Always use Supabase Edge Functions
      const functionUrl = getFunctionUrl('generate-pdf');
      console.log('Calling PDF Generation at:', functionUrl);
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ content: formattedContent }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error generating PDF: ${response.statusText || errorText}`);
      }
      
      // Parse the JSON response to get the base64-encoded PDF
      const data = await response.json();
      console.log('Response data keys:', Object.keys(data));
      
      if (!data || !data.pdfBase64) {
        throw new Error('Invalid response data: PDF data not found');
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
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Ecodify your Worksheets</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-2">Upload PDF Document</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            {file ? (
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">{file.name}</span>
                <button 
                  type="button" 
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => setFile(null)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ) : (
              <div>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mt-1 text-sm text-gray-500">
                  Drag and drop your PDF here, or click to browse
                </p>
              </div>
            )}
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf"
              disabled={loading}
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className={`mt-4 inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md ${file ? 'text-blue-700 bg-blue-100 hover:bg-blue-200' : 'text-white bg-blue-600 hover:bg-blue-700'} cursor-pointer transition-colors`}
            >
              {file ? 'Change File' : 'Select PDF'}
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          className={`w-full flex items-center justify-center py-3 px-4 rounded-md text-white font-medium transition-colors ${!file || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Document
            </>
          ) : (
            'Enhance Document'
          )}
        </button>
      </form>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <div className="flex">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {enhancedContent && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Enhanced Content</h3>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
              disabled={downloadLoading}
            >
              {downloadLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download as PDF
                </>
              )}
            </button>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-inner overflow-auto max-h-[500px]">
            {formatContent(enhancedContent)}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSupabase; 