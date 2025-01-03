#!/bin/sh

# Build the container locally
docker build --no-cache -t my-nextjs-app .

# Run the container
docker run -p 3000:3000 -v $(pwd)/data/notesApp.db:/data/notesApp.db my-nextjs-app
