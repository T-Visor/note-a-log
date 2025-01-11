#!/bin/sh

# Create the network for the containers to communicate
docker network create note-a-log-network

# Create a volume to hold the notes app data
docker volume create notesAppData

# Build the container locally
docker build --no-cache -t my-nextjs-app .

# Run the container for Note-a-log
docker run -d --network note-a-log-network --env-file .env.docker -p 3000:3000 -p 8000:8000 -v notesAppData:/app/data --name note-a-log my-nextjs-app

# Run Ollama
docker run -d --network note-a-log-network -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
docker exec ollama ollama pull llama3.1:8b-instruct-q3_K_S
