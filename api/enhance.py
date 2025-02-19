from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from rag_processor import DocumentEnhancer
from pypdf import PdfReader
import io
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Setup CORS - simpler configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize RAG processor
try:
    document_enhancer = DocumentEnhancer()
    logger.info("RAG processor initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize RAG processor: {str(e)}")
    raise

@app.post("/enhance-document")
async def enhance_document(
    file: UploadFile = File(...),
    subject_area: str = "biology"
):
    logger.info(f"Received request for file: {file.filename}")
    
    try:
        if not file:
            logger.error("No file received")
            raise HTTPException(status_code=400, detail="No file received")
            
        if not file.filename.endswith('.pdf'):
            logger.error(f"Invalid file type: {file.filename}")
            raise HTTPException(status_code=400, detail="Please upload a PDF file")
            
        content = await file.read()
        if not content:
            logger.error("Empty file received")
            raise HTTPException(status_code=400, detail="Empty file received")
            
        logger.info(f"File read successfully, size: {len(content)} bytes")
        
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PdfReader(pdf_file)
            document_text = ""
            for page in pdf_reader.pages:
                document_text += page.extract_text() + "\n"
            logger.info(f"PDF processed successfully, extracted {len(document_text)} characters")
            
            if not document_text.strip():
                logger.error("No text could be extracted from PDF")
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract text from PDF. Please ensure the PDF contains text and not just images."
                )
                
            # Process with RAG
            enhanced_content = document_enhancer.enhance_document(
                document_text,
                subject_area
            )
            logger.info("Document enhanced successfully")
            
            return {"enhanced_content": enhanced_content}
            
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}") 