from http.server import BaseHTTPRequestHandler
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import json
import io
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_pdf(content: str) -> bytes:
    try:
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        y = height - 40
        
        c.setFont("Helvetica-Bold", 16)
        
        lines = content.split('\n')
        for line in lines:
            if not line.strip():
                y -= 15
                continue
                
            # Handle double asterisk sections (smaller headers)
            if line.startswith('**') and line.endswith('**'):
                c.setFont("Helvetica-Bold", 14)
                text = line.replace('**', '')
                c.drawString(40, y, text)
                y -= 25  # More spacing after headers
                c.setFont("Helvetica", 12)  # Reset font
                
            # Handle single asterisk sections (major headers)
            elif line.startswith('*') and line.endswith('*'):
                c.setFont("Helvetica-Bold", 16)
                text = line.replace('*', '')
                c.drawString(40, y, text)
                y -= 30  # More spacing after major headers
                c.setFont("Helvetica", 12)  # Reset font
                
            # Handle questions (lines starting with numbers)
            elif line.strip() and line[0].isdigit() and '. ' in line:
                c.setFont("Helvetica", 12)
                # Wrap long lines
                words = line.split()
                current_line = []
                x = 40
                
                for word in words:
                    current_line.append(word)
                    if c.stringWidth(' '.join(current_line)) > width - 80:
                        c.drawString(x, y, ' '.join(current_line[:-1]))
                        y -= 15
                        current_line = [word]
                        x = 60  # Indent continuation lines
                
                if current_line:
                    c.drawString(x, y, ' '.join(current_line))
                y -= 20  # More spacing after questions
                
            # Regular text
            else:
                c.setFont("Helvetica", 12)
                # Wrap long lines
                words = line.split()
                current_line = []
                
                for word in words:
                    current_line.append(word)
                    if c.stringWidth(' '.join(current_line)) > width - 80:
                        c.drawString(40, y, ' '.join(current_line[:-1]))
                        y -= 15
                        current_line = [word]
                
                if current_line:
                    c.drawString(40, y, ' '.join(current_line))
                y -= 15
            
            # Check if we need a new page
            if y < 40:
                c.showPage()
                y = height - 40
                c.setFont("Helvetica", 12)  # Reset font for new page
        
        c.save()
        buffer.seek(0)
        return buffer.getvalue()
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise Exception(f"Error generating PDF: {str(e)}")

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')
        self.send_header('Access-Control-Max-Age', '86400')  # 24 hours
        self.end_headers()
    
    def do_POST(self):
        try:
            # Get content length
            content_length = int(self.headers['Content-Length'])
            
            # Read request body
            request_body = self.rfile.read(content_length)
            
            # Parse JSON content
            try:
                content = request_body.decode('utf-8')
                logger.info(f"Received content for PDF generation, length: {len(content)}")
                
                # Generate PDF
                pdf_content = create_pdf(content)
                
                # Send response
                self.send_response(200)
                self.send_header('Content-Type', 'application/pdf')
                self.send_header('Content-Disposition', 'attachment; filename=enhanced_worksheet.pdf')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(len(pdf_content)))
                self.end_headers()
                
                # Write PDF content
                self.wfile.write(pdf_content)
                logger.info("PDF generated and sent successfully")
                
            except json.JSONDecodeError:
                logger.error("Invalid JSON in request body")
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
                
        except Exception as e:
            logger.error(f"Error handling request: {str(e)}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode()) 