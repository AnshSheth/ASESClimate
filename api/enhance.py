from http.server import BaseHTTPRequestHandler
from rag_processor import DocumentEnhancer
from pypdf import PdfReader
import json
import io
import logging

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
    boundary = content_type.split('boundary=')[1].encode()
    parts = body.split(boundary)
    
    # Find the file part
    for part in parts:
        if b'filename=' in part:
            # Extract filename
            filename = part.split(b'filename=')[1].split(b'\r\n')[0].strip(b'"').decode()
            
            # Find the actual file content
            file_content = part.split(b'\r\n\r\n')[1].rsplit(b'\r\n', 1)[0]
            
            return filename, file_content
    
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
            
            if 'multipart/form-data' in content_type:
                filename, file_content = parse_multipart(content_type, body)
                
                if not filename or not file_content:
                    self.send_error(400, "No file received")
                    return
                    
                if not filename.endswith('.pdf'):
                    self.send_error(400, "Please upload a PDF file")
                    return
                
                # Process PDF
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
                    "biology"
                )
                
                # Send response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = json.dumps({"enhanced_content": enhanced_content})
                self.wfile.write(response.encode())
                
            else:
                self.send_error(400, "Invalid content type")
                
        except Exception as e:
            logger.error(f"Error: {str(e)}")
            self.send_error(500, f"Internal server error: {str(e)}") 