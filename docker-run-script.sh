#!/bin/sh

# Build the container locally
docker build --no-cache -t my-nextjs-app .

# Run the container
#docker run -p 3000:3000 -v $(pwd)/data/notesApp.db:/data/notesApp.db my-nextjs-app
#docker run -p 3000:3000 -p 8000:8000 --add-host=host.docker.internal:host-gateway -v $(pwd)/data/notesApp.db:/app/data/notesApp.db my-nextjs-app
docker run -d --network note-a-log-network --env-file .env.docker -p 3000:3000 -p 8000:8000 -v $(pwd)/data/notesApp.db:/app/data/notesApp.db my-nextjs-app

# Run ollama
docker run -d --network note-a-log-network -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
