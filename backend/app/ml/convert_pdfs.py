from pathlib import Path
from pypdf import PdfReader
import os

def convert_pdf_to_text(pdf_path: Path, output_dir: Path) -> None:
    """Convert a PDF file to text and save it"""
    try:
        # Read PDF
        reader = PdfReader(pdf_path)
        content = ""
        
        # Extract text from each page
        for page in reader.pages:
            content += page.extract_text() + "\n"
            
        if not content.strip():
            print(f"Warning: No text content extracted from {pdf_path}")
            return
            
        # Create output filename
        output_path = output_dir / f"{pdf_path.stem}.txt"
        
        # Save text content
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)
            
        print(f"Successfully converted {pdf_path} to {output_path}")
            
    except Exception as e:
        print(f"Error converting {pdf_path}: {str(e)}")

def main():
    # Define directories
    pdf_dir = Path("worksheets/climate_integrated/biology")
    txt_dir = Path("worksheets/climate_integrated/biology/text")
    
    # Create text directory if it doesn't exist
    txt_dir.mkdir(parents=True, exist_ok=True)
    
    # Convert all PDFs
    for pdf_path in pdf_dir.glob("*.pdf"):
        convert_pdf_to_text(pdf_path, txt_dir)

if __name__ == "__main__":
    main() 