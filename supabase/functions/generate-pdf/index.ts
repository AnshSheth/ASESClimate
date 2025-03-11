import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

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

    // Sanitize content to prevent encoding issues
    // Replace problematic characters that WinAnsi can't encode
    const sanitizedContent = content
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters

    console.log('Creating PDF document...');
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = currentPage.getSize();
    
    // Set fonts
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const boldItalicFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
    
    // Font sizes
    const titleSize = 18;
    const h1Size = 16;
    const h2Size = 14;
    const h3Size = 14;
    const normalSize = 12;
    const smallSize = 10;
    
    // Line heights
    const titleLineHeight = titleSize * 1.5;
    const h1LineHeight = h1Size * 1.5;
    const h2LineHeight = h2Size * 1.5;
    const h3LineHeight = h3Size * 1.5;
    const normalLineHeight = normalSize * 1.5;
    
    // Margins and spacing
    const margin = 72; // 1 inch margin for better readability
    const pageWidth = width - (margin * 2);
    const paragraphSpacing = 12;
    const bulletIndent = 20;
    const bulletTextIndent = 10;
    
    let y = height - margin; // Start from top with margin
    
    // Function to add a new page when needed
    const addNewPage = () => {
      currentPage = pdfDoc.addPage([612, 792]);
      y = height - margin; // Reset y position to top of new page with margin
      return currentPage;
    };
    
    // Function to check if we need a new page
    const needsNewPage = (requiredSpace: number) => {
      return y - requiredSpace < margin;
    };
    
    // Function to safely draw text (handling encoding issues)
    const safeDrawText = (text: string, options: any) => {
      if (!text || text.trim() === '') return;
      
      try {
        // Replace any characters that might cause encoding issues
        const safeText = text.replace(/[^\x20-\x7E]/g, ' ').trim();
        currentPage.drawText(safeText, options);
      } catch (error) {
        console.error('Error drawing text:', error);
        // Try with a simplified version of the text if there's an error
        try {
          const fallbackText = text.replace(/[^\x20-\x7E]/g, ' ').trim();
          currentPage.drawText(fallbackText, options);
        } catch (fallbackError) {
          console.error('Fallback text drawing failed:', fallbackError);
          // Last resort - just draw a placeholder
          currentPage.drawText('[Text contains unsupported characters]', options);
        }
      }
    };
    
    // Function to draw a horizontal line
    const drawHorizontalLine = () => {
      if (needsNewPage(5)) {
        addNewPage();
      }
      currentPage.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });
      y -= 20; // Space after line
    };
    
    // Function to process text with markdown formatting
    const processBoldItalicText = (text: string, options: { applyFormatting: boolean } = { applyFormatting: true }) => {
      if (!options.applyFormatting) {
        // Just remove the markdown tokens without formatting
        return text
          .replace(/\*\*\*(.*?)\*\*\*/g, '$1') // Bold and italic
          .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
          .replace(/\*(.*?)\*/g, '$1') // Italic
          .replace(/~~(.*?)~~/g, '$1'); // Strikethrough
      }
      
      // Process the text and return segments with formatting information
      const segments: { text: string, isBold: boolean, isItalic: boolean }[] = [];
      let currentIndex = 0;
      
      // Process bold and italic text
      let remaining = text;
      
      // Bold+Italic: ***text***
      remaining = remaining.replace(/\*\*\*(.*?)\*\*\*/g, (match, content) => {
        const index = text.indexOf(match, currentIndex);
        
        // Add any text before this match as regular text
        if (index > currentIndex) {
          segments.push({
            text: text.substring(currentIndex, index),
            isBold: false,
            isItalic: false
          });
        }
        
        // Add the bold+italic text
        segments.push({
          text: content,
          isBold: true,
          isItalic: true
        });
        
        // Update current index
        currentIndex = index + match.length;
        
        // Return empty string to remove this match from the remaining text
        return '';
      });
      
      // Bold: **text**
      remaining = remaining.replace(/\*\*(.*?)\*\*/g, (match, content) => {
        const index = text.indexOf(match, currentIndex);
        
        // Add any text before this match as regular text
        if (index > currentIndex) {
          segments.push({
            text: text.substring(currentIndex, index),
            isBold: false,
            isItalic: false
          });
        }
        
        // Add the bold text
        segments.push({
          text: content,
          isBold: true,
          isItalic: false
        });
        
        // Update current index
        currentIndex = index + match.length;
        
        // Return empty string to remove this match from the remaining text
        return '';
      });
      
      // Italic: *text*
      remaining = remaining.replace(/\*(.*?)\*/g, (match, content) => {
        const index = text.indexOf(match, currentIndex);
        
        // Add any text before this match as regular text
        if (index > currentIndex) {
          segments.push({
            text: text.substring(currentIndex, index),
            isBold: false,
            isItalic: false
          });
        }
        
        // Add the italic text
        segments.push({
          text: content,
          isBold: false,
          isItalic: true
        });
        
        // Update current index
        currentIndex = index + match.length;
        
        // Return empty string to remove this match from the remaining text
        return '';
      });
      
      // Add any remaining text
      if (currentIndex < text.length) {
        segments.push({
          text: text.substring(currentIndex),
          isBold: false,
          isItalic: false
        });
      }
      
      // If no formatting was found, return the entire text as one regular segment
      if (segments.length === 0) {
        segments.push({
          text: text,
          isBold: false,
          isItalic: false
        });
      }
      
      return segments;
    };
    
    // Function to draw text with word wrapping and proper formatting
    const drawWrappedText = (
      text: string, 
      x = margin,
      defaultFont = regularFont,
      fontSize = normalSize,
      lineHeight = normalLineHeight,
      maxWidth = pageWidth,
      forceBold = false
    ) => {
      if (!text || text.trim() === '') return;
      
      // Parse formatting
      const cleanText = text.trim();
      const formattedSegments = processBoldItalicText(cleanText, { applyFormatting: true });
      
      // Split into words for wrapping
      const words = cleanText
        .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .split(' ');
      
      let line = '';
      let lineSegments: { text: string, isBold: boolean, isItalic: boolean }[] = [];
      let currentX = x;
      
      for (let i = 0; i < words.length; i++) {
        // Check if adding this word would exceed the line width
        const testLine = line + (line ? ' ' : '') + words[i];
        const testWidth = regularFont.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth) {
          // The line is full, draw it
          if (needsNewPage(lineHeight)) {
            addNewPage();
          }
          
          // Draw each segment with its formatting
          currentX = x;
          
          // If forceBold is true, draw everything in bold
          if (forceBold) {
            safeDrawText(line, {
              x: currentX,
              y,
              font: boldFont,
              size: fontSize
            });
          } else {
            // Draw with proper formatting
            for (const segment of lineSegments) {
              // Choose the font based on formatting
              let fontToUse = defaultFont;
              if (segment.isBold && segment.isItalic) fontToUse = boldItalicFont;
              else if (segment.isBold) fontToUse = boldFont;
              else if (segment.isItalic) fontToUse = italicFont;
              
              safeDrawText(segment.text, {
                x: currentX,
                y,
                font: fontToUse,
                size: fontSize
              });
              
              // Move currentX
              currentX += fontToUse.widthOfTextAtSize(segment.text, fontSize);
            }
          }
          
          // Move to next line
          y -= lineHeight;
          
          // Start a new line with the current word
          line = words[i];
          
          // Recalculate line segments for the new line
          lineSegments = [];
          for (const segment of formattedSegments) {
            if (segment.text.includes(words[i])) {
              lineSegments.push({
                text: words[i],
                isBold: segment.isBold,
                isItalic: segment.isItalic
              });
              break;
            }
          }
        } else {
          // Add the word to the current line
          if (line) {
            line += ' ' + words[i];
            
            // Add a space to the last segment
            if (lineSegments.length > 0) {
              lineSegments[lineSegments.length - 1].text += ' ';
            }
            
            // Find which segment this word belongs to
            for (const segment of formattedSegments) {
              if (segment.text.includes(words[i])) {
                lineSegments.push({
                  text: words[i],
                  isBold: segment.isBold,
                  isItalic: segment.isItalic
                });
                break;
              }
            }
          } else {
            line = words[i];
            
            // Find which segment this word belongs to
            for (const segment of formattedSegments) {
              if (segment.text.includes(words[i])) {
                lineSegments.push({
                  text: words[i],
                  isBold: segment.isBold,
                  isItalic: segment.isItalic
                });
                break;
              }
            }
          }
        }
      }
      
      // Draw the last line if there's any text left
      if (line) {
        if (needsNewPage(lineHeight)) {
          addNewPage();
        }
        
        // If forceBold is true, draw the entire line in bold
        if (forceBold) {
          safeDrawText(line, {
            x,
            y,
            font: boldFont,
            size: fontSize
          });
        } else {
          // Draw each segment with its formatting
          currentX = x;
          for (const segment of lineSegments) {
            // Choose the font based on formatting
            let fontToUse = defaultFont;
            if (segment.isBold && segment.isItalic) fontToUse = boldItalicFont;
            else if (segment.isBold) fontToUse = boldFont;
            else if (segment.isItalic) fontToUse = italicFont;
            
            safeDrawText(segment.text, {
              x: currentX,
              y,
              font: fontToUse,
              size: fontSize
            });
            
            // Move currentX
            currentX += fontToUse.widthOfTextAtSize(segment.text, fontSize);
          }
        }
        
        // Move to next line
        y -= lineHeight;
      }
      
      // Add extra space after paragraph
      y -= paragraphSpacing;
    };
    
    // Function to draw a title
    const drawTitle = (title: string) => {
      if (needsNewPage(titleLineHeight)) {
        addNewPage();
      }
      drawWrappedText(title, margin, boldFont, titleSize, titleLineHeight, pageWidth, true);
    };
    
    // Function to draw a heading
    const drawHeading = (heading: string, level = 1) => {
      let fontSize = h1Size;
      let lineHeight = h1LineHeight;
      
      if (level === 2) {
        fontSize = h2Size;
        lineHeight = h2LineHeight;
      } else if (level === 3) {
        fontSize = h3Size;
        lineHeight = h3LineHeight;
      }
      
      if (needsNewPage(lineHeight)) {
        addNewPage();
      }
      
      // Add some extra space before headings (except at top of page)
      if (y < height - margin - 10) {
        y -= paragraphSpacing;
      }
      
      // Always draw headings in bold
      drawWrappedText(heading, margin, boldFont, fontSize, lineHeight, pageWidth, true);
    };
    
    // Function to draw a bullet point
    const drawBulletPoint = (text: string) => {
      if (needsNewPage(normalLineHeight)) {
        addNewPage();
      }
      
      // Draw the bullet
      safeDrawText('•', {
        x: margin,
        y,
        font: regularFont,
        size: normalSize
      });
      
      // Draw the text with indent
      const bulletTextX = margin + bulletIndent;
      const bulletTextMaxWidth = pageWidth - bulletIndent;
      
      drawWrappedText(text, bulletTextX, regularFont, normalSize, normalLineHeight, bulletTextMaxWidth);
    };
    
    // Function to draw a numbered list item
    const drawNumberedItem = (number: string, text: string) => {
      if (needsNewPage(normalLineHeight)) {
        addNewPage();
      }
      
      // Draw the number
      safeDrawText(number, {
        x: margin,
        y,
        font: boldFont,
        size: normalSize
      });
      
      // Calculate the width of the number plus spacing
      const numberWidth = boldFont.widthOfTextAtSize(number, normalSize) + bulletTextIndent;
      
      // Draw the text with indent
      const numberTextX = margin + numberWidth;
      const numberTextMaxWidth = pageWidth - numberWidth;
      
      // Save current y position
      const currentY = y;
      
      // Draw the text
      drawWrappedText(text, numberTextX, regularFont, normalSize, normalLineHeight, numberTextMaxWidth);
      
      // If the y position hasn't changed (no text was drawn), restore it
      if (y === currentY - normalLineHeight) {
        y += paragraphSpacing; // Adjust for the extra space added in drawWrappedText
      }
    };
    
    // Function to draw a paragraph of text
    const drawParagraph = (text: string) => {
      if (!text || text.trim() === '') return;
      drawWrappedText(text, margin, regularFont, normalSize, normalLineHeight);
    };
    
    // Function to process the content
    const processContent = (contentText: string) => {
      // Calculate approximate content length to determine page count
      const estimatedCharsPerPage = 3000; // Rough estimate
      const contentLength = contentText.length;
      const estimatedPageCount = Math.ceil(contentLength / estimatedCharsPerPage);
      
      console.log(`Processing content with estimated ${estimatedPageCount} pages (${contentLength} chars)`);
      
      // Set page numbers if more than one page
      let showPageNumbers = estimatedPageCount > 1;
      let currentPageNumber = 1;
      
      // Split into lines for processing
      const lines = contentText.split('\n');
      let i = 0;
      let inBulletList = false;
      let inNumberedList = false;
      
      // Add initial page
      if (currentPageNumber > 1) {
        addNewPage();
      }
      
      // Function to add page number if needed
      const addPageNumberIfNeeded = () => {
        if (showPageNumbers) {
          const pageText = `Page ${currentPageNumber}`;
          const textWidth = regularFont.widthOfTextAtSize(pageText, smallSize);
          const xPos = width - margin - textWidth;
          const yPos = margin / 2;
          
          safeDrawText(pageText, {
            x: xPos,
            y: yPos,
            font: regularFont,
            size: smallSize
          });
        }
      };
      
      // Add page number to first page
      addPageNumberIfNeeded();
      
      while (i < lines.length) {
        const line = lines[i].trim();
        
        // Skip empty lines but maintain spacing
        if (!line) {
          if (inBulletList || inNumberedList) {
            y -= paragraphSpacing / 2;
            inBulletList = false;
            inNumberedList = false;
          }
          i++;
          continue;
        }
        
        // Check if we're near the bottom of the page and need a new page
        // Leave enough space for at least a paragraph
        if (y < margin + normalLineHeight * 2) {
          addNewPage();
          currentPageNumber++;
          addPageNumberIfNeeded();
        }
        
        // Handle title (first line with Enhanced Educational Content)
        if (i === 0 && line.match(/\*\*Enhanced Educational Content\*\*/i)) {
          drawTitle(processBoldItalicText(line, { applyFormatting: false }));
          i++;
          continue;
        }
        
        // Handle climate enhancement sections (starts with **Climate Enhancement:**)
        if (line.match(/^\*\*Climate Enhancement:\*\*/i)) {
          // Draw this in a special format to distinguish it
          const enhancementText = line.replace(/^\*\*Climate Enhancement:\*\*\s*/, '').trim();
          
          // Add a climate indicator
          const boxY = y + 5;
          const boxHeight = normalLineHeight * 1.2;
          
          // Draw a green box indicator
          currentPage.drawRectangle({
            x: margin - 15,
            y: boxY - boxHeight + 5,
            width: 10,
            height: boxHeight,
            color: rgb(0.2, 0.7, 0.3), // Green color for climate sections
            opacity: 0.7,
          });
          
          // Draw enhancement text in slightly italic to distinguish
          if (enhancementText) {
            drawWrappedText(enhancementText, margin, italicFont, normalSize, normalLineHeight, pageWidth, false);
          } else {
            // Just move down if there was only the header
            y -= normalLineHeight;
          }
          
          i++;
          continue;
        }
        
        // Handle section headings (text wrapped in ** without a colon)
        const sectionHeadingMatch = line.match(/^\*\*([^:]+)\*\*$/);
        if (sectionHeadingMatch) {
          drawHeading(sectionHeadingMatch[1], 1);
          i++;
          continue;
        }
        
        // Handle section headings with context (text starts with ** but isn't just a heading)
        const contextHeadingMatch = line.match(/^\*\*([^*]+)\*\*(.+)$/);
        if (contextHeadingMatch) {
          // Draw the heading part in bold
          const headingText = contextHeadingMatch[1];
          const contextText = contextHeadingMatch[2].trim();
          
          drawWrappedText(headingText, margin, boldFont, h3Size, h3LineHeight, pageWidth, true);
          
          // Draw the context text
          if (contextText) {
            drawParagraph(contextText);
          }
          
          i++;
          continue;
        }
        
        // Handle bullet point list items (- followed by space)
        const bulletMatch = line.match(/^- (.+)$/);
        if (bulletMatch) {
          inBulletList = true;
          inNumberedList = false;
          drawBulletPoint(bulletMatch[1]);
          i++;
          continue;
        }
        
        // Handle numbered list items (digit followed by period and space)
        const numberedMatch = line.match(/^(\d+)\. (.+)$/);
        if (numberedMatch) {
          const number = numberedMatch[1];
          const text = numberedMatch[2];
          
          // Make sure this is a true numbered list item, not a section heading
          if (!text.match(/^[A-Z].+:$/)) {
            inNumberedList = true;
            inBulletList = false;
            drawNumberedItem(`${number}.`, text);
            i++;
            continue;
          }
        }
        
        // Default - treat as regular paragraph
        drawParagraph(line);
        inBulletList = false;
        inNumberedList = false;
        i++;
      }
    };
    
    // Process the content
    processContent(sanitizedContent);
    
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