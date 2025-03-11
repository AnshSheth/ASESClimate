import formidable from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the incoming form data
    const form = formidable({});
    
    // Parse the form with a Promise wrapper
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });
    
    // Get the uploaded file
    const uploadedFile = files.file?.[0];
    
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    
    // Extract text from PDF
    const pdfData = await pdfParse(fileBuffer);
    
    // Clean up the temporary file
    fs.unlinkSync(uploadedFile.filepath);
    
    // Return the extracted text
    return res.status(200).json({ 
      text: pdfData.text,
      info: {
        pageCount: pdfData.numpages,
        metadata: pdfData.metadata
      }
    });
  } catch (error) {
    console.error('PDF extraction error:', error);
    return res.status(500).json({ 
      error: 'Failed to extract text from PDF',
      details: error.message
    });
  }
} 