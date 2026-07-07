FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/src ./src
COPY backend/data ./data

ENV NODE_ENV=production

EXPOSE 10000

CMD ["node", "src/server.js"]
