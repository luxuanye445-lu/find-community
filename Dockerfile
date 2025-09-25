FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install deps first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Expose port & run
EXPOSE 3000
CMD ["npm","start"]