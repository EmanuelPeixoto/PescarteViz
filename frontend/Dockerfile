FROM node:22-slim

WORKDIR /app

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install
RUN npm install chartjs-plugin-annotation --save

# Copy all application files
COPY . .

EXPOSE 3000

# Use development server with polling for better performance in Docker
CMD ["npm", "start"]
