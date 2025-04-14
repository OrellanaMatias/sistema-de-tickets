FROM node:18-alpine

# Instalar herramientas necesarias
RUN apk add --no-cache mysql-client curl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Dar permisos de ejecución al script de espera
RUN chmod +x ./wait-for-mysql.sh

EXPOSE 3000

# Usar el script de espera para asegurar que MySQL esté disponible
CMD ["./wait-for-mysql.sh", "mysql", "npm", "run", "dev"] 