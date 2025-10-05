# ---------- Stage 1: Build the Vite React app ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy only package files first (cache optimization)
COPY package*.json ./
RUN npm install

# Copy rest of the project and build it
COPY . .
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:stable-alpine

# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output from Vite to Nginx public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 3000 (frontend)
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
