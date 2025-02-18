from fastapi import FastAPI, UploadFile, File, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from backend.app.ml.rag_processor import DocumentEnhancer
from pypdf import PdfReader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
try:
    document_enhancer = DocumentEnhancer()
    logger.info("RAG processor initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize RAG processor: {str(e)}")
    raise

@app.post("/api/enhance-document")
async def enhance_document(
    file: UploadFile = File(...),
    subject_area: str = "biology"
):
    logger.info(f"Received file: {file.filename}, subject: {subject_area}")
    try:
        content = await file.read()
        logger.info(f"File read successfully, size: {len(content)} bytes")
        
        # Handle PDF files
        if file.filename.endswith('.pdf'):
            try:
                pdf_file = io.BytesIO(content)
                pdf_reader = PdfReader(pdf_file)
                document_text = ""
                for page in pdf_reader.pages:
                    document_text += page.extract_text() + "\n"
                logger.info(f"PDF processed successfully, extracted {len(document_text)} characters")
            except Exception as e:
                logger.error(f"Error reading PDF file: {str(e)}")
                return JSONResponse(
                    status_code=400,
                    content={"error": f"Error reading PDF file: {str(e)}"}
                )
        else:
            logger.error("Invalid file type")
            return JSONResponse(
                status_code=400,
                content={"error": "Please upload a PDF file"}
            )
        
        # Process with RAG
        try:
            enhanced_content = document_enhancer.enhance_document(
                document_text,
                subject_area
            )
            logger.info("Document enhanced successfully")
            return {"enhanced_content": enhanced_content}
        except Exception as e:
            logger.error(f"Error enhancing document: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"error": f"Error enhancing document: {str(e)}"}
            )
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"An unexpected error occurred: {str(e)}"}
        ) 