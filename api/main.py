from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from rag_processor import DocumentEnhancer
from pypdf import PdfReader
import io
import json
import logging
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG processor
document_enhancer = DocumentEnhancer()

def create_pdf(content: str) -> bytes:
    try:
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        def new_page():
            nonlocal y
            c.showPage()
            c.setFont("Helvetica", normal_font_size)
            y = height - 40
        
        # Font configurations
        title_font_size = 16
        header_font_size = 14
        normal_font_size = 12
        line_height = 15
        margin_bottom = 50  # Minimum space at bottom of page
        
        # Start position
        y = height - 40
        
        # Pre-process content to handle \n and \n\n properly
        content = content.replace('\\n\\n', '\n\n')
        content = content.replace('\\n', '\n')
        
        # Split content into lines and clean up
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                y -= line_height
                if y < margin_bottom:
                    new_page()
                continue
            
            # Reset font for each line
            c.setFont("Helvetica", normal_font_size)
            
            # Handle main title (double asterisks)
            if line.startswith('**') and line.endswith('**'):
                # Check if enough space for title
                if y < margin_bottom + line_height * 3:
                    new_page()
                
                text = line.replace('**', '')
                c.setFont("Helvetica-Bold", title_font_size)
                
                words = text.split()
                current_line = []
                x = 40
                
                for word in words:
                    current_line.append(word)
                    if c.stringWidth(' '.join(current_line)) > width - 80:
                        if y < margin_bottom:
                            new_page()
                        c.drawString(x, y, ' '.join(current_line[:-1]))
                        y -= line_height
                        current_line = [word]
                
                if current_line:
                    if y < margin_bottom:
                        new_page()
                    c.drawString(x, y, ' '.join(current_line))
                y -= line_height * 2
                continue
            
            # Handle URLs
            if line.startswith('http://') or line.startswith('https://'):
                c.setFont("Helvetica-Oblique", normal_font_size)
                while line:
                    if y < margin_bottom:
                        new_page()
                    width_of_line = c.stringWidth(line)
                    if width_of_line <= width - 80:
                        c.drawString(40, y, line)
                        break
                    break_point = len(line)
                    while break_point > 0 and c.stringWidth(line[:break_point]) > width - 80:
                        break_point = line.rfind('/', 0, break_point)
                    if break_point <= 0:
                        break_point = len(line)
                    c.drawString(40, y, line[:break_point])
                    line = line[break_point:]
                    y -= line_height
                y -= line_height * 1.5
                continue
            
            # Handle questions (numbered lines)
            if line.strip() and line[0].isdigit() and '. ' in line:
                if y < margin_bottom + line_height * 3:
                    new_page()
                
                parts = line.split('. ', 1)
                if len(parts) == 2:
                    number, text = parts
                    
                    # Draw question number
                    c.setFont("Helvetica-Bold", normal_font_size)
                    c.drawString(40, y, f"{number}.")
                    
                    # Handle the rest of the question text
                    c.setFont("Helvetica", normal_font_size)
                    words = text.split()
                    current_line = []
                    x = 60
                    
                    for word in words:
                        current_line.append(word)
                        if c.stringWidth(' '.join(current_line)) > width - 100:
                            if y < margin_bottom:
                                new_page()
                            c.drawString(x, y, ' '.join(current_line[:-1]))
                            y -= line_height
                            current_line = [word]
                    
                    if current_line:
                        if y < margin_bottom:
                            new_page()
                        c.drawString(x, y, ' '.join(current_line))
                    
                    y -= line_height * 1.5
                    continue
            
            # Regular text
            words = line.split()
            current_line = []
            x = 40
            
            for word in words:
                current_line.append(word)
                if c.stringWidth(' '.join(current_line)) > width - 80:
                    if y < margin_bottom:
                        new_page()
                    c.drawString(x, y, ' '.join(current_line[:-1]))
                    y -= line_height
                    current_line = [word]
            
            if current_line:
                if y < margin_bottom:
                    new_page()
                c.drawString(x, y, ' '.join(current_line))
            y -= line_height
        
        c.save()
        buffer.seek(0)
        return buffer.getvalue()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating PDF: {str(e)}"
        )

@app.post("/api/enhance-document")
async def enhance_document(
    file: UploadFile = File(...),
    subject_area: str = "biology"
):
    try:
        content = await file.read()
        
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Please upload a PDF file"
            )
            
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PdfReader(pdf_file)
            document_text = ""
            for page in pdf_reader.pages:
                document_text += page.extract_text() + "\n"
                
            if not document_text.strip():
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract text from PDF"
                )
                
            # Process with RAG
            enhanced_content = document_enhancer.enhance_document(
                document_text,
                subject_area
            )
            
            return {"enhanced_content": enhanced_content}
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing PDF: {str(e)}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@app.post("/api/download-pdf")
async def download_pdf(request: Request):
    try:
        body = await request.body()
        content = body.decode('utf-8')
        
        if not content:
            raise HTTPException(
                status_code=400,
                detail="No content provided for PDF generation"
            )
        
        # Clean up the content
        content = content.strip()
        
        # Generate PDF
        pdf_content = create_pdf(content)
        
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=enhanced_worksheet.pdf",
                "Content-Type": "application/pdf"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating PDF: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002) 