FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build frontend
RUN npm run build

# Expose backend port
EXPOSE 3001

# Start Server
CMD ["node", "server.js"]
