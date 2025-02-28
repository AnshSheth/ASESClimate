from openai import OpenAI
import os
import numpy as np
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

class DocumentEnhancer:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
            
        self.client = OpenAI()
        self.model_name = "gpt-3.5-turbo"
    
    def enhance_document(self, document_text: str, subject_area: str = None) -> str:
        try:
            # Execute enhancement using the model
            response = self.client.chat.completions.create(
                model=self.model_name,
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
            print(f"Error in enhance_document: {str(e)}")
            raise 