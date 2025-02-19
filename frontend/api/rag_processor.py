from openai import OpenAI
import os
import numpy as np
from dotenv import load_dotenv
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Get API key from environment variable
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

class DocumentEnhancer:
    def __init__(self):
        self.client = OpenAI(api_key=api_key)
        self.model_name = "gpt-3.5-turbo"
        logger.info("DocumentEnhancer initialized successfully")
    
    def enhance_document(self, document_text: str, subject_area: str = None) -> str:
        # Execute enhancement using the model
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": """You are an expert educator enhancing worksheets with climate change concepts.
                FORMATTING REQUIREMENTS:
                1. Use double asterisks for all headers:
                   - Main headers/titles: Wrap in double asterisks **like this**
                   - Section headers: Also wrap in double asterisks **like this**
                   
                2. Format structure:
                   **Main Title**
                   [blank line]
                   **Section Header**
                   [blank line]
                   Content
                   [blank line]
                   
                3. For questions:
                   - Start with the number and period (e.g., "1. ")
                   - Put climate-related additions in simple parentheses
                   - One question per line
                   - Add a blank line between questions
                   
                4. Links:
                   - Write as plain text without brackets
                   - Start with http:// or https://
                   
                Example format:
                **Plant Biology Worksheet**
                
                **Introduction**
                
                1. What is photosynthesis? (How does this process help regulate atmospheric CO2?)
                
                2. Describe cell structure. (How do cellular adaptations help plants cope with climate change?)"""},
                {"role": "system", "content": """Now enhance the following worksheet using similar patterns of climate integration.
                REQUIREMENTS:
                1. Keep the original content and structure
                2. Add climate connections in parentheses
                3. Maintain the academic rigor
                4. Add 1-2 climate-related questions at the end
                5. Remember: Use **double asterisks** for ALL headers"""},
                {"role": "user", "content": f"Enhance this worksheet:\n\n{document_text}"}
            ]
        )
        
        return response.choices[0].message.content 