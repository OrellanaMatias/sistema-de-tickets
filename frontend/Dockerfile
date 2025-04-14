FROM node:18-alpine

WORKDIR /app

# Copiar archivos de proyecto
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY .npmrc ./
COPY index.html ./
COPY src ./src
COPY public ./public

# Instalar dependencias
RUN npm install

# Variable de entorno para Vite
ENV HOST=0.0.0.0
ENV PORT=5173

# Exponer puerto
EXPOSE 5173

# Iniciar servidor de desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 