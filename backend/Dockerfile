FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY .env .env

# ✅ Ensure export directory inside /app (not root /exports)
RUN mkdir -p /app/exports
RUN chmod -R 777 /app/exports

EXPOSE 4000
CMD ["node", "index.js"]
