FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV PORT=8080
ENV DB_PATH=/app/data/game.sqlite

EXPOSE 8080
CMD ["node", "src/index.js"]
