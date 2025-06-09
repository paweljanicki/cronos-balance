# Use Node.js LTS version
FROM node:22-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 