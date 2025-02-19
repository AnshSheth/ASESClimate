from http.server import BaseHTTPRequestHandler
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import json
import io

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
                
            if line.startswith('**') and line.endswith('**'):
                c.setFont("Helvetica-Bold", 14)
                text = line.replace('**', '')
                c.drawString(40, y, text)
                y -= 25
                c.setFont("Helvetica", 12)
                
            elif line.strip() and line[0].isdigit() and '. ' in line:
                c.setFont("Helvetica", 12)
                words = line.split()
                current_line = []
                x = 40
                
                for word in words:
                    current_line.append(word)
                    if c.stringWidth(' '.join(current_line)) > width - 80:
                        c.drawString(x, y, ' '.join(current_line[:-1]))
                        y -= 15
                        current_line = [word]
                        x = 60
                
                if current_line:
                    c.drawString(x, y, ' '.join(current_line))
                y -= 20
                
            else:
                c.setFont("Helvetica", 12)
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
            
            if y < 40:
                c.showPage()
                y = height - 40
                c.setFont("Helvetica", 12)
        
        c.save()
        buffer.seek(0)
        return buffer.getvalue()
    except Exception as e:
        raise Exception(f"Error generating PDF: {str(e)}")

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()
        
    def do_POST(self):
        try:
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))
            
            # Read and parse JSON body
            body = self.rfile.read(content_length)
            content = json.loads(body)
            
            if not content or not isinstance(content, str):
                self.send_error(400, "Invalid content format")
                return
                
            # Generate PDF
            pdf_content = create_pdf(content)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/pdf')
            self.send_header('Content-Disposition', 'attachment; filename=enhanced_worksheet.pdf')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(pdf_content)
            
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON format")
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}") 