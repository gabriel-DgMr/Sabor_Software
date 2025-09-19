# ✅ Checklist de Despliegue en Railway - Sabor App

Usa esta lista para verificar que todo esté configurado correctamente para Railway.

## 📋 Pre-Despliegue

### ✅ Archivos de Configuración

- [ ] `railway.json` configurado con health checks
- [ ] `.railwayignore` creado para optimizar subida
- [ ] Scripts de inicialización (`railway-init.js`) preparados
- [ ] `package.json` con comando `start:prod` optimizado

### ✅ Seguridad

- [ ] Generar `JWT_SECRET` único (mínimo 32 caracteres)
- [ ] Generar `COOKIE_SECRET` único (mínimo 32 caracteres)
- [ ] Configurar credenciales de email para producción
- [ ] Configurar credenciales de PayU para producción (PAYU_TEST_MODE=false)

## 🚄 Configuración en Railway

### ✅ Proyecto y Servicios

- [ ] Crear proyecto en Railway
- [ ] Conectar repositorio GitHub
- [ ] Crear servicio MySQL (Database → MySQL)
- [ ] Configurar dominio personalizado (opcional)

### ✅ Variables de Entorno Obligatorias

#### Base de Datos (Auto-configuradas si usas Railway MySQL):

- [ ] `DB_HOST` (automática con Railway MySQL)
- [ ] `DB_USER` (automática con Railway MySQL)
- [ ] `DB_PASSWORD` (automática con Railway MySQL)
- [ ] `DB_NAME` (automática con Railway MySQL)
- [ ] `DB_PORT=3306`

#### Configuración de Aplicación:

- [ ] `NODE_ENV=production`
- [ ] `PORT=3000` (automática en Railway)

#### Seguridad (GENERAR VALORES ÚNICOS):

- [ ] `JWT_SECRET=tu_jwt_secreto_muy_largo_minimo_32_caracteres`
- [ ] `COOKIE_SECRET=tu_cookie_secreto_muy_largo_minimo_32_caracteres`

#### URLs (Usar variables de Railway):

- [ ] `CORS_ORIGIN=${{RAILWAY_STATIC_URL}}`
- [ ] `FRONTEND_URL=${{RAILWAY_STATIC_URL}}`

#### Email:

- [ ] `EMAIL_USER=tu_email@gmail.com`
- [ ] `EMAIL_PASSWORD=tu_app_password_gmail`

#### PayU Producción:

- [ ] `PAYU_API_LOGIN=tu_payu_api_login_produccion`
- [ ] `PAYU_API_KEY=tu_payu_api_key_produccion`
- [ ] `PAYU_MERCHANT_ID=tu_merchant_id_produccion`
- [ ] `PAYU_ACCOUNT_ID=tu_account_id_produccion`
- [ ] `PAYU_TEST_MODE=false`

#### Railway Específicas:

- [ ] `TRUST_PROXY=true`
- [ ] `SESSION_SECURE=true`
- [ ] `COMPRESSION_ENABLED=true`
- [ ] `RATE_LIMIT_ENABLED=true`

### ✅ Variables Opcionales:

- [ ] `LOG_LEVEL=info`
- [ ] `JWT_EXPIRES_IN=24h`
- [ ] `JWT_REFRESH_EXPIRES_IN=7d`

## 🚀 Despliegue

### ✅ Proceso de Despliegue

- [ ] Push código a repositorio
- [ ] Railway detecta cambios automáticamente
- [ ] Verificar que el build sea exitoso
- [ ] Verificar que el deploy sea exitoso
- [ ] Verificar health check (`/api/health`)

### ✅ Verificación Post-Despliegue

#### Health Checks:

- [ ] `GET https://tu-app.railway.app/api/health` retorna 200
- [ ] `GET https://tu-app.railway.app/api/ready` retorna 200
- [ ] `GET https://tu-app.railway.app/api/live` retorna 200

#### Funcionalidad Básica:

- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] API endpoints responden correctamente
- [ ] Base de datos tiene tablas creadas
- [ ] Logs se generan correctamente

#### Seguridad:

- [ ] CORS configurado correctamente
- [ ] Rate limiting activo
- [ ] Headers de seguridad presentes
- [ ] HTTPS funcionando

## 🔍 Testing en Producción

### ✅ Tests Funcionales

- [ ] Crear cuenta de usuario
- [ ] Hacer login/logout
- [ ] Crear producto (si eres admin)
- [ ] Hacer pedido
- [ ] Verificar que emails se envían
- [ ] Probar integración de PayU

### ✅ Tests de Rendimiento

- [ ] Tiempo de respuesta < 2 segundos
- [ ] Aplicación maneja múltiples usuarios
- [ ] Base de datos responde rápido
- [ ] Archivos estáticos se cargan bien

## 🐛 Troubleshooting

### ✅ Si algo falla, verificar:

- [ ] Logs en Railway Dashboard → Deployments → View Logs
- [ ] Variables de entorno están configuradas
- [ ] Base de datos está corriendo
- [ ] Health check endpoint responde
- [ ] No hay errores de CORS en browser console

### ✅ Comandos de Diagnóstico:

```bash
# Verificar health check
curl https://tu-app.railway.app/api/health

# Ver métricas
curl https://tu-app.railway.app/api/metrics

# Verificar CORS (desde browser console)
fetch('https://tu-app.railway.app/api/health')
```

## 📊 Monitoreo Continuo

### ✅ Configurar Alertas:

- [ ] Configurar alertas de Railway para downtime
- [ ] Monitorear uso de CPU/memoria
- [ ] Monitorear espacio de base de datos
- [ ] Configurar alertas de email para errores críticos

### ✅ Mantenimiento Regular:

- [ ] Verificar logs semanalmente
- [ ] Hacer backups de base de datos
- [ ] Actualizar dependencias mensualmente
- [ ] Revisar métricas de rendimiento

## 🎯 URLs Importantes

Una vez desplegado, guarda estas URLs:

- **Aplicación**: `https://tu-app.railway.app`
- **Health Check**: `https://tu-app.railway.app/api/health`
- **API Base**: `https://tu-app.railway.app/api`
- **Railway Dashboard**: `https://railway.app/dashboard`

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs** en Railway Dashboard
2. **Verifica variables de entorno** en Settings
3. **Consulta la documentación** de Railway
4. **Verifica el estado** de los servicios de Railway

---

## 🎉 ¡Listo para Producción!

Tu aplicación Sabor está optimizada para Railway con:

- ✅ Configuración automática de base de datos
- ✅ Health checks integrados
- ✅ CORS dinámico
- ✅ Logging optimizado
- ✅ Seguridad de producción
- ✅ Escalado automático
- ✅ SSL/HTTPS automático

¡Solo configura las variables de entorno y despliega!
