FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
RUN npm install --legacy-peer-deps

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Copy source code
COPY apps/backend ./apps/backend
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:dev"]
