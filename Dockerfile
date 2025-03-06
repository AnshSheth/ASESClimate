# Use Node.js for the frontend
FROM node:18-alpine AS frontend

# Set working directory
WORKDIR /app

# Copy frontend files
COPY frontend/ ./frontend/

# Install dependencies and build frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Use Python for the backend
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy Python requirements
COPY requirements.txt .
COPY api/ ./api/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy built frontend from previous stage
COPY --from=frontend /app/frontend/.next ./.next
COPY --from=frontend /app/frontend/public ./public
COPY --from=frontend /app/frontend/package.json .

# Set environment variables
ENV NODE_ENV=production

# Start command
CMD ["python", "-m", "uvicorn", "api.enhance:app", "--host", "0.0.0.0", "--port", "3000"]
