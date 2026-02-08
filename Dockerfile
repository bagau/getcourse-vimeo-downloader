FROM node:20-bullseye-slim

# Install ffmpeg/ffprobe for downloading and validation
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install server dependencies first for better layer caching
COPY spawn/package*.json ./spawn/
RUN npm ci --prefix ./spawn

# Copy remaining project files
COPY . .

# Ensure videos directory exists inside the image (host mount can override)
RUN mkdir -p /app/videos \
    && chown -R node:node /app

USER node

EXPOSE 3000
ENV PORT=3000

CMD ["node", "spawn/server.js"]
