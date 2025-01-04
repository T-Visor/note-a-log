# Use Node.js image for building the application
FROM node:18 AS builder
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm ci
# Rebuild better-sqlite3 to match the container's Node.js version
RUN npm rebuild better-sqlite3
COPY . .
RUN npm run build

# Production-ready image
FROM node:18 AS production
WORKDIR /app
# Copy only the necessary files from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install production dependencies and rebuild better-sqlite3
RUN npm ci --only=production && \
    npm rebuild better-sqlite3

# Create the data directory
RUN mkdir -p data

# Expose port 3000
EXPOSE 3000
# Command to start the server
CMD ["npm", "start"]
