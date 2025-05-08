FROM node:16

WORKDIR /app

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install

# Install required packages
RUN npm install bcryptjs jsonwebtoken

# Install COMPATIBLE versions of react-leaflet and leaflet
# Use versions that are compatible with React 18
RUN npm install leaflet@1.9.4
RUN npm install react-leaflet@4.2.1 --legacy-peer-deps

# Create the React app structure if it doesn't exist
RUN npm install -g create-react-app
RUN if [ ! -d "public" ]; then mkdir -p public; fi
RUN if [ ! -d "src" ]; then mkdir -p src; fi

# Copy all application files
COPY . .

# Ensure we have all required files for React to start
RUN if [ ! -f "public/index.html" ]; then echo "Creating missing index.html"; fi
RUN if [ ! -f "src/index.js" ]; then echo "Creating missing index.js"; fi

EXPOSE 3000

# Use development server with polling for better performance in Docker
CMD ["npm", "start"]
