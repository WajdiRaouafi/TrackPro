# --------- Builder (compile Vite) ---------
FROM node:20-alpine AS build
WORKDIR /app

# Installe les deps en cache
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copie du code
COPY . .

# Passe les variables Vite au build (préfixe VITE_)
ARG VITE_BACKEND_URL=http://localhost:3000
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Build de production (dist/)
RUN npm run build

# --------- Runner (nginx) ---------
FROM nginx:1.27-alpine AS runner

# Remplace la conf par défaut de nginx (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie les fichiers statiques construits
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
