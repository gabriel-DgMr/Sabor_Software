# Dockerfile multi-stage para aplicación completa Sabor

# Stage 1: Build del Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copiar package.json y package-lock.json del frontend
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente del frontend
COPY frontend/ ./

# Build de producción del frontend
RUN npm run build:prod

# Stage 2: Setup del Backend
FROM node:18-alpine AS backend-setup
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    dumb-init \
    tini

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copiar package.json y package-lock.json del backend
COPY backend/package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Stage 3: Producción
FROM node:18-alpine AS production
WORKDIR /app

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S sabor -u 1001

# Copiar dependencias del backend desde stage anterior
COPY --from=backend-setup --chown=sabor:nodejs /app/node_modules ./node_modules

# Copiar código del backend
COPY --chown=sabor:nodejs backend/ ./

# Copiar build del frontend a directorio estático del backend
COPY --from=frontend-build --chown=sabor:nodejs /app/frontend/dist ./public/dist

# Crear directorios necesarios con permisos correctos
RUN mkdir -p logs public/uploads/productos public/uploads/temp && \
    chown -R sabor:nodejs logs public/uploads

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Exponer puerto
EXPOSE 3000

# Cambiar a usuario no-root
USER sabor

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node scripts/health-check.js || exit 1

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando por defecto
CMD ["npm", "run", "start:prod"]
