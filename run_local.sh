#!/bin/bash

# Function to handle cleanup on script exit
cleanup() {
    echo "Cleaning up..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up cleanup on script exit
trap cleanup EXIT

# Create Python virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install

# Start the development servers
echo "Starting development servers..."

# Start the frontend development server
echo "Starting frontend on http://localhost:3000"
npm run dev &

# Start the Python API server
echo "Starting API server on http://localhost:3002"
cd api
PYTHONPATH=$PYTHONPATH:$(pwd) uvicorn enhance:app --reload --host 0.0.0.0 --port 3002 &
cd ..

echo "✨ Development servers are running!"
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:3002"
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
wait 