# Configuración para Railway - Sabor App

Esta guía te ayudará a desplegar correctamente la aplicación Sabor en Railway.

## 🚄 Pasos para Desplegar en Railway

### 1. Preparación del Proyecto

Tu proyecto ya está optimizado para Railway con:

- ✅ `railway.json` configurado
- ✅ Health checks automáticos
- ✅ Scripts de build optimizados
- ✅ Variables de entorno definidas

### 2. Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Conecta tu cuenta de GitHub
3. Crea un nuevo proyecto
4. Selecciona "Deploy from GitHub repo"
5. Elige tu repositorio `sabor`

### 3. Configurar Base de Datos

Railway necesita una base de datos MySQL:

**Opción A: MySQL Plugin de Railway (Recomendado)**

1. En tu proyecto Railway, click "New Service"
2. Selecciona "Database" → "MySQL"
3. Railway creará automáticamente las variables de entorno

**Opción B: Base de datos externa**

1. Usa PlanetScale, AWS RDS, o cualquier proveedor MySQL
2. Configura manualmente las variables de entorno

### 4. Variables de Entorno Requeridas

En Railway Dashboard → Settings → Environment Variables, configura:

#### Variables Críticas (OBLIGATORIAS):

```
NODE_ENV=production
PORT=3000

# Base de Datos (si usas MySQL externo)
DB_HOST=tu_host_mysql
DB_USER=tu_usuario
DB_PASSWORD=tu_password_seguro
DB_NAME=sabor_production_db
DB_PORT=3306

# Seguridad (GENERAR VALORES ÚNICOS)
JWT_SECRET=tu_jwt_secreto_muy_largo_minimo_32_caracteres_aqui
COOKIE_SECRET=tu_cookie_secreto_muy_largo_minimo_32_caracteres

# URLs (Railway auto-genera RAILWAY_STATIC_URL)
CORS_ORIGIN=${{RAILWAY_STATIC_URL}}
FRONTEND_URL=${{RAILWAY_STATIC_URL}}

# Email
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_gmail

# PayU (Configurar con valores reales de producción)
PAYU_API_LOGIN=tu_payu_api_login
PAYU_API_KEY=tu_payu_api_key
PAYU_MERCHANT_ID=tu_merchant_id
PAYU_ACCOUNT_ID=tu_account_id
PAYU_TEST_MODE=false

# Configuraciones Railway específicas
TRUST_PROXY=true
SESSION_SECURE=true
COMPRESSION_ENABLED=true
RATE_LIMIT_ENABLED=true
```

#### Variables Opcionales:

```
LOG_LEVEL=info
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=sabor-app
JWT_AUDIENCE=sabor-users
```

### 5. Configuración del Frontend

Si quieres servir el frontend desde Railway también:

1. Crea un segundo servicio en Railway
2. Configura el root como `frontend`
3. Variables de entorno del frontend:

```
VITE_API_URL=${{RAILWAY_STATIC_URL}}/api
VITE_SOCKET_URL=${{RAILWAY_STATIC_URL}}
VITE_ENVIRONMENT=production
VITE_APP_NAME=Sabor
VITE_APP_VERSION=1.0.0
VITE_PAYU_CHECKOUT_URL=https://checkout.payulatam.com/ppp-web-gateway-payu/
```

### 6. Configurar Dominio Personalizado (Opcional)

1. En Railway Dashboard → Settings → Domains
2. Agrega tu dominio personalizado
3. Actualiza las variables de entorno:
   - `CORS_ORIGIN=https://tu-dominio.com`
   - `FRONTEND_URL=https://tu-dominio.com`

## 🔧 Configuración Específica para Railway

### archivo `railway.json` (Ya configurado)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "root": "backend",
    "buildCommand": "npm ci --only=production && npm run build",
    "startCommand": "npm run start:prod"
  },
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### Optimizaciones para Railway

1. **Health Checks**: Railway verificará `/api/health` automáticamente
2. **Auto-restart**: Se reinicia automáticamente si falla
3. **Variables dinámicas**: Usa `${{RAILWAY_STATIC_URL}}` para URLs automáticas
4. **Build optimizado**: Solo instala dependencias de producción

## 🚀 Proceso de Despliegue

### Despliegue Automático

1. Conecta tu repositorio
2. Railway detecta automáticamente el `railway.json`
3. Configura las variables de entorno
4. Railway despliega automáticamente

### Despliegue Manual

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Desplegar
railway up
```

## 🔍 Verificación Post-Despliegue

1. **Verificar Health Check**:

   ```bash
   curl https://tu-app.railway.app/api/health
   ```

2. **Verificar Base de Datos**:
   - Ve a Railway Dashboard → Database
   - Verifica que las tablas se crearon correctamente

3. **Verificar Logs**:
   - Railway Dashboard → Deployments → View Logs

## 🐛 Troubleshooting Railway

### Problemas Comunes

#### 1. Error de Build

- Verifica que `package.json` tenga el script `start:prod`
- Revisa los logs de build en Railway Dashboard

#### 2. Error de Base de Datos

- Verifica que las variables de entorno DB\_\* estén configuradas
- Asegúrate de que el MySQL service esté corriendo

#### 3. Error de CORS

- Verifica que `CORS_ORIGIN` apunte a tu dominio Railway
- Usa `${{RAILWAY_STATIC_URL}}` para URLs automáticas

#### 4. Error de Variables de Entorno

- Ve a Settings → Environment Variables
- Verifica que todas las variables críticas estén configuradas

### Comandos de Diagnóstico

```bash
# Ver logs en tiempo real
railway logs

# Ver variables de entorno
railway variables

# Conectar a la base de datos
railway connect mysql

# Reiniciar servicio
railway redeploy
```

## 📊 Monitoreo en Railway

Railway proporciona:

- ✅ Métricas de CPU y memoria
- ✅ Logs en tiempo real
- ✅ Health checks automáticos
- ✅ Alertas por email
- ✅ Escalado automático

## 💰 Consideraciones de Costos

- **Hobby Plan**: Gratis con limitaciones
- **Pro Plan**: $5/mes por servicio
- **Bases de datos**: Costo adicional según uso

## 🔐 Seguridad en Railway

Railway maneja automáticamente:

- ✅ HTTPS/SSL certificates
- ✅ Variables de entorno encriptadas
- ✅ Aislamiento de servicios
- ✅ Backups automáticos (Pro plan)

Tu aplicación está perfectamente configurada para Railway. Solo necesitas configurar las variables de entorno y desplegar!
