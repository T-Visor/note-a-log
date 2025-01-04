# Use Node.js image with Python for building the application
FROM node:18-bullseye AS builder
# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app
# Copy package files and install Node dependencies
COPY ./package.json ./package-lock.json ./
RUN npm ci
RUN npm rebuild better-sqlite3
COPY . .
RUN npm run build

# Production-ready image
FROM node:18-bullseye AS production
# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app
# Copy only the necessary files from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install Node production dependencies and rebuild better-sqlite3
RUN npm ci --only=production && \
    npm rebuild better-sqlite3

# Copy and set up Python backend
COPY ./backend ./backend
WORKDIR /app/backend
RUN pip3 install -r requirements.txt
WORKDIR /app

# Create the data directory
RUN mkdir -p data

# Copy a startup script
COPY start-services.sh .
RUN chmod +x start-services.sh

EXPOSE 3000
EXPOSE 8000

# Use the startup script to run both services
CMD ["./start-services.sh"]
