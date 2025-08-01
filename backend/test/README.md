# 🧪 DIRECTORIO DE PRUEBAS - SISTEMA SABOR

## 📋 Estructura del Directorio

Esta carpeta contiene todos los archivos relacionados con pruebas, validaciones y herramientas de deployment del Sistema Sabor.

```
test/
├── README.md                    # Este archivo
├── performance/                 # Pruebas de rendimiento
│   ├── performance_benchmark.js # Script de benchmark de rendimiento
│   ├── performance_results.json # Resultados de pruebas (si existen)
│   └── PERFORMANCE_REPORT.md   # Reporte detallado de rendimiento
├── deployment/                  # Herramientas de deployment
│   ├── DEPLOYMENT_CHECKLIST.md # Lista de verificación para deployment
│   ├── create_production_backup.sh # Script de backup de producción
│   └── pre_deployment_check.sh # Script de verificación pre-deployment
├── integration/                 # Pruebas de integración
│   └── test_integration.js     # Suite de pruebas de integración
└── logs/                       # Logs de pruebas (creados automáticamente)
```

---

## 🚀 Pruebas de Rendimiento

### `performance/performance_benchmark.js`

Script completo de benchmarking que incluye:

- Generación de datos de prueba
- Pruebas de información de particiones
- Análisis de rendimiento de consultas
- Pruebas de carga concurrente

**Uso:**

```bash
# Ejecutar benchmark completo
node test/performance/performance_benchmark.js full

# Ejecutar solo pruebas de consultas
node test/performance/performance_benchmark.js query

# Generar datos de prueba
node test/performance/performance_benchmark.js data 1000

# Ejecutar pruebas de carga
node test/performance/performance_benchmark.js load 5 20
```

### `performance/PERFORMANCE_REPORT.md`

Reporte detallado con:

- Métricas de rendimiento obtenidas
- Análisis comparativo con baseline
- Recomendaciones de optimización
- Configuración del sistema

---

## 🚀 Herramientas de Deployment

### `deployment/DEPLOYMENT_CHECKLIST.md`

Lista de verificación completa para deployment seguro incluyendo:

- Verificaciones pre-deployment
- Proceso de deployment paso a paso
- Plan de rollback
- Criterios de éxito/fallo

### `deployment/create_production_backup.sh`

Script automatizado para crear backup de producción:

- Backup completo con verificación
- Compresión automática
- Limpieza de backups antiguos
- Generación de reportes

**Uso:**

```bash
# Crear backup de producción
./test/deployment/create_production_backup.sh
```

### `deployment/pre_deployment_check.sh`

Script de verificación pre-deployment:

- Verificación de variables de entorno
- Conectividad a base de datos
- Permisos MySQL
- Espacio en disco
- Estructura de archivos

**Uso:**

```bash
# Ejecutar verificaciones pre-deployment
./test/deployment/pre_deployment_check.sh
```

---

## 🧪 Pruebas de Integración

### `integration/test_integration.js`

Suite completa de pruebas de integración:

- Verificación de estructura de BD
- Pruebas de autenticación
- Pruebas de endpoints API
- Pruebas de funcionalidad completa

**Uso:**

```bash
# Ejecutar pruebas de integración
node test/integration/test_integration.js
```

**Prerrequisitos:**

- Servidor API corriendo en puerto 3001
- Base de datos configurada
- Variables de entorno configuradas

---

## 📊 Logs de Pruebas

El directorio `logs/` se crea automáticamente y contiene:

- Logs de ejecución de pruebas
- Reportes de deployment
- Resultados de verificaciones
- Logs de errores y debug

---

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sabor_db
DB_USER=root
DB_PASSWORD=rootpassword
```

### Permisos de Archivos

Los scripts de deployment requieren permisos de ejecución:

```bash
chmod +x test/deployment/*.sh
```

---

## 📋 Uso Recomendado

### Antes del Deployment:

1. Ejecutar verificaciones pre-deployment
2. Crear backup de producción
3. Ejecutar pruebas de rendimiento
4. Verificar checklist de deployment

### Durante el Desarrollo:

1. Ejecutar pruebas de integración
2. Verificar benchmarks de rendimiento
3. Validar estructura de BD

### Después del Deployment:

1. Ejecutar pruebas de integración
2. Verificar métricas de rendimiento
3. Monitorear logs de aplicación

---

## 🛡️ Seguridad

- Los scripts de backup no exponen credenciales en logs
- Los archivos de configuración están en .gitignore
- Los logs contienen solo información no sensible
- Los backups se comprimen automáticamente

---

## 📝 Mantenimiento

### Limpieza Regular:

- Los backups antiguos se eliminan automáticamente (>7 días)
- Los logs de pruebas se pueden limpiar manualmente
- Los resultados de performance se sobrescriben

### Actualización:

- Modificar scripts según cambios en la aplicación
- Actualizar pruebas de integración para nuevas funcionalidades
- Ajustar benchmarks según optimizaciones

---

## 🆘 Soporte

Para problemas con las pruebas o deployment:

1. Verificar logs en el directorio `logs/`
2. Revisar variables de entorno
3. Verificar permisos de archivos
4. Consultar documentación específica de cada herramienta

**Contacto de Soporte:**

- DevOps Team: devops@sabor.com
- Technical Lead: tech@sabor.com
