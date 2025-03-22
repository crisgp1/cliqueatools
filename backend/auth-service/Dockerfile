FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Instalar dependencias
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]