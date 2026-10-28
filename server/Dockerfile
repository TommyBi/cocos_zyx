FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm ci --omit=dev
COPY src ./src

ENV NODE_ENV=production
EXPOSE 8080
CMD ["npm", "start"]
