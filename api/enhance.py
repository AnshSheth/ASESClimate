from fastapi import FastAPI, UploadFile, File, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from backend.app.ml.rag_processor import DocumentEnhancer
from pypdf import PdfReader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG processor
document_enhancer = DocumentEnhancer()

@app.post("/api/enhance-document")
async def enhance_document(
    file: UploadFile = File(...),
    subject_area: str = "biology"
):
    try:
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
        else:
            raise HTTPException(
                status_code=400,
                detail="Please upload a PDF file"
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