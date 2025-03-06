from http.server import BaseHTTPRequestHandler
import json
import io
import logging
from pypdf import PdfReader
from rag_processor import DocumentEnhancer
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize RAG processor
document_enhancer = DocumentEnhancer()

# Constants
ALLOWED_EXTENSIONS = {'.pdf', '.docx'}

def parse_multipart_form(content_type, body):
    """Parse multipart form data to extract file content and filename"""
    try:
        boundary = content_type.split('=')[1].strip()
        parts = body.split(f'--{boundary}'.encode())
        
        file_content = None
        filename = None
        
        for part in parts:
            if b'filename=' in part:
                # Extract filename
                filename_start = part.find(b'filename="') + 10
                filename_end = part.find(b'"', filename_start)
                filename = part[filename_start:filename_end].decode('utf-8')
                
                # Extract file content
                content_start = part.find(b'\r\n\r\n') + 4
                file_content = part[content_start:]
                break
                
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
        
        # Process with RAG
        try:
            enhanced_content = document_enhancer.enhance_document(document_text)
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

def handler(event, context):
    """Main handler function for Vercel serverless function"""
    logger.info(f"Received request: {event.get('method')} {event.get('path')}")
    
    # Handle OPTIONS request (CORS preflight)
    if event.get('method') == 'OPTIONS':
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Accept",
                "Access-Control-Max-Age": "86400"
            },
            "body": ""
        }
    
    # Handle POST request
    if event.get('method') == 'POST':
        try:
            # Get content type
            content_type = event.get('headers', {}).get('content-type', '')
            
            # Check if it's a multipart form
            if not content_type.startswith('multipart/form-data'):
                return {
                    "statusCode": 400,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": json.dumps({"error": "Expected multipart/form-data"})
                }
            
            # Get request body
            body = event.get('body', b'')
            if isinstance(body, str):
                body = body.encode('utf-8')
            
            # Parse multipart form data
            file_content, filename = parse_multipart_form(content_type, body)
            
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