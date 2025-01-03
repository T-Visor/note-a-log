# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) first to leverage Docker's cache
COPY ./package.json ./package-lock.json ./

# Install dependencies (including Shadcn or any other dependencies)
RUN npm install

# Copy the entire project to the container
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 3000 for Next.js
EXPOSE 3000

# Command to start the Next.js server
CMD ["npm", "start"]
