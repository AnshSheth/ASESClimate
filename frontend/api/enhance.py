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

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()
    
    def do_POST(self):
        try:
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self._send_error(400, "No file uploaded")
                return

            # Read form data
            form_data = self.rfile.read(content_length)
            
            # Process PDF
            try:
                pdf_file = io.BytesIO(form_data)
                pdf_reader = PdfReader(pdf_file)
                document_text = ""
                for page in pdf_reader.pages:
                    document_text += page.extract_text() + "\n"
                
                if not document_text.strip():
                    self._send_error(400, "Could not extract text from PDF")
                    return
                
                # Process with RAG
                enhanced_content = document_enhancer.enhance_document(
                    document_text,
                    "biology"  # Default subject
                )
                
                # Send successful response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response_data = json.dumps({"enhanced_content": enhanced_content})
                self.wfile.write(response_data.encode('utf-8'))
                
            except Exception as e:
                logger.error(f"Error processing PDF: {str(e)}")
                self._send_error(500, f"Error processing PDF: {str(e)}")
                
        except Exception as e:
            logger.error(f"Error: {str(e)}")
            self._send_error(500, f"Internal server error: {str(e)}")
    
    def _send_error(self, status_code: int, message: str):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        error_response = json.dumps({"error": message})
        self.wfile.write(error_response.encode('utf-8')) 