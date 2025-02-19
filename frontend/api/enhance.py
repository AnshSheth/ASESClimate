from fastapi import FastAPI, UploadFile, File, Body, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from .rag_processor import DocumentEnhancer
from pypdf import PdfReader
import io
import logging

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
try:
    document_enhancer = DocumentEnhancer()
    logger.info("RAG processor initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize RAG processor: {str(e)}")
    raise

@app.api_route("/api/enhance-document", methods=["POST", "OPTIONS"])
async def enhance_document(
    request: Request,
    file: UploadFile = File(None),
    subject_area: str = "biology"
):
    # Handle OPTIONS request
    if request.method == "OPTIONS":
        return JSONResponse(
            content={},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "86400",
            }
        )
    
    # Handle POST request
    logger.info(f"Received request for file: {file.filename if file else 'No file'}")
    
    try:
        if not file:
            logger.error("No file received")
            return JSONResponse(
                status_code=400,
                content={"error": "No file received"},
                headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
            )
            
        if not file.filename.endswith('.pdf'):
            logger.error(f"Invalid file type: {file.filename}")
            return JSONResponse(
                status_code=400,
                content={"error": "Please upload a PDF file"},
                headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
            )
            
        content = await file.read()
        if not content:
            logger.error("Empty file received")
            return JSONResponse(
                status_code=400,
                content={"error": "Empty file received"},
                headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
            )
            
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
                return JSONResponse(
                    status_code=400,
                    content={"error": "Could not extract text from PDF. Please ensure the PDF contains text and not just images."},
                    headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
                )
                
            # Process with RAG
            enhanced_content = document_enhancer.enhance_document(
                document_text,
                subject_area
            )
            logger.info("Document enhanced successfully")
            
            return JSONResponse(
                content={"enhanced_content": enhanced_content},
                headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
            )
            
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"error": f"Error processing PDF: {str(e)}"},
                headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
            )
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"An unexpected error occurred: {str(e)}"},
            headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
        ) 