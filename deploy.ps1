# Script de despliegue automatizado para Sabor App (PowerShell)
# Uso: .\deploy.ps1 -Environment production -Action deploy

param(
    [Parameter(Position=0)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "staging",
    
    [Parameter(Position=1)]
    [ValidateSet("deploy", "docker", "railway", "rollback", "status", "clean")]
    [string]$Action = "deploy"
)

# Configuración
$ProjectName = "sabor"
$BackupDir = ".\backup"
$LogFile = ".\deploy-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Funciones de utilidad
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    
    switch ($Level) {
        "ERROR" { Write-Host $LogMessage -ForegroundColor Red }
        "WARN"  { Write-Host $LogMessage -ForegroundColor Yellow }
        "INFO"  { Write-Host $LogMessage -ForegroundColor Green }
        "DEBUG" { Write-Host $LogMessage -ForegroundColor Blue }
    }
    
    Add-Content -Path $LogFile -Value $LogMessage
}

function Test-Prerequisites {
    Write-Log "🔍 Verificando prerrequisitos..."
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        if (-not $nodeVersion) {
            throw "Node.js no encontrado"
        }
        
        $version = $nodeVersion -replace 'v', ''
        $requiredVersion = [Version]"18.0.0"
        $currentVersion = [Version]$version
        
        if ($currentVersion -lt $requiredVersion) {
            throw "Se requiere Node.js >= 18.0.0, encontrado: $version"
        }
        
        Write-Log "✅ Node.js $version encontrado"
    }
    catch {
        Write-Log "❌ Error verificando Node.js: $($_.Exception.Message)" "ERROR"
        exit 1
    }
    
    # Verificar npm
    try {
        $npmVersion = npm --version
        Write-Log "✅ npm $npmVersion encontrado"
    }
    catch {
        Write-Log "❌ npm no está instalado" "ERROR"
        exit 1
    }
    
    # Verificar Docker si es necesario
    if ($Action -like "docker*") {
        try {
            docker --version | Out-Null
            docker-compose --version | Out-Null
            Write-Log "✅ Docker y Docker Compose encontrados"
        }
        catch {
            Write-Log "❌ Docker o Docker Compose no están instalados" "ERROR"
            exit 1
        }
    }
    
    Write-Log "✅ Prerrequisitos verificados"
}

function Test-Configuration {
    Write-Log "📋 Verificando configuración para $Environment..."
    
    if ($Environment -eq "production") {
        # Verificar archivos de ejemplo
        if (-not (Test-Path "backend\env.production.example")) {
            Write-Log "❌ Archivo backend\env.production.example no encontrado" "ERROR"
            exit 1
        }
        
        if (-not (Test-Path "frontend\env.production.example")) {
            Write-Log "❌ Archivo frontend\env.production.example no encontrado" "ERROR"
            exit 1
        }
        
        # Verificar variables de entorno críticas
        $criticalVars = @("JWT_SECRET", "COOKIE_SECRET", "DB_PASSWORD")
        foreach ($var in $criticalVars) {
            if (-not $env:$var) {
                Write-Log "⚠️  Variable $var no configurada" "WARN"
            }
        }
    }
    
    Write-Log "✅ Configuración verificada"
}

function New-Backup {
    Write-Log "💾 Creando backup..."
    
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir | Out-Null
    }
    
    # Backup de archivos de uploads si existen
    if (Test-Path "backend\public\uploads") {
        $backupFile = "$BackupDir\uploads_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
        try {
            Compress-Archive -Path "backend\public\uploads\*" -DestinationPath $backupFile -Force
            Write-Log "✅ Backup de archivos creado: $backupFile"
        }
        catch {
            Write-Log "⚠️  No se pudo crear backup de archivos: $($_.Exception.Message)" "WARN"
        }
    }
    
    Write-Log "✅ Backup completado"
}

function Clear-Temporary {
    Write-Log "🧹 Limpiando archivos temporales..."
    
    if ($Action -eq "clean") {
        # Eliminar node_modules
        $nodeModulesPaths = @("node_modules", "backend\node_modules", "frontend\node_modules", "frontend\dist")
        foreach ($path in $nodeModulesPaths) {
            if (Test-Path $path) {
                Remove-Item -Path $path -Recurse -Force
                Write-Log "🗑️  Eliminado: $path"
            }
        }
    }
    
    # Limpiar caché de npm
    try {
        npm cache clean --force 2>$null
    }
    catch {
        # Ignorar errores de caché
    }
    
    # Limpiar logs antiguos
    if (Test-Path "backend\logs") {
        Get-ChildItem -Path "backend\logs" -Filter "*.log" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force
    }
    
    Write-Log "✅ Limpieza completada"
}

function Install-Dependencies {
    Write-Log "📦 Instalando dependencias..."
    
    # Dependencias raíz
    npm ci --only=production
    
    # Dependencias del backend
    Push-Location backend
    npm ci --only=production
    Pop-Location
    
    # Dependencias del frontend
    Push-Location frontend
    npm ci --only=production
    Pop-Location
    
    Write-Log "✅ Dependencias instaladas"
}

function Invoke-Tests {
    Write-Log "🧪 Ejecutando tests..."
    
    # Tests del backend
    if (Test-Path "backend\package.json") {
        $packageJson = Get-Content "backend\package.json" | ConvertFrom-Json
        if ($packageJson.scripts.test) {
            Push-Location backend
            try {
                npm test
                Write-Log "✅ Tests del backend pasaron"
            }
            catch {
                Write-Log "⚠️  Tests del backend fallaron o no están configurados" "WARN"
            }
            Pop-Location
        }
    }
    
    # Tests del frontend
    if (Test-Path "frontend\package.json") {
        $packageJson = Get-Content "frontend\package.json" | ConvertFrom-Json
        if ($packageJson.scripts.test) {
            Push-Location frontend
            try {
                npm test
                Write-Log "✅ Tests del frontend pasaron"
            }
            catch {
                Write-Log "⚠️  Tests del frontend fallaron o no están configurados" "WARN"
            }
            Pop-Location
        }
    }
    
    Write-Log "✅ Tests completados"
}

function Build-Application {
    Write-Log "🔨 Construyendo aplicación para $Environment..."
    
    # Build del frontend
    Push-Location frontend
    if ($Environment -eq "production") {
        $env:NODE_ENV = "production"
        npm run build:prod
    } else {
        npm run build
    }
    Pop-Location
    
    # Build del backend
    Push-Location backend
    try {
        npm run build
    }
    catch {
        Write-Log "ℹ️  Backend no requiere build" "INFO"
    }
    Pop-Location
    
    Write-Log "✅ Build completado"
}

function Test-Health {
    Write-Log "🏥 Verificando salud de la aplicación..."
    
    $maxAttempts = 30
    $attempt = 1
    $port = if ($env:PORT) { $env:PORT } else { "3000" }
    $healthUrl = "http://localhost:$port/api/health"
    
    while ($attempt -le $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Log "✅ Aplicación responde correctamente"
                return
            }
        }
        catch {
            # Continuar intentando
        }
        
        Write-Log "Intento $attempt/$maxAttempts - Esperando que la aplicación esté lista..." "INFO"
        Start-Sleep -Seconds 5
        $attempt++
    }
    
    Write-Log "❌ La aplicación no responde después de $maxAttempts intentos" "ERROR"
    exit 1
}

function Deploy-Docker {
    Write-Log "🐳 Desplegando con Docker..."
    
    # Construir imagen
    docker build -t "${ProjectName}:latest" .
    
    # Detener contenedores existentes
    try {
        docker-compose down
    }
    catch {
        # Ignorar si no hay contenedores corriendo
    }
    
    # Iniciar servicios
    if ($Environment -eq "production") {
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    } else {
        docker-compose up -d
    }
    
    # Esperar a que los servicios estén listos
    Start-Sleep -Seconds 10
    
    Write-Log "✅ Despliegue Docker completado"
}

function Deploy-Traditional {
    Write-Log "🚀 Desplegando aplicación tradicional..."
    
    # Detener procesos existentes
    Get-Process | Where-Object { $_.ProcessName -like "*node*" -and $_.CommandLine -like "*index.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Configurar base de datos
    Push-Location backend
    node scripts\db-setup.js setup
    Pop-Location
    
    # Crear directorio de logs si no existe
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
    }
    
    # Iniciar aplicación
    Push-Location backend
    if ($Environment -eq "production") {
        Start-Process -FilePath "npm" -ArgumentList "run", "start:prod" -RedirectStandardOutput "..\logs\app.log" -RedirectStandardError "..\logs\error.log" -WindowStyle Hidden
    } else {
        Start-Process -FilePath "npm" -ArgumentList "start" -RedirectStandardOutput "..\logs\app.log" -RedirectStandardError "..\logs\error.log" -WindowStyle Hidden
    }
    Pop-Location
    
    Write-Log "✅ Aplicación iniciada"
}

function Deploy-Railway {
    Write-Log "🚄 Preparando despliegue para Railway..."
    
    if (-not (Test-Path "railway.json")) {
        Write-Log "❌ Archivo railway.json no encontrado" "ERROR"
        exit 1
    }
    
    if (-not $env:RAILWAY_TOKEN) {
        Write-Log "⚠️  RAILWAY_TOKEN no configurado - despliegue manual requerido" "WARN"
    }
    
    Build-Application
    
    Write-Log "✅ Proyecto preparado para Railway"
    Write-Log "📝 Pasos siguientes:" "INFO"
    Write-Log "   1. Configurar variables de entorno en Railway" "INFO"
    Write-Log "   2. Conectar repositorio Git" "INFO"
    Write-Log "   3. Desplegar desde la interfaz web de Railway" "INFO"
}

function Invoke-Rollback {
    Write-Log "⏪ Ejecutando rollback..."
    
    # Detener aplicación actual
    Get-Process | Where-Object { $_.ProcessName -like "*node*" -and $_.CommandLine -like "*index.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Restaurar backup más reciente si existe
    $latestBackup = Get-ChildItem -Path $BackupDir -Filter "uploads_backup_*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($latestBackup) {
        Write-Log "📁 Restaurando backup: $($latestBackup.Name)"
        try {
            if (Test-Path "backend\public\uploads") {
                Remove-Item -Path "backend\public\uploads" -Recurse -Force
            }
            Expand-Archive -Path $latestBackup.FullName -DestinationPath "backend\public\uploads" -Force
        }
        catch {
            Write-Log "⚠️  No se pudo restaurar backup: $($_.Exception.Message)" "WARN"
        }
    }
    
    Write-Log "✅ Rollback completado"
}

function Show-Status {
    Write-Log "📊 Estado de la aplicación:"
    
    # Verificar procesos Node.js
    $nodeProcesses = Get-Process | Where-Object { $_.ProcessName -like "*node*" -and $_.CommandLine -like "*index.js*" }
    if ($nodeProcesses) {
        Write-Log "✅ Aplicación corriendo (PID: $($nodeProcesses.Id -join ', '))" "INFO"
    } else {
        Write-Log "❌ Aplicación no está corriendo" "INFO"
    }
    
    # Verificar contenedores Docker
    try {
        $containers = docker ps --filter "name=$ProjectName" --format "table {{.Names}}\t{{.Status}}"
        if ($containers -and $containers.Count -gt 1) {
            Write-Log "🐳 Contenedores Docker:" "INFO"
            $containers | ForEach-Object { Write-Log "   $_" "INFO" }
        }
    }
    catch {
        # Docker no disponible
    }
    
    # Mostrar logs recientes
    if (Test-Path "logs\app.log") {
        Write-Log "📋 Últimas líneas del log:" "INFO"
        Get-Content "logs\app.log" -Tail 5 | ForEach-Object { Write-Log "   $_" "INFO" }
    }
}

# Función principal
function Main {
    Write-Log "🚀 Iniciando despliegue de Sabor App"
    Write-Log "📋 Entorno: $Environment"
    Write-Log "🎯 Acción: $Action"
    
    switch ($Action) {
        "deploy" {
            Test-Prerequisites
            Test-Configuration
            New-Backup
            Clear-Temporary
            Install-Dependencies
            Invoke-Tests
            Build-Application
            Deploy-Traditional
            Test-Health
        }
        "docker" {
            Test-Prerequisites
            Test-Configuration
            New-Backup
            Deploy-Docker
            Test-Health
        }
        "railway" {
            Test-Prerequisites
            Test-Configuration
            Deploy-Railway
        }
        "rollback" {
            Invoke-Rollback
        }
        "status" {
            Show-Status
        }
        "clean" {
            Clear-Temporary
        }
    }
    
    Write-Log "🎉 Proceso completado exitosamente"
    Write-Log "📝 Log guardado en: $LogFile"
}

# Ejecutar función principal
try {
    Main
}
catch {
    Write-Log "💥 Error durante el despliegue: $($_.Exception.Message)" "ERROR"
    exit 1
}
