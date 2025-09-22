# Guía de Despliegue en Producción - Sabor App

Esta guía proporciona instrucciones completas para desplegar la aplicación Sabor en un entorno de producción.

## 📋 Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Configuración de Entorno](#configuración-de-entorno)
- [Métodos de Despliegue](#métodos-de-despliegue)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Monitoreo y Logging](#monitoreo-y-logging)
- [Seguridad](#seguridad)
- [Mantenimiento](#mantenimiento)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerrequisitos

### Requisitos del Sistema

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **MySQL**: >= 8.0
- **Nginx**: >= 1.18 (opcional, para proxy reverso)
- **Docker**: >= 20.10 (opcional, para despliegue containerizado)

### Herramientas Requeridas

```bash
# Verificar versiones
node --version
npm --version
mysql --version
docker --version
nginx -v
```

## ⚙️ Configuración de Entorno

### 1. Variables de Entorno de Producción

Copia y configura los archivos de entorno:

```bash
# Backend
cp backend/env.production.example backend/.env.production

# Frontend
cp frontend/env.production.example frontend/.env.production
```

### 2. Variables Críticas del Backend

Edita `backend/.env.production` con valores seguros:

```bash
# Base de Datos
DB_HOST=tu_host_mysql
DB_USER=sabor_production_user
DB_PASSWORD=password_super_seguro_2024!
DB_NAME=sabor_production_db
DB_PORT=3306

# Seguridad
JWT_SECRET=jwt_secreto_muy_largo_y_seguro_minimo_32_caracteres
COOKIE_SECRET=cookie_secreto_muy_largo_y_seguro_minimo_32_caracteres

# URLs
CORS_ORIGIN=https://tu-dominio.com
FRONTEND_URL=https://tu-dominio.com

# Email
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu_app_password

# PayU (Producción)
PAYU_API_LOGIN=tu_api_login_produccion
PAYU_API_KEY=tu_api_key_produccion
PAYU_MERCHANT_ID=tu_merchant_id
PAYU_ACCOUNT_ID=tu_account_id
PAYU_TEST_MODE=false
```

### 3. Variables del Frontend

Edita `frontend/.env.production`:

```bash
VITE_API_URL=https://tu-dominio.com/api
VITE_SOCKET_URL=https://tu-dominio.com
VITE_ENVIRONMENT=production
```

## 🚀 Métodos de Despliegue

### Opción 1: Despliegue Tradicional (Recomendado)

#### Linux/macOS

```bash
# Dar permisos de ejecución
chmod +x deploy.sh

# Desplegar en producción
./deploy.sh production deploy

# Verificar estado
./deploy.sh production status
```

#### Windows

```powershell
# Desplegar en producción
.\deploy.ps1 -Environment production -Action deploy

# Verificar estado
.\deploy.ps1 -Environment production -Action status
```

### Opción 2: Despliegue con Docker

```bash
# Linux/macOS
./deploy.sh production docker

# Windows
.\deploy.ps1 -Environment production -Action docker
```

### Opción 3: Despliegue Manual Paso a Paso

```bash
# 1. Instalar dependencias
npm run install:all

# 2. Verificar seguridad
npm run security-check:all

# 3. Construir aplicación
npm run build

# 4. Configurar base de datos
cd backend
node scripts/db-setup.js setup
cd ..

# 5. Iniciar aplicación
npm start
```

### Opción 4: Railway (PaaS)

```bash
# Preparar para Railway
./deploy.sh production railway

# Luego seguir las instrucciones en pantalla
```

## 🗄️ Configuración de Base de Datos

### 1. Configuración Inicial

```bash
# Ejecutar configuración completa
cd backend
node scripts/db-setup.js setup

# Solo verificar configuración
node scripts/db-setup.js verify

# Verificar salud de la DB
node scripts/db-setup.js health
```

### 2. Optimizaciones de Producción

El script `db.production.sql` incluye:

- Índices optimizados para consultas frecuentes
- Configuraciones de rendimiento para InnoDB
- Procedimientos almacenados para mantenimiento
- Triggers de auditoría automática
- Tablas de seguridad y logging
- Eventos programados para limpieza automática

### 3. Backup Automático

```bash
# Crear backup manual
cd backend
node scripts/backup.js create

# Listar backups existentes
node scripts/backup.js list

# Limpiar backups antiguos (más de 7 días)
node scripts/backup.js clean 7
```

## 📊 Monitoreo y Logging

### 1. Health Checks

La aplicación expone varios endpoints de monitoreo:

```bash
# Verificación de salud general
curl https://tu-dominio.com/api/health

# Verificación de preparación
curl https://tu-dominio.com/api/ready

# Verificación de vida (para Kubernetes)
curl https://tu-dominio.com/api/live

# Métricas básicas
curl https://tu-dominio.com/api/metrics
```

### 2. Logs de Aplicación

Los logs se almacenan en `backend/logs/`:

- `access-YYYY-MM-DD.log`: Logs de acceso HTTP
- `error-YYYY-MM-DD.log`: Logs de errores
- `security-YYYY-MM-DD.log`: Logs de seguridad

### 3. Limpieza Automática de Logs

Los logs se rotan automáticamente y los archivos antiguos se eliminan después de 30 días.

## 🔒 Seguridad

### 1. Configuraciones de Seguridad Implementadas

- **Rate Limiting**: Límites por IP para diferentes endpoints
- **Headers de Seguridad**: Helmet configurado para producción
- **Validación de Entrada**: Sanitización automática de datos
- **Protección CSRF**: Tokens CSRF para formularios
- **Prevención de Inyección SQL**: Validaciones y queries preparadas
- **Auditoría**: Logging automático de acciones críticas

### 2. SSL/TLS

Para producción, configura certificados SSL:

```bash
# Usando Let's Encrypt con Certbot
sudo certbot --nginx -d tu-dominio.com

# O coloca certificados manualmente en:
# - nginx/ssl/cert.pem
# - nginx/ssl/key.pem
```

### 3. Firewall

Configurar firewall para permitir solo puertos necesarios:

```bash
# Ubuntu/Debian con UFW
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 🔧 Mantenimiento

### 1. Actualizaciones

```bash
# Crear backup antes de actualizar
./deploy.sh production backup

# Actualizar aplicación
git pull origin main
./deploy.sh production deploy

# Si algo sale mal, hacer rollback
./deploy.sh production rollback
```

### 2. Monitoreo Continuo

```bash
# Verificar estado regularmente
./deploy.sh production status

# Verificar logs de error
tail -f backend/logs/error-$(date +%Y-%m-%d).log

# Verificar uso de recursos
htop
df -h
```

### 3. Tareas de Mantenimiento Programadas

Configurar cron jobs para tareas automáticas:

```bash
# Editar crontab
crontab -e

# Agregar tareas (ejemplo)
# Backup diario a las 2:00 AM
0 2 * * * cd /ruta/a/sabor && node backend/scripts/backup.js create

# Limpiar logs antiguos semanalmente
0 3 * * 0 cd /ruta/a/sabor && node backend/scripts/cleanup-logs.js

# Verificar salud cada 5 minutos
*/5 * * * * curl -f http://localhost:3000/api/health || echo "App down" | mail -s "Sabor App Alert" admin@tu-dominio.com
```

## 🐳 Docker en Producción

### 1. Configuración con Docker Compose

```bash
# Iniciar servicios
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Ver logs
docker-compose logs -f app

# Escalar aplicación
docker-compose up -d --scale app=3

# Actualizar imagen
docker-compose pull
docker-compose up -d
```

### 2. Volúmenes Persistentes

Asegúrate de crear volúmenes externos para datos persistentes:

```bash
docker volume create mysql_prod_data
docker volume create uploads_prod_data
docker volume create logs_prod_data
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Aplicación no inicia

```bash
# Verificar logs
tail -n 50 backend/logs/error-$(date +%Y-%m-%d).log

# Verificar variables de entorno
node -e "console.log(process.env.NODE_ENV)"

# Verificar puertos
netstat -tlnp | grep 3000
```

#### 2. Errores de Base de Datos

```bash
# Verificar conexión
cd backend
node scripts/db-setup.js health

# Verificar configuración
mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT 1"
```

#### 3. Problemas de Rendimiento

```bash
# Verificar uso de CPU y memoria
htop

# Verificar queries lentas de MySQL
mysql -e "SHOW PROCESSLIST;"

# Verificar logs de queries lentas
tail -f /var/log/mysql/mysql-slow.log
```

#### 4. Errores de SSL/TLS

```bash
# Verificar certificados
openssl x509 -in /path/to/cert.pem -text -noout

# Probar conexión SSL
openssl s_client -connect tu-dominio.com:443
```

### Comandos de Diagnóstico

```bash
# Estado completo del sistema
./deploy.sh production status

# Verificar configuración de Nginx
nginx -t

# Verificar logs de sistema
journalctl -u nginx -f
journalctl -u mysql -f

# Verificar espacio en disco
df -h
du -sh backend/logs/
du -sh backend/public/uploads/
```

## 📞 Soporte

Para problemas adicionales:

1. Revisar logs de aplicación en `backend/logs/`
2. Verificar configuración de variables de entorno
3. Consultar la documentación de cada servicio (MySQL, Nginx, etc.)
4. Verificar conectividad de red y permisos de firewall

---

## 🔄 Comandos Rápidos

```bash
# Despliegue completo
./deploy.sh production deploy

# Solo build
npm run build

# Verificar salud
curl http://localhost:3000/api/health

# Backup
node backend/scripts/backup.js create

# Limpiar caché
./deploy.sh production clean

# Rollback
./deploy.sh production rollback
```

Esta guía cubre todos los aspectos necesarios para un despliegue exitoso en producción. Asegúrate de seguir las mejores prácticas de seguridad y mantener backups regulares.
