from openai import OpenAI
import os
from dotenv import load_dotenv
import json
import time

load_dotenv()

api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

client = OpenAI(api_key=api_key)

def validate_training_data(file_path: str):
    """Validate that training data is properly formatted"""
    with open(file_path, 'r') as f:
        for i, line in enumerate(f, 1):
            try:
                entry = json.loads(line)
                if not isinstance(entry, dict) or 'messages' not in entry:
                    raise ValueError(f"Line {i}: Each entry must have a 'messages' field")
                messages = entry['messages']
                if not isinstance(messages, list) or len(messages) < 2:
                    raise ValueError(f"Line {i}: 'messages' must be a list with at least 2 messages")
                if not all(isinstance(m, dict) and 'role' in m and 'content' in m for m in messages):
                    raise ValueError(f"Line {i}: Each message must have 'role' and 'content' fields")
            except json.JSONDecodeError:
                raise ValueError(f"Line {i}: Invalid JSON format")
    return True

def start_finetuning():
    training_file_path = "training_data.jsonl"
    
    # Validate training data
    print("Validating training data...")
    validate_training_data(training_file_path)
    
    # Upload training file
    print("Uploading training file...")
    training_file = client.files.create(
        file=open(training_file_path, "rb"),
        purpose="fine-tune"
    )
    
    # Wait for file to be processed
    print("Waiting for file processing...")
    while True:
        file_status = client.files.retrieve(training_file.id)
        if file_status.status == "processed":
            break
        time.sleep(1)
    
    # Create fine-tuning job
    print("Starting fine-tuning job...")
    job = client.fine_tuning.jobs.create(
        training_file=training_file.id,
        model="gpt-3.5-turbo",
        hyperparameters={
            "n_epochs": 8,  # Increased epochs for better learning
            "batch_size": 3,  # Small batch size since we have few examples
            "learning_rate_multiplier": 1.6  # Slightly higher learning rate
        }
    )
    
    print(f"Fine-tuning job created: {job.id}")
    
    # Monitor job progress
    while True:
        job_status = client.fine_tuning.jobs.retrieve(job.id)
        print(f"Status: {job_status.status}")
        if job_status.status in ["succeeded", "failed"]:
            if job_status.status == "succeeded":
                print(f"Fine-tuning complete! New model ID: {job_status.fine_tuned_model}")
                # Update the model name in rag_processor.py
                update_model_name(job_status.fine_tuned_model)
            else:
                print(f"Fine-tuning failed: {job_status.error}")
            break
        time.sleep(30)  # Check every 30 seconds

def update_model_name(new_model_id: str):
    """Update the model name in rag_processor.py"""
    rag_file = "app/ml/rag_processor.py"
    with open(rag_file, 'r') as f:
        content = f.read()
    
    # Update the model name
    updated_content = content.replace(
        'self.model_name = "gpt-3.5-turbo"',
        f'self.model_name = "{new_model_id}"'
    )
    
    with open(rag_file, 'w') as f:
        f.write(updated_content)
    print(f"Updated model name in {rag_file}")

if __name__ == "__main__":
    start_finetuning() 