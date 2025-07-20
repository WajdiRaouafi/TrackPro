# # ✅ Dockerfile for NestJS backend
# FROM node:18-alpine

# # Set working directory
# WORKDIR /usr/src/app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm install --production

# # Copy the rest of the application
# COPY . .

# # Build the app (if using TypeScript)
# RUN npm run build

# # Expose the port
# EXPOSE 3000

# # Run the app
# CMD ["node", "dist/main"]

# Backend Dockerfile (NestJS)
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

