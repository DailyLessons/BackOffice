FROM node:18

WORKDIR /app

# Copier d'abord package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le reste du code source
COPY . .

EXPOSE 3000
CMD ["npm", "start"]