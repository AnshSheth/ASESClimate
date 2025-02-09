from pypdf import PdfReader
import docx2txt
import os
import json

def convert_pdf_to_text(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def convert_docx_to_text(docx_path):
    text = docx2txt.process(docx_path)
    return text

def create_training_pair(original_path, enhanced_path):
    """Create a training pair from original and enhanced worksheets"""
    # Determine file type and convert accordingly
    if original_path.endswith('.pdf'):
        original_text = convert_pdf_to_text(original_path)
    elif original_path.endswith('.docx'):
        original_text = convert_docx_to_text(original_path)
    
    if enhanced_path.endswith('.pdf'):
        enhanced_text = convert_pdf_to_text(enhanced_path)
    elif enhanced_path.endswith('.docx'):
        enhanced_text = convert_docx_to_text(enhanced_path)
    
    return {
        "messages": [
            {
                "role": "system",
                "content": "You are an expert at enhancing educational worksheets by integrating climate change concepts while maintaining the original subject's learning objectives."
            },
            {
                "role": "user",
                "content": original_text
            },
            {
                "role": "assistant",
                "content": enhanced_text
            }
        ]
    }

def process_worksheet_pairs():
    """Process all worksheet pairs in the worksheets directory"""
    training_examples = []
    
    # Assuming you have a directory structure like:
    # worksheets/
    #   original/
    #     worksheet1.pdf
    #     worksheet2.docx
    #   enhanced/
    #     worksheet1.pdf
    #     worksheet2.docx
    
    worksheets_dir = "worksheets"
    original_dir = os.path.join(worksheets_dir, "original")
    enhanced_dir = os.path.join(worksheets_dir, "enhanced")
    
    for filename in os.listdir(original_dir):
        original_path = os.path.join(original_dir, filename)
        enhanced_path = os.path.join(enhanced_dir, filename)
        
        if os.path.exists(enhanced_path):
            example = create_training_pair(original_path, enhanced_path)
            training_examples.append(example)
    
    # Write to JSONL file
    with open('training_data.jsonl', 'w') as f:
        for example in training_examples:
            f.write(json.dumps(example) + '\n')

if __name__ == "__main__":
    process_worksheet_pairs() 