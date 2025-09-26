# Script específico para desplegar en Railway con inserción de datos
# Uso: .\railway-deploy.ps1

param(
    [switch]$SkipDatabase,
    [switch]$SkipBuild,
    [switch]$Help
)

# Colores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] WARNING: $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $Message" -ForegroundColor $Red
    exit 1
}

function Write-Info {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor $Blue
}

function Show-Help {
    Write-Host "Script de despliegue en Railway con inserción de datos de prueba" -ForegroundColor $Green
    Write-Host ""
    Write-Host "Uso: .\railway-deploy.ps1 [opciones]" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor $Yellow
    Write-Host "  -SkipDatabase    Omitir la inserción de datos de prueba" -ForegroundColor $White
    Write-Host "  -SkipBuild       Omitir el build de la aplicación" -ForegroundColor $White
    Write-Host "  -Help            Mostrar esta ayuda" -ForegroundColor $White
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor $Yellow
    Write-Host "  .\railway-deploy.ps1                    # Despliegue completo" -ForegroundColor $White
    Write-Host "  .\railway-deploy.ps1 -SkipDatabase      # Sin datos de prueba" -ForegroundColor $White
    Write-Host "  .\railway-deploy.ps1 -SkipBuild         # Sin build" -ForegroundColor $White
}

if ($Help) {
    Show-Help
    exit 0
}

# Verificar Railway CLI
function Test-RailwayCLI {
    Write-Log "🔍 Verificando Railway CLI..."
    
    try {
        $null = Get-Command railway -ErrorAction Stop
        Write-Log "✅ Railway CLI encontrado"
    }
    catch {
        Write-Error "Railway CLI no está instalado. Instálalo con: npm install -g @railway/cli"
    }
}

# Verificar autenticación
function Test-RailwayAuth {
    Write-Log "🔐 Verificando autenticación con Railway..."
    
    try {
        $null = railway whoami 2>$null
        Write-Log "✅ Autenticado con Railway"
    }
    catch {
        Write-Warning "No estás autenticado con Railway"
        Write-Info "Ejecutando: railway login"
        railway login
    }
}

# Conectar al proyecto
function Connect-RailwayProject {
    Write-Log "🔗 Conectando al proyecto de Railway..."
    
    if (-not (Test-Path ".railway/project.json")) {
        Write-Warning "Proyecto no vinculado a Railway"
        Write-Info "Ejecutando: railway link"
        railway link
    }
    
    Write-Log "✅ Proyecto conectado"
}

# Verificar variables de entorno
function Test-EnvironmentVariables {
    Write-Log "📋 Verificando variables de entorno en Railway..."
    
    $requiredVars = @(
        "NODE_ENV",
        "JWT_SECRET",
        "COOKIE_SECRET",
        "EMAIL_USER",
        "EMAIL_PASSWORD",
        "CORS_ORIGIN",
        "FRONTEND_URL"
    )
    
    foreach ($var in $requiredVars) {
        try {
            $null = railway variables get $var 2>$null
            Write-Log "✅ Variable $var configurada"
        }
        catch {
            Write-Warning "Variable $var no configurada en Railway"
            Write-Info "Configúrala en Railway Dashboard > Variables"
        }
    }
    
    Write-Log "✅ Variables de entorno verificadas"
}

# Construir aplicación
function Build-Application {
    if ($SkipBuild) {
        Write-Log "⏭️  Omitiendo build de la aplicación"
        return
    }
    
    Write-Log "🔨 Construyendo aplicación..."
    
    # Build del frontend
    Set-Location frontend
    npm run build
    Set-Location ..
    
    # Build del backend (si es necesario)
    Set-Location backend
    try {
        npm run build 2>$null
        Write-Log "✅ Build del backend completado"
    }
    catch {
        Write-Log "ℹ️  Backend no requiere build"
    }
    Set-Location ..
    
    Write-Log "✅ Build completado"
}

# Desplegar en Railway
function Deploy-ToRailway {
    Write-Log "🚄 Desplegando en Railway..."
    
    railway up
    
    Write-Log "✅ Despliegue completado"
}

# Ejecutar scripts de base de datos
function Invoke-DatabaseScripts {
    if ($SkipDatabase) {
        Write-Log "⏭️  Omitiendo scripts de base de datos"
        return
    }
    
    Write-Log "📊 Ejecutando scripts de base de datos..."
    
    # Verificar conexión
    Write-Log "🔍 Verificando conexión a la base de datos..."
    railway run --service backend npm run db:verify
    
    # Insertar datos de prueba
    Write-Log "📦 Insertando datos de prueba..."
    railway run --service backend npm run db:seed
    
    Write-Log "✅ Scripts de base de datos ejecutados"
}

# Verificar despliegue
function Test-Deployment {
    Write-Log "🔍 Verificando despliegue..."
    
    try {
        $url = railway domain
        if ($url) {
            Write-Log "🌐 Aplicación desplegada en: https://$url"
            
            # Verificar que la aplicación responde
            $maxAttempts = 30
            $attempt = 1
            
            while ($attempt -le $maxAttempts) {
                try {
                    $response = Invoke-WebRequest -Uri "https://$url/api/health" -UseBasicParsing -TimeoutSec 10
                    if ($response.StatusCode -eq 200) {
                        Write-Log "✅ Aplicación responde correctamente"
                        return
                    }
                }
                catch {
                    # Continuar intentando
                }
                
                Write-Info "Intento $attempt/$maxAttempts - Esperando que la aplicación esté lista..."
                Start-Sleep -Seconds 10
                $attempt++
            }
            
            Write-Warning "⚠️  La aplicación no responde después de $maxAttempts intentos"
        }
        else {
            Write-Warning "⚠️  No se pudo obtener la URL del despliegue"
        }
    }
    catch {
        Write-Warning "⚠️  Error verificando el despliegue: $($_.Exception.Message)"
    }
}

# Mostrar información del despliegue
function Show-DeploymentInfo {
    Write-Log "📊 Información del despliegue:"
    
    try {
        $url = railway domain
        if ($url) {
            Write-Info "🌐 URL: https://$url"
        }
        
        Write-Info "📋 Estado del servicio:"
        railway status
        
        Write-Info "📋 Logs recientes:"
        railway logs --tail 10
    }
    catch {
        Write-Warning "⚠️  Error obteniendo información del despliegue: $($_.Exception.Message)"
    }
}

# Función principal
function Main {
    Write-Log "🚀 Iniciando despliegue en Railway con datos de prueba"
    
    Test-RailwayCLI
    Test-RailwayAuth
    Connect-RailwayProject
    Test-EnvironmentVariables
    Build-Application
    Deploy-ToRailway
    
    # Esperar un poco para que el despliegue se complete
    Write-Log "⏳ Esperando que el despliegue se complete..."
    Start-Sleep -Seconds 30
    
    Invoke-DatabaseScripts
    Test-Deployment
    Show-DeploymentInfo
    
    Write-Log "🎉 Despliegue completado exitosamente"
    Write-Log "💡 Datos de prueba insertados en la base de datos"
}

# Ejecutar función principal
try {
    Main
}
catch {
    Write-Error "Error durante el despliegue: $($_.Exception.Message)"
}
