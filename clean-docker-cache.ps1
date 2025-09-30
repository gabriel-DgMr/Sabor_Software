# Script PowerShell para limpiar caché de Docker y npm antes del build
Write-Host "🧹 Limpiando caché de Docker y npm..." -ForegroundColor Cyan

# Limpiar caché de Docker
Write-Host "📦 Limpiando caché de Docker..." -ForegroundColor Yellow
docker system prune -f
docker builder prune -f

# Limpiar caché de npm en el sistema local
Write-Host "📦 Limpiando caché de npm local..." -ForegroundColor Yellow
npm cache clean --force

# Limpiar node_modules locales si existen
Write-Host "🗑️ Limpiando node_modules locales..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") {
    Remove-Item -Recurse -Force "frontend/node_modules"
    Write-Host "✅ frontend/node_modules eliminado" -ForegroundColor Green
}

if (Test-Path "backend/node_modules") {
    Remove-Item -Recurse -Force "backend/node_modules"
    Write-Host "✅ backend/node_modules eliminado" -ForegroundColor Green
}

if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ node_modules raíz eliminado" -ForegroundColor Green
}

# Limpiar directorios de build
Write-Host "🗑️ Limpiando directorios de build..." -ForegroundColor Yellow
if (Test-Path "frontend/dist") {
    Remove-Item -Recurse -Force "frontend/dist"
    Write-Host "✅ frontend/dist eliminado" -ForegroundColor Green
}

if (Test-Path "backend/dist") {
    Remove-Item -Recurse -Force "backend/dist"
    Write-Host "✅ backend/dist eliminado" -ForegroundColor Green
}

Write-Host "✨ Limpieza completada. Ahora puedes ejecutar el build de Docker." -ForegroundColor Green
Write-Host "💡 Comando sugerido: docker-compose build --no-cache" -ForegroundColor Cyan
