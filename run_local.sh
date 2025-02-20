#!/bin/bash

# Function to handle cleanup on script exit
cleanup() {
    echo "Cleaning up..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up cleanup on script exit
trap cleanup EXIT

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Starting backend server..."
cd api
python3 -m uvicorn enhance:app --host 0.0.0.0 --port 3002 &
cd ..

echo "Starting frontend..."
cd frontend
npm run dev &

echo "Both servers are running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3002"
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
wait 