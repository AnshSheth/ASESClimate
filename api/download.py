from fastapi import FastAPI, Body, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

def create_pdf(content: str) -> bytes:
    try:
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        y = height - 40  # Start 40 points down from top
        
        # Font configurations
        c.setFont("Helvetica-Bold", 16)  # Default font for headers
        
        # Split content into lines
        lines = content.split('\n')
        for line in lines:
            # Skip empty lines but add spacing
            if not line.strip():
                y -= 15
                continue
                
            # Handle double asterisk sections (headers)
            if line.startswith('**') and line.endswith('**'):
                c.setFont("Helvetica-Bold", 14)
                text = line.replace('**', '')
                c.drawString(40, y, text)
                y -= 25
                c.setFont("Helvetica", 12)
                
            # Handle questions (lines starting with numbers)
            elif line.strip() and line[0].isdigit() and '. ' in line:
                c.setFont("Helvetica", 12)
                words = line.split()
                current_line = []
                x = 40
                
                for word in words:
                    current_line.append(word)
                    if c.stringWidth(' '.join(current_line)) > width - 80:
                        c.drawString(x, y, ' '.join(current_line[:-1]))
                        y -= 15
                        current_line = [word]
                        x = 60
                
                if current_line:
                    c.drawString(x, y, ' '.join(current_line))
                y -= 20
                
            # Regular text
            else:
                c.setFont("Helvetica", 12)
                words = line.split()
                current_line = []
                
                for word in words:
                    current_line.append(word)
                    if c.stringWidth(' '.join(current_line)) > width - 80:
                        c.drawString(40, y, ' '.join(current_line[:-1]))
                        y -= 15
                        current_line = [word]
                
                if current_line:
                    c.drawString(40, y, ' '.join(current_line))
                y -= 15
            
            # Check if we need a new page
            if y < 40:
                c.showPage()
                y = height - 40
                c.setFont("Helvetica", 12)
        
        c.save()
        buffer.seek(0)
        return buffer.getvalue()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating PDF: {str(e)}"
        )

@app.options("/download-pdf")
async def download_pdf_options():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    )

@app.post("/download-pdf")
async def download_pdf(content: str = Body(...)):
    if not content or len(content.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail="No content provided for PDF generation"
        )
        
    try:
        pdf_content = create_pdf(content)
        
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=enhanced_worksheet.pdf",
                "Content-Type": "application/pdf"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating PDF: {str(e)}"
        ) 