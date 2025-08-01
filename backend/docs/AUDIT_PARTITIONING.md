# 🗂️ Sistema de Particionado Automático - Tabla de Auditoría

## 📋 Resumen

Se ha implementado un sistema de **particionado automático mensual** para la tabla `users_audit` que:

- ✅ Genera particiones automáticamente cada mes con **2 meses de anticipación**
- ✅ Elimina particiones antiguas (mantiene **12 meses** de historial)
- ✅ Mejora significativamente el rendimiento de consultas
- ✅ Facilita el mantenimiento y backup de datos históricos

---

## 🏗️ Estructura Implementada

### 📊 Tabla Particionada: `users_audit`

```sql
CREATE TABLE users_audit (
    id_audit INT AUTO_INCREMENT,
    id_user INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    changed_by INT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_audit, changed_at),
    INDEX idx_audit_user (id_user),
    INDEX idx_audit_action (action),
    INDEX idx_audit_date (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (UNIX_TIMESTAMP(changed_at))
```

### 📅 Particiones Automáticas

- **Formato**: `p_YYYYMM` (ej: `p_202507` para Julio 2025)
- **Tipo**: Range partitioning por timestamp
- **Creación**: Automática el 1ro de cada mes a las 02:00 AM
- **Retención**: 12 meses (particiones más antiguas se eliminan automáticamente)

---

## ⚙️ Componentes del Sistema

### 1. 📦 Stored Procedures

#### `sp_create_audit_partitions()`

Crea particiones futuras automáticamente:

```sql
CALL sp_create_audit_partitions();
```

#### `sp_cleanup_old_audit_partitions()`

Elimina particiones antiguas (>12 meses):

```sql
CALL sp_cleanup_old_audit_partitions();
```

#### `sp_audit_partition_stats()`

Muestra estadísticas completas:

```sql
CALL sp_audit_partition_stats();
```

### 2. ⏰ Eventos Automáticos

#### `ev_create_audit_partitions`

- **Frecuencia**: Cada mes el día 1 a las 02:00 AM
- **Función**: Crear particiones futuras (2-3 meses adelante)

#### `ev_cleanup_old_audit_partitions`

- **Frecuencia**: Cada mes el día 1 a las 03:00 AM
- **Función**: Eliminar particiones antiguas (>12 meses)

### 3. 🔍 Vistas y Funciones

#### Vista: `v_audit_partition_info`

Información detallada de todas las particiones:

```sql
SELECT * FROM v_audit_partition_info;
```

#### Función: `fn_get_audit_partition_for_date(fecha)`

Obtiene el nombre de partición para una fecha:

```sql
SELECT fn_get_audit_partition_for_date('2025-07-15');
-- Retorna: p_202507
```

### 4. 📋 Tabla de Log: `migration_log`

Registra todas las operaciones de particionado:

```sql
SELECT * FROM migration_log
WHERE operation IN ('PARTITION_CREATE', 'PARTITION_DROP')
ORDER BY executed_at DESC;
```

---

## 🛠️ Herramientas de Gestión

### Script de Gestión: `scripts/manage_audit_partitions.js`

```bash
# Mostrar información de particiones
node scripts/manage_audit_partitions.js info

# Mostrar eventos automáticos
node scripts/manage_audit_partitions.js events

# Crear particiones manualmente
node scripts/manage_audit_partitions.js create

# Probar sistema de auditoría
node scripts/manage_audit_partitions.js test

# Limpiar particiones antiguas
node scripts/manage_audit_partitions.js cleanup

# Mostrar log de mantenimiento
node scripts/manage_audit_partitions.js log

# Verificación completa del sistema
node scripts/manage_audit_partitions.js check
```

---

## 📈 Beneficios del Particionado

### 🚀 Rendimiento

- **Consultas más rápidas**: Las consultas por fecha solo acceden a particiones relevantes
- **Índices más eficientes**: Índices más pequeños por partición
- **Operaciones de mantenimiento más rápidas**: Backup/restore por partición

### 🗄️ Gestión de Datos

- **Retención automática**: Elimina datos antiguos automáticamente
- **Backup granular**: Backup por mes/partición
- **Menos fragmentación**: Datos organizados cronológicamente

### 💾 Espacio en Disco

- **Compresión mejorada**: Particiones antiguas pueden comprimirse
- **Eliminación eficiente**: DROP PARTITION es instantáneo vs DELETE masivo
- **Crecimiento predecible**: Estimación precisa del crecimiento de datos

---

## 🔧 Mantenimiento

### ✅ Tareas Automáticas

- [x] Creación de particiones futuras (automática)
- [x] Eliminación de particiones antiguas (automática)
- [x] Logging de operaciones (automático)

### 🔍 Monitoreo Recomendado

#### Verificación Mensual

```sql
-- Verificar estado de eventos
SELECT event_name, status, last_executed
FROM information_schema.events
WHERE event_schema = 'sabor_db';

-- Verificar particiones existentes
CALL sp_audit_partition_stats();

-- Verificar log de operaciones
SELECT * FROM migration_log
WHERE operation LIKE 'PARTITION_%'
AND executed_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH);
```

#### Alertas Recomendadas

- **Eventos deshabilitados**: `status != 'ENABLED'`
- **Particiones faltantes**: Verificar que existan particiones para próximos 2 meses
- **Particiones muy grandes**: `table_rows > 1000000` por partición
- **Espacio en disco**: Monitorear crecimiento mensual

---

## 🚨 Troubleshooting

### Error: "Table has no partition for value"

**Causa**: Falta partición para la fecha actual
**Solución**:

```sql
CALL sp_create_audit_partitions();
```

### Error: "Event Scheduler is OFF"

**Causa**: Event Scheduler deshabilitado
**Solución** (requiere privilegios SUPER):

```sql
SET GLOBAL event_scheduler = ON;
```

### Error: "Access denied for SUPER privilege"

**Causa**: Usuario sin privilegios para eventos
**Solución**: Ejecutar eventos manualmente o usar usuario root para configurar

### Partición muy grande

**Síntoma**: Consultas lentas en partición específica
**Solución**: Considerar sub-particionado o revisión de retención

---

## 📊 Estadísticas Actuales

```
📊 Total de particiones: 9
📅 Rango: Dic 2024 - Ago 2025
📈 Total de registros: 2
💾 Tamaño total: 0.18 MB
```

### 🗂️ Particiones Activas

- `p_202412` - Diciembre 2024
- `p_202501` - Enero 2025
- `p_202502` - Febrero 2025
- `p_202503` - Marzo 2025
- `p_202504` - Abril 2025
- `p_202505` - Mayo 2025
- `p_202506` - Junio 2025
- `p_202507` - Julio 2025 ✨ (partición activa)
- `p_202508` - Agosto 2025

---

## 🔄 Archivos de Migración

- **010_implement_audit_partitioning_safe.sql** - Migración principal
- **create_events.sql** - Creación de eventos automáticos
- **scripts/manage_audit_partitions.js** - Herramienta de gestión

---

## ✅ Estado del Sistema

- [x] **Particionado implementado** - Tabla users_audit particionada por mes
- [x] **Eventos automáticos** - Creación y limpieza automática configurada
- [x] **Triggers actualizados** - Auditoría funciona con nueva estructura
- [x] **Herramientas de gestión** - Script de administración disponible
- [x] **Documentación completa** - Guías de uso y mantenimiento
- [x] **Sistema probado** - Verificación completa exitosa

**🎉 Sistema de particionado automático implementado exitosamente!**
