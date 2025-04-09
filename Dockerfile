FROM node:22-slim

# Set the working directory
WORKDIR /app

# Install dependencies: ffmpeg, python, pip, venv
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Setup virtual environment & install yt-dlp
RUN python3 -m venv /opt/venv \
    && . /opt/venv/bin/activate \
    && pip install --upgrade pip \
    && pip install yt-dlp

ENV PATH="/opt/venv/bin:$PATH"

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code and build the app
COPY . .
RUN npm run build

ENV NODE_ENV=production

CMD ["npm", "start"]