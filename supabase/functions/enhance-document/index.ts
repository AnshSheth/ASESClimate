// @ts-nocheck
// Remove the old serve import as we're using Deno.serve directly now
// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Allow all origins in development
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Function to parse multipart form data
async function parseMultipartForm(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      throw new Error('Content type must be multipart/form-data');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subject = formData.get('subject') as string || 'biology';

    if (!file) {
      throw new Error('No file provided');
    }

    return { file, subject };
  } catch (error) {
    console.error('Error parsing form data:', error);
    throw error;
  }
}

// Simple function to extract text from file
async function extractTextFromFile(file: File): Promise<string> {
  try {
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    // Get file as array buffer
    const fileBuffer = await file.arrayBuffer();
    
    // Detect if it's a PDF by checking file type or examining content
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    
    // Use appropriate extraction method
    let text;
    if (isPdf) {
      console.log('PDF detected, using specialized extraction');
      text = extractTextFromPdf(fileBuffer);
    } else {
      console.log('Non-PDF file, using basic text extraction');
      text = extractTextBasic(fileBuffer);
    }
    
    console.log(`Extracted ${text.length} characters`);
    return text;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return "Text extraction failed. Please try a different document format.";
  }
}

// Basic text extraction for non-PDF files
function extractTextBasic(buffer: ArrayBuffer): string {
  try {
    const decoder = new TextDecoder('utf-8');
    let text = decoder.decode(buffer);
    
    // Remove non-printable characters and excess whitespace
    text = text.replace(/[^\x20-\x7E\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Apply length limit
    if (text.length > 6000) {
      text = text.substring(0, 6000);
    }
    
    return text;
  } catch (error) {
    console.error("Text extraction error:", error);
    return "Unable to extract text";
  }
}

// Specialized PDF text extraction
function extractTextFromPdf(buffer: ArrayBuffer): string {
  try {
    const decoder = new TextDecoder('utf-8');
    const rawText = decoder.decode(buffer);
    
    // PDF text extraction strategy:
    
    // STEP 1: Remove PDF binary data and structure
    let cleaned = rawText;
    
    // Remove PDF header and binary streams
    cleaned = cleaned.replace(/%PDF-[\d.]+/g, '');
    cleaned = cleaned.replace(/stream[\s\S]*?endstream/g, ' ');
    
    // Remove PDF object references and structure markers
    cleaned = cleaned.replace(/\d+ \d+ obj[\s\S]*?endobj/g, ' ');
    cleaned = cleaned.replace(/endobj|obj|xref|trailer|startxref/g, ' ');
    cleaned = cleaned.replace(/<<[^>]*>>/g, ' ');  // PDF dictionaries
    cleaned = cleaned.replace(/\/[A-Za-z0-9]+/g, ' ');  // PDF name objects
    
    // STEP 2: Extract actual text content using multiple strategies
    
    // Strategy 1: Extract text from parentheses (PDF text objects often store text in parentheses)
    const parenTextMatches = [];
    const parenRegex = /\(([^()]+)\)/g;
    let match;
    
    while ((match = parenRegex.exec(cleaned)) !== null) {
      if (match[1] && match[1].length > 2) {
        // Clean the matched text
        const textMatch = match[1].replace(/\\(\d{3})/g, (_, octal) => {
          // Convert octal escapes to characters
          try {
            return String.fromCharCode(parseInt(octal, 8));
          } catch {
            return ' ';
          }
        })
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
        .replace(/[^\x20-\x7E\n\t]/g, ' ')
        .trim();
        
        // Only keep if it looks like text (has letters)
        if (textMatch.length > 2 && /[A-Za-z]{2,}/.test(textMatch)) {
          parenTextMatches.push(textMatch);
        }
      }
    }
    
    // Strategy 2: If we don't find enough text in parentheses, look for sequences of ASCII characters
    if (parenTextMatches.length < 5) {
      // Find all printable sequences (letters, numbers, punctuation)
      const textLike = cleaned.match(/[A-Za-z][A-Za-z0-9\s.,;:!?'"(){}\[\]-]{3,}[A-Za-z0-9.!?]/g) || [];
      
      // Only keep sequences that have multiple words
      const wordySequences = textLike.filter(seq => {
        const words = seq.split(/\s+/).filter(w => w.length > 1);
        return words.length >= 2;
      });
      
      if (wordySequences.length > 0) {
        return wordySequences.join(' ').replace(/\s+/g, ' ').trim();
      }
    } else {
      // Parenthesis extraction worked
      return parenTextMatches.join(' ').replace(/\s+/g, ' ').trim();
    }
    
    // Strategy 3: Remove URLs and other non-content markers from raw text
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, ' ');
    cleaned = cleaned.replace(/www\.[^\s]+/g, ' ');
    
    // Strategy 4: Last resort - just find anything that looks like words
    const words = cleaned.match(/[A-Za-z]{3,}/g) || [];
    if (words.length > 20) {
      return words.join(' ');
    }
    
    // If we get here, we couldn't extract text effectively
    console.log("Warning: Could not extract meaningful text from PDF");
    return "This document appears to contain limited readable text content.";
    
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "Failed to extract text from PDF";
  }
}

// Direct call to OpenAI API using fetch
async function callOpenAI(prompt: string) {
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Security check - log and verify what we're sending
    console.log('Document length before sending to OpenAI:', prompt.length);
    console.log('First 100 chars of document:', prompt.substring(0, 100));
    
    // Ensure we're within token limits
    if (prompt.length > 10000) {
      console.log('Truncating prompt to stay within token limits');
      prompt = prompt.substring(0, 10000);
    }

    console.log('Making OpenAI API request...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-16k',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that enhances educational content with climate-conscious material. Even if the document appears poorly formatted, extract whatever educational content you can find and enhance it. Never tell the user the document is corrupted or unreadable - work with whatever content is available.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0]?.message?.content || '';
    
    console.log('OpenAI API response received');
    
    return enhancedContent;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

// Define a more rigorous prompt that emphasizes preserving all original content
const buildEnhancementPrompt = (documentText: string, subject: string) => {
  // Ensure document text isn't too long
  if (documentText.length > 6000) {
    console.log(`Document text too long (${documentText.length} chars), truncating`);
    documentText = documentText.substring(0, 6000) + "...";
  }

  return `
    You are an educational content enhancer specializing in climate education.
    
    CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:
    1. Start with the EXACT original content provided. Do not remove, replace, or alter any existing text.
    2. DIRECTLY integrate climate-related information into the SPECIFIC topics/concepts already present in the document.
    3. Insert your climate-related enhancements IMMEDIATELY AFTER relevant sections or paragraphs.
    4. Maintain all original structure and formatting, including bullet points, numbered lists, headings, and activities.
    5. DO NOT create generic climate content—ensure every addition is directly related to the specific topics and examples already in the document.
    6. DO NOT summarize, paraphrase, or reword the original document. Keep all content verbatim and only add relevant enhancements.
    
    FORMATTING GUIDELINES:
    1. Keep original headings exactly as they appear.
    2. Use "- " for bullet points.
    3. For numbered lists, use "1. ", "2. " format.
    4. DO NOT use markdown hashtags (# or ## or ###).
    
    ORIGINAL DOCUMENT (DO NOT ALTER, ONLY ADD TO IT):
    ${documentText}
    
    Your task is to enhance this SPECIFIC document by incorporating relevant climate connections.
  `;
};

// The main handler for all requests to this endpoint
Deno.serve(async (req) => {
  // Allow CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    // We now ONLY expect a JSON payload with extracted text
    // No more direct file handling in this function
    const contentType = req.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: "Content type must be application/json" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const payload = await req.json();
    
    if (!payload || !payload.documentText) {
      return new Response(
        JSON.stringify({ error: "No document text provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Get the document text and subject area
    const documentText = payload.documentText;
    const subject = payload.subject || "biology";
    
    console.log(`Received document text (${documentText.length} chars) for enhancement`);
    console.log(`Subject area: ${subject}`);
    
    // Build the prompt for the LLM model
    const prompt = buildEnhancementPrompt(documentText, subject);
    
    // Call the OpenAI API
    const enhancedContent = await callOpenAI(prompt);
    
    // Return the enhanced document
    return new Response(
      JSON.stringify({
        enhanced_content: enhancedContent,
        status: "success",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}); 