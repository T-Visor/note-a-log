# Stage 1: Build
FROM node:18-bullseye AS builder

WORKDIR /app

# Copy and install Node dependencies
COPY ./package.json ./package-lock.json ./
RUN npm ci

# Copy all files and build the app
COPY . .
RUN npm rebuild better-sqlite3
RUN npm run build

# Stage 2: Production
FROM node:18-bullseye AS production

WORKDIR /app

# Copy only what is needed for production
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN npm ci --only=production && \
    npm rebuild better-sqlite3

# Optional: create a data directory
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["npm", "start"]
