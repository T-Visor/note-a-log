#!/bin/bash

# Start FastAPI in the background
cd /app/backend && uvicorn app:app --host 0.0.0.0 --port 8000 &

# Start Next.js
cd /app && npm start
