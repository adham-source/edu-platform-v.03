# Base image: Node.js on Alpine Linux
FROM node:22.20.0-alpine

# Install system dependencies: ffmpeg for transcoding, wget for downloading
RUN apk add --no-cache ffmpeg wget

# Set up Shaka Packager
# Define the version and the URL
ENV SHAKA_PACKAGER_VERSION=v2.6.1
ENV SHAKA_PACKAGER_URL=https://github.com/shaka-project/shaka-packager/releases/download/${SHAKA_PACKAGER_VERSION}/packager-linux-x64

# Download, rename, and make Shaka Packager executable
RUN wget -q -O /usr/local/bin/shaka-packager ${SHAKA_PACKAGER_URL} && \
    chmod +x /usr/local/bin/shaka-packager

# Set up the application directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Command to run the service
CMD [ "node", "dist/index.js" ]
