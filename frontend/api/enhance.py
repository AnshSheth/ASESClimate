from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import io
from pypdf import PdfReader
from rag_processor import DocumentEnhancer
import logging
from dotenv import load_dotenv

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
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG processor
document_enhancer = DocumentEnhancer()

@app.options("/enhance-document")
async def options_handler():
    return {}

@app.post("/enhance-document")
async def enhance_document(file: UploadFile = File(...)):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")

        content = await file.read()

        # Process PDF
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PdfReader(pdf_file)
            document_text = ""
            for page in pdf_reader.pages:
                document_text += page.extract_text() + "\n"

            if not document_text.strip():
                raise HTTPException(status_code=400, detail="Could not extract text from PDF")

            # Process with RAG
            enhanced_content = document_enhancer.enhance_document(
                document_text,
                "biology"  # Default subject
            )

            return {"enhanced_content": enhanced_content}

        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000) 