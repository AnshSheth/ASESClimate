from http.server import BaseHTTPRequestHandler
import json
import io
import logging
import base64
from pypdf import PdfReader
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    logger.error("OPENAI_API_KEY not found in environment variables")
else:
    logger.info("OpenAI API key loaded successfully")
openai_client = OpenAI(api_key=api_key)

# Constants
ALLOWED_EXTENSIONS = {'.pdf', '.docx'}

def enhance_document(document_text: str) -> str:
    """Process the document with OpenAI and return enhanced content"""
    try:
        # Execute enhancement using the model
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """You are an expert educator enhancing worksheets with climate change concepts.

STRICT REQUIREMENTS:
1. PRESERVE ALL ORIGINAL CONTENT EXACTLY AS IS
2. DO NOT ANSWER OR FILL IN ANY BLANKS IN THE WORKSHEET
3. DO NOT MODIFY EXISTING QUESTIONS OR CONTENT
4. ONLY ADD climate-related extensions in parentheses after existing questions
5. Keep all original formatting, blanks, and numbering

FORMATTING REQUIREMENTS:
1. Keep all original headers with double asterisks **like this**
2. Preserve all blank lines and spacing
3. Keep all original question numbers and formatting
4. Add climate-related content ONLY in parentheses after existing content
5. Preserve all blank spaces (___) in the original text

Example of correct enhancement:
Original:
**Cell Biology**
1. What is the function of mitochondria?
2. Draw and label the parts of a cell.

Enhanced:
**Cell Biology**
1. What is the function of mitochondria? (How might mitochondrial function be affected by rising temperatures due to climate change?)
2. Draw and label the parts of a cell. (Consider how cellular structures might adapt to environmental stresses from climate change)"""},
                {"role": "system", "content": """ENHANCEMENT RULES:
1. DO NOT remove or modify ANY original content
2. DO NOT fill in answers or blank spaces
3. DO NOT add new questions (except optional climate-specific questions at the very end)
4. ONLY add climate-related content in parentheses
5. Keep ALL original formatting, including:
   - Blank spaces (___)
   - Question numbers
   - Section headers
   - Line breaks
   - URLs
   - Instructions"""},
                {"role": "user", "content": f"Enhance this worksheet by adding climate-related extensions in parentheses while preserving ALL original content exactly:\n\n{document_text}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error in enhance_document: {str(e)}")
        raise

def parse_multipart_form(body, content_type):
    """Parse multipart form data to extract file content and filename"""
    try:
        # Extract boundary
        boundary = None
        for part in content_type.split(';'):
            part = part.strip()
            if part.startswith('boundary='):
                boundary = part[9:]
                if boundary.startswith('"') and boundary.endswith('"'):
                    boundary = boundary[1:-1]
                break
        
        if not boundary:
            logger.error("No boundary found in content-type")
            return None, None
            
        # Decode body if it's base64 encoded
        if isinstance(body, str):
            try:
                body = base64.b64decode(body)
            except:
                body = body.encode('utf-8')
                
        # Split by boundary
        boundary_bytes = f'--{boundary}'.encode()
        parts = body.split(boundary_bytes)
        
        # Find file part
        file_content = None
        filename = None
        
        for part in parts:
            if b'filename=' in part:
                # Extract filename
                filename_start = part.find(b'filename="') + 10
                if filename_start > 9:  # Make sure "filename=" was found
                    filename_end = part.find(b'"', filename_start)
                    filename = part[filename_start:filename_end].decode('utf-8')
                    
                    # Extract file content
                    content_start = part.find(b'\r\n\r\n') + 4
                    if content_start > 3:  # Make sure "\r\n\r\n" was found
                        file_content = part[content_start:part.rfind(b'\r\n')]
                        break
        
        logger.info(f"Parsed file: {filename}, content length: {len(file_content) if file_content else 0}")
        return file_content, filename
    except Exception as e:
        logger.error(f"Error parsing multipart form: {str(e)}")
        return None, None

def process_document(file_content, filename):
    """Process the document and return enhanced content"""
    try:
        # Validate file extension
        file_ext = '.' + filename.split('.')[-1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": f"File type not allowed. Please upload one of: {', '.join(ALLOWED_EXTENSIONS)}"})
            }
        
        # Process PDF files
        if filename.endswith('.pdf'):
            try:
                pdf_file = io.BytesIO(file_content)
                pdf_reader = PdfReader(pdf_file)
                document_text = ""
                for page in pdf_reader.pages:
                    document_text += page.extract_text() + "\n"
                logger.info(f"Extracted text from PDF, length: {len(document_text)}")
            except Exception as e:
                logger.error(f"Error reading PDF: {str(e)}")
                return {
                    "statusCode": 400,
                    "body": json.dumps({"error": f"Error reading PDF file: {str(e)}"})
                }
        # Process DOCX files (simplified for this example)
        elif filename.endswith('.docx'):
            try:
                document_text = file_content.decode('utf-8')
                logger.info(f"Extracted text from DOCX, length: {len(document_text)}")
            except UnicodeDecodeError:
                logger.error("Error decoding DOCX file")
                return {
                    "statusCode": 400,
                    "body": json.dumps({"error": "Error reading DOCX file. Please ensure it's a valid document."})
                }
        else:
            logger.warning(f"Unsupported file format: {filename}")
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Unsupported file format. Please upload a PDF or DOCX file."})
            }
        
        # Process with OpenAI
        try:
            enhanced_content = enhance_document(document_text)
            logger.info("Document enhancement successful")
            return {
                "statusCode": 200,
                "body": json.dumps({"enhanced_content": enhanced_content})
            }
        except Exception as e:
            logger.error(f"Error enhancing document: {str(e)}")
            return {
                "statusCode": 500,
                "body": json.dumps({"error": f"Error enhancing document: {str(e)}"})
            }
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"An unexpected error occurred: {str(e)}"})
        }

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()
    
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            content_type = self.headers.get('Content-Type', '')
            
            # Read request body
            body = self.rfile.read(content_length)
            
            # Check if it's a multipart form
            if not content_type.startswith('multipart/form-data'):
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Expected multipart/form-data"}).encode())
                return
            
            # Parse multipart form data
            file_content, filename = parse_multipart_form(body, content_type)
            
            if not file_content or not filename:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "No file found in request"}).encode())
                return
            
            # Process the document
            result = process_document(file_content, filename)
            
            # Send response
            self.send_response(result.get('statusCode', 500))
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(result.get('body', '').encode())
            
        except Exception as e:
            logger.error(f"Error handling request: {str(e)}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

# Vercel serverless function handler
def handler(request):
    logger.info("Vercel handler function called")
    
    # Handle OPTIONS request (CORS preflight)
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization",
            "Access-Control-Max-Age": "86400"
        }
        return {"statusCode": 200, "headers": headers, "body": ""}
    
    # Handle POST request
    if request.method == "POST":
        try:
            # Get content type
            content_type = request.headers.get("content-type", "")
            
            # Get request body
            body = request.body
            
            # Parse multipart form data
            file_content, filename = parse_multipart_form(body, content_type)
            
            if not file_content or not filename:
                return {
                    "statusCode": 400,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": json.dumps({"error": "No file found in request"})
                }
            
            # Process the document
            result = process_document(file_content, filename)
            
            # Add CORS headers to response
            result["headers"] = {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error handling request: {str(e)}")
            return {
                "statusCode": 500,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({"error": str(e)})
            }
    
    # Handle unsupported methods
    return {
        "statusCode": 405,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({"error": "Method not allowed"})
    } 