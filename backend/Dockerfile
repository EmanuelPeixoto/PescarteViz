FROM node:16-slim

WORKDIR /app

COPY package*.json ./

# Install curl for healthchecks and other dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
