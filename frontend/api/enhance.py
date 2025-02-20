from http.server import BaseHTTPRequestHandler
import json
import io
from pypdf import PdfReader
from rag_processor import DocumentEnhancer
import logging
from dotenv import load_dotenv
from typing import Union
from http.client import HTTPException

try:
    from typing import Literal
except ImportError:
    from typing_extensions import Literal

from vercel_edge import Response

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize RAG processor
document_enhancer = DocumentEnhancer()

async def POST(request):
    try:
        form_data = await request.formData()
        if not form_data or 'file' not in form_data:
            return Response(
                json.dumps({"error": "No file uploaded"}),
                status=400,
                headers={
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            )
        
        file = form_data.get('file')
        content = await file.read()
        
        # Process PDF
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PdfReader(pdf_file)
            document_text = ""
            for page in pdf_reader.pages:
                document_text += page.extract_text() + "\n"
            
            if not document_text.strip():
                return Response(
                    json.dumps({"error": "Could not extract text from PDF"}),
                    status=400,
                    headers={
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                )
            
            # Process with RAG
            enhanced_content = document_enhancer.enhance_document(
                document_text,
                "biology"  # Default subject
            )
            
            return Response(
                json.dumps({"enhanced_content": enhanced_content}),
                status=200,
                headers={
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "*"
                }
            )
            
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            return Response(
                json.dumps({"error": f"Error processing PDF: {str(e)}"}),
                status=500,
                headers={
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            )
            
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return Response(
            json.dumps({"error": f"Internal server error: {str(e)}"}),
            status=500,
            headers={
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        )

async def OPTIONS(request):
    return Response(
        None,
        status=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    ) 