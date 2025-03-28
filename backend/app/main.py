from fastapi import FastAPI, UploadFile, File, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from ml.rag_processor import DocumentEnhancer
import uvicorn
from pypdf import PdfReader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io
from typing import List

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG processor
document_enhancer = DocumentEnhancer()

# Constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.pdf', '.docx'}

def validate_file(file: UploadFile):
    """Validate file type and size"""
    # Check file extension
    file_ext = '.' + file.filename.split('.')[-1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Please upload one of: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size (requires seeking through the file)
    try:
        file.file.seek(0, 2)  # Seek to end
        size = file.file.tell()
        file.file.seek(0)  # Reset position
        
        if size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE/1024/1024}MB"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error validating file: {str(e)}"
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
                
            # Handle double asterisk sections (smaller headers)
            if line.startswith('**') and line.endswith('**'):
                c.setFont("Helvetica-Bold", 14)
                text = line.replace('**', '')
                c.drawString(40, y, text)
                y -= 25  # More spacing after headers
                c.setFont("Helvetica", 12)  # Reset font
                
            # Handle single asterisk sections (major headers)
            elif line.startswith('*') and line.endswith('*'):
                c.setFont("Helvetica-Bold", 16)
                text = line.replace('*', '')
                c.drawString(40, y, text)
                y -= 30  # More spacing after major headers
                c.setFont("Helvetica", 12)  # Reset font
                
            # Handle questions (lines starting with numbers)
            elif line.strip() and line[0].isdigit() and '. ' in line:
                c.setFont("Helvetica", 12)
                # Wrap long lines
                words = line.split()
                current_line = []
                x = 40
                
                for word in words:
                    current_line.append(word)
                    if c.stringWidth(' '.join(current_line)) > width - 80:
                        c.drawString(x, y, ' '.join(current_line[:-1]))
                        y -= 15
                        current_line = [word]
                        x = 60  # Indent continuation lines
                
                if current_line:
                    c.drawString(x, y, ' '.join(current_line))
                y -= 20  # More spacing after questions
                
            # Regular text
            else:
                c.setFont("Helvetica", 12)
                # Wrap long lines
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
                c.setFont("Helvetica", 12)  # Reset font for new page
        
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
        # Validate file
        validate_file(file)
        content = await file.read()
        
        # Handle PDF files
        if file.filename.endswith('.pdf'):
            try:
                pdf_file = io.BytesIO(content)
                pdf_reader = PdfReader(pdf_file)
                document_text = ""
                for page in pdf_reader.pages:
                    document_text += page.extract_text() + "\n"
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Error reading PDF file: {str(e)}"
                )
        # Handle DOCX files
        elif file.filename.endswith('.docx'):
            try:
                document_text = content.decode('utf-8')
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="Error reading DOCX file. Please ensure it's a valid document."
                )
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload a PDF or DOCX file."
            )
        
        # Process with RAG
        try:
            enhanced_content = document_enhancer.enhance_document(
                document_text,
                subject_area
            )
            return {"enhanced_content": enhanced_content}
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error enhancing document: {str(e)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@app.post("/api/download-pdf")
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 