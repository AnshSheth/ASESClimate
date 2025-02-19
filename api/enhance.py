from rag_processor import DocumentEnhancer
from pypdf import PdfReader
import json
import io
import logging
import os
from dotenv import load_dotenv
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any

# Runtime configuration
runtime = 'python3.9'
maxDuration = 30

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

def parse_multipart_formdata(request):
    """Parse multipart form data from request"""
    try:
        content_type = request.headers.get('content-type', '')
        if not content_type.startswith('multipart/form-data'):
            return None, "Invalid content type"
            
        # Get the boundary
        boundary = content_type.split('boundary=')[1].encode()
        body = request.body
        
        # Split parts
        parts = body.split(boundary)
        
        # Find the file part
        for part in parts:
            if b'filename=' in part:
                # Get headers and content
                headers, content = part.split(b'\r\n\r\n', 1)
                headers = headers.decode()
                
                # Get filename
                if 'filename="' in headers:
                    filename = headers.split('filename="')[1].split('"')[0]
                else:
                    continue
                    
                # Get file content (remove last \r\n)
                file_content = content.rsplit(b'\r\n', 1)[0]
                
                return filename, file_content
                
        return None, "No file found in request"
    except Exception as e:
        logger.error(f"Error parsing multipart data: {str(e)}")
        return None, str(e)

def handler(request):
    if request.method == "OPTIONS":
        return {
            "status": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400"
            },
            "body": ""
        }
    
    if request.method == "GET":
        return {
            "status": 405,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({"error": "Method not allowed"})
        }
    
    if request.method == "POST":
        try:
            # Get form data
            form_data = request.form
            file = form_data.get("file")
            
            if not file:
                return {
                    "status": 400,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": json.dumps({"error": "No file received"})
                }
            
            filename = file.filename
            content = file.read()
            
            if not filename.lower().endswith('.pdf'):
                return {
                    "status": 400,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": json.dumps({"error": "Please upload a PDF file"})
                }
            
            # Process PDF
            try:
                pdf_file = io.BytesIO(content)
                pdf_reader = PdfReader(pdf_file)
                document_text = ""
                for page in pdf_reader.pages:
                    document_text += page.extract_text() + "\n"
                
                if not document_text.strip():
                    return {
                        "status": 400,
                        "headers": {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"
                        },
                        "body": json.dumps({"error": "Could not extract text from PDF"})
                    }
                
                # Process with RAG
                enhanced_content = document_enhancer.enhance_document(
                    document_text,
                    "biology"  # Default subject
                )
                
                return {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "POST, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type"
                    },
                    "body": json.dumps({"enhanced_content": enhanced_content})
                }
                
            except Exception as e:
                logging.error(f"Error processing PDF: {str(e)}")
                return {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": json.dumps({"error": f"Error processing PDF: {str(e)}"})
                }
                
        except Exception as e:
            logging.error(f"Error: {str(e)}")
            return {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({"error": f"Internal server error: {str(e)}"})
            }
    
    # If we get here, it's an unsupported method
    return {
        "status": 405,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": json.dumps({"error": "Method not allowed"})
    } 