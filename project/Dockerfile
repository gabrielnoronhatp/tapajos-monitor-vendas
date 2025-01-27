# Etapa 1: Build
FROM node:18 AS builder

# Configurar diretório de trabalho
WORKDIR /app

# Copiar arquivos do projeto
COPY package.json package-lock.json ./
RUN npm install --force


COPY . .

# Build da aplicação Next.js
RUN npm run build

# Etapa 2: Produção
FROM node:18

# Configurar diretório de trabalho
WORKDIR /app

# Copiar arquivos necessários da etapa de build
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next


# Definir a porta do contêiner
EXPOSE 80

# Comando para iniciar o servidor Next.js
CMD ["npm", "start"]
