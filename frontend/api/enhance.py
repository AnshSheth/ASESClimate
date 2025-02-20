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

# Initialize RAG processor
document_enhancer = DocumentEnhancer()

def handler(request, response):
    if request.method == 'OPTIONS':
        response.status = 200
        response.headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400'
        }
        return response

    if request.method != 'POST':
        response.status = 405
        response.headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
        return response.json({'error': 'Method not allowed'})

    try:
        form = request.form
        if not form or 'file' not in form:
            response.status = 400
            response.headers = {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
            return response.json({'error': 'No file uploaded'})

        file = form['file']
        content = file.read()

        # Process PDF
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PdfReader(pdf_file)
            document_text = ""
            for page in pdf_reader.pages:
                document_text += page.extract_text() + "\n"

            if not document_text.strip():
                response.status = 400
                response.headers = {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
                return response.json({'error': 'Could not extract text from PDF'})

            # Process with RAG
            enhanced_content = document_enhancer.enhance_document(
                document_text,
                "biology"  # Default subject
            )

            response.status = 200
            response.headers = {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': '*'
            }
            return response.json({'enhanced_content': enhanced_content})

        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            response.status = 500
            response.headers = {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
            return response.json({'error': f'Error processing PDF: {str(e)}'})

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        response.status = 500
        response.headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
        return response.json({'error': f'Internal server error: {str(e)}'}) 