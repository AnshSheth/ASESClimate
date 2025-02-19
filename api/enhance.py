from http.server import BaseHTTPRequestHandler
from rag_processor import DocumentEnhancer
from pypdf import PdfReader
import json
import io
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize RAG processor
try:
    document_enhancer = DocumentEnhancer()
    logger.info("RAG processor initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize RAG processor: {str(e)}")
    raise

def parse_multipart(content_type, body):
    """Parse multipart form data"""
    try:
        # Get boundary
        boundary = content_type.split('boundary=')[1].encode()
        
        # Split parts
        parts = body.split(boundary)
        
        # Find the file part
        for part in parts:
            if b'filename=' in part:
                # Get headers and content sections
                headers, content = part.split(b'\r\n\r\n', 1)
                headers = headers.decode()
                
                # Extract filename
                if 'filename="' in headers:
                    filename = headers.split('filename="')[1].split('"')[0]
                else:
                    continue
                
                # Get file content (remove last \r\n)
                file_content = content.rsplit(b'\r\n', 1)[0]
                
                return filename, file_content
                
        return None, None
    except Exception as e:
        logger.error(f"Error parsing multipart data: {str(e)}")
        return None, None

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()
        
    def do_POST(self):
        try:
            # Get content length and type
            content_length = int(self.headers.get('Content-Length', 0))
            content_type = self.headers.get('Content-Type', '')
            
            # Read the body
            body = self.rfile.read(content_length)
            
            if not content_type or not body:
                self.send_error(400, "Invalid request")
                return
                
            if 'multipart/form-data' not in content_type:
                self.send_error(400, "Invalid content type. Expected multipart/form-data")
                return
                
            # Parse multipart data
            filename, file_content = parse_multipart(content_type, body)
            
            if not filename or not file_content:
                self.send_error(400, "No file received or invalid file data")
                return
                
            if not filename.lower().endswith('.pdf'):
                self.send_error(400, "Please upload a PDF file")
                return
            
            # Process PDF
            try:
                pdf_file = io.BytesIO(file_content)
                pdf_reader = PdfReader(pdf_file)
                document_text = ""
                for page in pdf_reader.pages:
                    document_text += page.extract_text() + "\n"
                
                if not document_text.strip():
                    self.send_error(400, "Could not extract text from PDF")
                    return
                
                # Process with RAG
                enhanced_content = document_enhancer.enhance_document(
                    document_text,
                    "biology"  # Default subject
                )
                
                # Send response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', '*')
                self.end_headers()
                
                response = json.dumps({"enhanced_content": enhanced_content})
                self.wfile.write(response.encode())
                
            except Exception as e:
                logger.error(f"Error processing PDF: {str(e)}")
                self.send_error(500, f"Error processing PDF: {str(e)}")
                
        except Exception as e:
            logger.error(f"Error: {str(e)}")
            self.send_error(500, f"Internal server error: {str(e)}") 