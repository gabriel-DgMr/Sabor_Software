#!/bin/bash

# Script para limpiar caché de Docker y npm antes del build
echo "🧹 Limpiando caché de Docker y npm..."

# Limpiar caché de Docker
echo "📦 Limpiando caché de Docker..."
docker system prune -f
docker builder prune -f

# Limpiar caché de npm en el sistema local
echo "📦 Limpiando caché de npm local..."
npm cache clean --force

# Limpiar node_modules locales si existen
echo "🗑️ Limpiando node_modules locales..."
if [ -d "frontend/node_modules" ]; then
    rm -rf frontend/node_modules
    echo "✅ frontend/node_modules eliminado"
fi

if [ -d "backend/node_modules" ]; then
    rm -rf backend/node_modules
    echo "✅ backend/node_modules eliminado"
fi

if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "✅ node_modules raíz eliminado"
fi

# Limpiar directorios de build
echo "🗑️ Limpiando directorios de build..."
if [ -d "frontend/dist" ]; then
    rm -rf frontend/dist
    echo "✅ frontend/dist eliminado"
fi

if [ -d "backend/dist" ]; then
    rm -rf backend/dist
    echo "✅ backend/dist eliminado"
fi

echo "✨ Limpieza completada. Ahora puedes ejecutar el build de Docker."
echo "💡 Comando sugerido: docker-compose build --no-cache"
