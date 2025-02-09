import json

def create_validation_data():
    validation_examples = [
        {
            "messages": [
                {"role": "system", "content": "You are an expert educator who enhances educational content."},
                {"role": "user", "content": "Please enhance this physics content:\n\nF = ma is Newton's Second Law"},
                {"role": "assistant", "content": "Let me enhance your understanding of Newton's Second Law (F = ma)!\n\nThis fundamental law of physics states that Force (F) equals mass (m) times acceleration (a). Here's why it's amazing:\n\n1. It's the foundation of classical mechanics\n2. Real-world examples:\n   - When you push a shopping cart (more mass = more force needed)\n   - Rocket launches (massive thrust force creates acceleration)\n   - Car safety features (understanding impact forces)\n\nThink of it as a mathematical relationship between how hard you push (force), what you're pushing (mass), and how quickly it speeds up (acceleration)!"}
            ]
        }
        # Add more validation examples...
    ]
    
    with open('validation_data.jsonl', 'w') as f:
        for example in validation_examples:
            f.write(json.dumps(example) + '\n')

if __name__ == "__main__":
    create_validation_data() 