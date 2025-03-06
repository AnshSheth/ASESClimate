import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { PDFDocument, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Allow all origins in development
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Processing PDF generation request...');
    // Get request body
    const { content } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Creating PDF document...');
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { height } = page.getSize();
    
    // Set font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Format content
    const lines = content.split('\n');
    let y = height - 50; // Start from top with margin
    const lineHeight = 15;
    const margin = 50;
    
    for (const line of lines) {
      // Check if we need a new page
      if (y < margin) {
        const newPage = pdfDoc.addPage([612, 792]);
        y = height - 50;
      }
      
      // Skip empty lines
      if (!line.trim()) {
        y -= lineHeight;
        continue;
      }
      
      // Handle headers (lines with asterisks)
      if (line.startsWith('**') && line.endsWith('**')) {
        const text = line.replace(/\*\*/g, '');
        page.drawText(text, {
          x: margin,
          y,
          font: boldFont,
          size: 14,
        });
        y -= lineHeight * 1.5;
      } else if (line.startsWith('*') && line.endsWith('*')) {
        const text = line.replace(/\*/g, '');
        page.drawText(text, {
          x: margin,
          y,
          font: boldFont,
          size: 16,
        });
        y -= lineHeight * 2;
      } else {
        // Regular text
        // Simple word wrapping (not perfect but works for basic cases)
        const words = line.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const textWidth = font.widthOfTextAtSize(testLine, 12);
          
          if (textWidth > 612 - margin * 2) {
            page.drawText(currentLine, {
              x: margin,
              y,
              font,
              size: 12,
            });
            y -= lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y,
            font,
            size: 12,
          });
          y -= lineHeight;
        }
      }
    }
    
    console.log('Saving PDF...');
    // Save PDF
    const pdfBytes = await pdfDoc.save();
    
    // Convert to base64
    const pdfBase64 = btoa(
      String.fromCharCode.apply(null, new Uint8Array(pdfBytes) as unknown as number[])
    );
    
    console.log('PDF generated successfully, returning base64 data...');
    // Return the PDF as base64
    return new Response(
      JSON.stringify({ pdfBase64 }),
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