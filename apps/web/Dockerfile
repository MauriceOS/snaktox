FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY apps/web ./apps/web

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]