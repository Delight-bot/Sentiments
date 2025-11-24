# Use Node.js LTS version with Debian (better for native dependencies)
FROM node:20-bookworm

# Install system dependencies for canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Install ffmpeg for video processing
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema first (if exists)
COPY prisma ./prisma/

# Generate Prisma Client (if prisma schema exists)
RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; fi

# Copy the rest of the application
COPY . .

# Expose the port your backend runs on
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
