from openai import OpenAI
from dotenv import load_dotenv
import os
import numpy as np
from pathlib import Path
import json
from pypdf import PdfReader
from io import BytesIO

load_dotenv()

class DocumentStore:
    def __init__(self):
        self.embeddings = []  # List of (embedding, content) tuples
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    def add_document(self, content: str):
        """Add a document to the store with its embedding"""
        embedding = self.client.embeddings.create(
            model="text-embedding-ada-002",
            input=content
        ).data[0].embedding
        self.embeddings.append((embedding, content))
    
    def find_similar(self, query: str, n: int = 3) -> list[str]:
        """Find n most similar documents to the query"""
        query_embedding = self.client.embeddings.create(
            model="text-embedding-ada-002",
            input=query
        ).data[0].embedding
        
        # Calculate cosine similarity
        similarities = []
        for doc_embedding, content in self.embeddings:
            similarity = np.dot(query_embedding, doc_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding)
            )
            similarities.append((similarity, content))
        
        # Return top n most similar documents
        similarities.sort(reverse=True)
        return [content for _, content in similarities[:n]]

class DocumentEnhancer:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.model_name = "gpt-3.5-turbo"
        self.doc_store = DocumentStore()
        self._load_examples()
    
    def _load_examples(self):
        """Load climate-integrated examples into the document store"""
        examples_dir = Path("worksheets/climate_integrated/biology")
        if not examples_dir.exists():
            print("Warning: No examples directory found")
            return
            
        # Load and store each example
        for file_path in examples_dir.glob("*.pdf"):
            try:
                # Read PDF and extract text
                reader = PdfReader(file_path)
                content = ""
                for page in reader.pages:
                    content += page.extract_text() + "\n"
                
                if content.strip():  # Only add if we got some content
                    self.doc_store.add_document(content)
                    print(f"Loaded example from {file_path}")
                else:
                    print(f"Warning: No text content extracted from {file_path}")
            except Exception as e:
                print(f"Error loading {file_path}: {str(e)}")
    
    def analyze_document(self, document_text: str) -> dict:
        """Analyze the document to determine subject and content type"""
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert at identifying educational content and its subject area. Be very specific about the topic (e.g., 'Plant Biology - Chloroplast Structure and Function' rather than just 'Biology')."},
                {"role": "user", "content": document_text}
            ]
        )
        return {
            "subject": response.choices[0].message.content,
            "document_type": "worksheet"
        }
    
    def enhance_document(self, document_text: str, subject_area: str = None) -> str:
        # Analyze document if subject not provided
        if not subject_area:
            analysis = self.analyze_document(document_text)
            subject_area = analysis["subject"]
        
        # Find similar climate-integrated examples
        similar_examples = self.doc_store.find_similar(document_text)
        
        # Create a prompt that includes the examples
        examples_text = "\n\n---\n\n".join(similar_examples)
        
        # Execute enhancement using the model with examples
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": """You are an expert educator enhancing worksheets with climate change concepts.
                Study these example climate-integrated worksheets to understand the patterns and style of integration:"""},
                {"role": "user", "content": f"Example climate-integrated worksheets:\n\n{examples_text}"},
                {"role": "system", "content": """Now enhance the following worksheet using similar patterns of climate integration.
                REQUIREMENTS:
                1. Keep the original content and structure
                2. Add climate connections in a similar style to the examples
                3. Maintain the academic rigor and educational objectives
                4. Use parenthetical additions for climate connections
                5. Add 1-2 climate-related questions at the end"""},
                {"role": "user", "content": f"Enhance this worksheet:\n\n{document_text}"}
            ]
        )
        
        return response.choices[0].message.content 