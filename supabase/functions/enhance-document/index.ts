import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

// Direct call to OpenAI API using fetch
async function callOpenAI(prompt: string) {
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log('Making OpenAI API request...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that enhances educational content with climate-conscious material.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Processing request...');
    let documentText = '';
    let subject = 'biology';

    // Check if the request is multipart form data (direct file upload)
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      console.log('Processing multipart form data...');
      // Handle direct file upload
      const { file, subject: formSubject } = await parseMultipartForm(req);
      subject = formSubject;
      
      // Read file content
      const fileContent = await file.text();
      documentText = fileContent.substring(0, 5000); // Limit text for this example
      console.log('File content extracted, length:', documentText.length);
    } else {
      console.log('Processing JSON request...');
      // Handle JSON request with file URL
      const { fileUrl, subject: jsonSubject } = await req.json();
      subject = jsonSubject || 'biology';

      if (!fileUrl) {
        return new Response(
          JSON.stringify({ error: 'File URL is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Fetch the file content
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      // Extract text from PDF (simplified for this example)
      const fileContent = await response.text();
      documentText = fileContent.substring(0, 5000); // Limit text for this example
      console.log('File content extracted from URL, length:', documentText.length);
    }

    // Process with OpenAI
    const prompt = `
      You are an educational content enhancer specializing in climate education.
      Your task is to analyze the following educational content and enhance it by:
      1. Adding climate-related examples and context
      2. Connecting the subject matter to environmental sustainability
      3. Suggesting climate-conscious activities or discussion points
      4. Maintaining the educational value and learning objectives of the original content

      Subject area: ${subject}
      
      Original content:
      ${documentText}
      
      Please provide the enhanced content in a well-structured format.
    `;

    console.log('Calling OpenAI API...');
    const enhancedContent = await callOpenAI(prompt);
    console.log('OpenAI API response received, length:', enhancedContent.length);

    // Return the enhanced content
    return new Response(
      JSON.stringify({ enhanced_content: enhancedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}); 