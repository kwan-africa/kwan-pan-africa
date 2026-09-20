FROM node:20-alpine

WORKDIR /app

# Copy dependency definitions
COPY kwan-web-app/package*.json ./kwan-web-app/
COPY server/package*.json ./server/

# Install dependencies
RUN cd kwan-web-app && npm install
RUN cd server && npm install

# Copy application source
COPY kwan-web-app ./kwan-web-app
COPY server ./server

# Build frontend into kwan-web-app/dist
RUN cd kwan-web-app && npm run build

WORKDIR /app/server

ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "server.js"]
