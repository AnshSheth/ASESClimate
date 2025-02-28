from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import json
import io
from pypdf import PdfReader
from rag_processor import DocumentEnhancer
import logging
from dotenv import load_dotenv
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize RAG processor
document_enhancer = DocumentEnhancer()

# Constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.pdf', '.docx'}

@app.options("/api/enhance-document")
async def options_enhance():
    return Response(status_code=200)

@app.options("/api/download-pdf")
async def options_download():
    return Response(status_code=200)

@app.post("/api/enhance-document")
async def enhance_document(file: UploadFile = File(...)):
    try:
        # Log request
        logger.info(f"Received enhance request for file: {file.filename}")
        
        # Validate file extension
        file_ext = '.' + file.filename.split('.')[-1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            logger.warning(f"Invalid file extension: {file_ext}")
            return JSONResponse(
                status_code=400,
                content={"detail": f"File type not allowed. Please upload one of: {', '.join(ALLOWED_EXTENSIONS)}"}
            )
        
        # Read file content
        content = await file.read()
        
        # Process PDF files
        if file.filename.endswith('.pdf'):
            try:
                pdf_file = io.BytesIO(content)
                pdf_reader = PdfReader(pdf_file)
                document_text = ""
                for page in pdf_reader.pages:
                    document_text += page.extract_text() + "\n"
            except Exception as e:
                logger.error(f"Error reading PDF: {str(e)}")
                return JSONResponse(
                    status_code=400,
                    content={"detail": f"Error reading PDF file: {str(e)}"}
                )
        # Process DOCX files (simplified for this example)
        elif file.filename.endswith('.docx'):
            try:
                document_text = content.decode('utf-8')
            except UnicodeDecodeError:
                logger.error("Error decoding DOCX file")
                return JSONResponse(
                    status_code=400,
                    content={"detail": "Error reading DOCX file. Please ensure it's a valid document."}
                )
        else:
            logger.warning(f"Unsupported file format: {file.filename}")
            return JSONResponse(
                status_code=400,
                content={"detail": "Unsupported file format. Please upload a PDF or DOCX file."}
            )
        
        # Process with RAG
        try:
            enhanced_content = document_enhancer.enhance_document(document_text)
            logger.info("Document enhancement successful")
            return {"enhanced_content": enhanced_content}
        except Exception as e:
            logger.error(f"Error enhancing document: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"detail": f"Error enhancing document: {str(e)}"}
            )
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"An unexpected error occurred: {str(e)}"}
        )

@app.post("/api/download-pdf")
async def download_pdf(content: str):
    try:
        # Create a PDF buffer
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        
        # Write content to PDF
        y = 750  # Starting y position
        for line in content.split('\n'):
            if y < 50:  # If we're near the bottom of the page
                c.showPage()  # Start a new page
                y = 750  # Reset y position
            
            c.drawString(50, y, line)
            y -= 15  # Move down for next line
        
        c.save()
        
        # Get the value from the buffer
        pdf_value = buffer.getvalue()
        buffer.close()
        
        return Response(
            content=pdf_value,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment;filename=enhanced_worksheet.pdf"}
        )
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Handler for Vercel serverless function
def handler(request):
    if request.method == "OPTIONS":
        # Handle preflight requests
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",  # 24 hours
        }
        return Response(status_code=200, headers=headers)
    
    # For actual requests, pass to FastAPI
    return app(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002) 