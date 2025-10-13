# Use a Node.js base image
FROM node:22.20.0-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend application
COPY . ./

# Build the React app
RUN npm run build
RUN ls -l dist

# Serve the app with Nginx (or a simple static server)
# For simplicity, we'll use serve for now
RUN npm install -g serve

EXPOSE 5173
CMD [ "serve", "-s", "dist", "-l", "5173" ]
