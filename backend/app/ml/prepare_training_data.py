import json
import docx2txt
from pypdf import PdfReader
import os

def convert_document_to_text(file_path):
    if file_path.endswith('.pdf'):
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    elif file_path.endswith('.docx'):
        return docx2txt.process(file_path)
    return None

def create_training_data():
    training_examples = []
    
    # Directory structure:
    # worksheets/
    #   regular/          
    #     biology/        # Regular biology worksheets
    #   climate_integrated/    
    #     biology/        # Climate-integrated biology worksheets
    
    base_dir = "worksheets"
    regular_dir = os.path.join(base_dir, "regular", "biology")
    climate_dir = os.path.join(base_dir, "climate_integrated", "biology")
    
    # Get examples from each directory
    regular_examples = []
    climate_examples = []
    
    # Get regular worksheets
    if os.path.exists(regular_dir):
        for file in os.listdir(regular_dir):
            if file.endswith(('.pdf', '.docx')):
                text = convert_document_to_text(os.path.join(regular_dir, file))
                if text:
                    regular_examples.append(text)
    
    # Get climate-integrated worksheets
    if os.path.exists(climate_dir):
        for file in os.listdir(climate_dir):
            if file.endswith(('.pdf', '.docx')):
                text = convert_document_to_text(os.path.join(climate_dir, file))
                if text:
                    climate_examples.append(text)
    
    # Create training pairs
    for reg_text in regular_examples:
        for climate_text in climate_examples:
            training_examples.append({
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert at enhancing biology worksheets by integrating climate change concepts. Analyze this biology worksheet without climate integration, and the example of a climate-integrated biology worksheet to learn the pattern of integration."
                    },
                    {
                        "role": "user",
                        "content": f"Regular worksheet:\n{reg_text}\n\nExample of climate integration:\n{climate_text}\n\nNow enhance this worksheet with climate concepts:"
                    },
                    {
                        "role": "assistant",
                        "content": climate_text
                    }
                ]
            })
    
    # Write to JSONL file
    with open('training_data.jsonl', 'w') as f:
        for example in training_examples:
            f.write(json.dumps(example) + '\n')

if __name__ == "__main__":
    create_training_data() 