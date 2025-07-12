import express from 'express';
import * as userController from '../controllers/userController.js';
import { 
    authenticateToken, 
    checkUserActive, 
    checkUserType, 
    checkPermission,
    checkClientAccess,
    checkEmployeeAccess 
} from '../middleware/auth.js';

const router = express.Router();

// ===== RUTAS PÚBLICAS =====

// Obtener estadísticas públicas de usuarios
router.get('/stats', userController.getPublicStats);

// ===== RUTAS PROTEGIDAS - GENERALES =====

// Obtener perfil del usuario autenticado
router.get('/profile', 
    authenticateToken, 
    checkUserActive, 
    userController.getUserProfile
);

// Actualizar perfil del usuario autenticado
router.put('/profile', 
    authenticateToken, 
    checkUserActive, 
    userController.updateUserProfile
);

// Cambiar contraseña del usuario autenticado
router.put('/change-password', 
    authenticateToken, 
    checkUserActive, 
    userController.changePassword
);

// ===== RUTAS PROTEGIDAS - ADMINISTRADORES =====

// Obtener todos los usuarios (solo administradores)
router.get('/', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.getAllUsers
);

// Obtener usuario por ID (solo administradores)
router.get('/:id', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.getUserById
);

// Crear nuevo usuario (solo administradores)
router.post('/', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.createUser
);

// Actualizar usuario (solo administradores)
router.put('/:id', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.updateUser
);

// Activar/Desactivar usuario (solo administradores)
router.put('/:id/toggle-active', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.toggleUserActive
);

// Eliminar usuario (solo administradores)
router.delete('/:id', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.deleteUser
);

// ===== RUTAS ESPECÍFICAS PARA CLIENTES =====

// Obtener todos los clientes (administradores y empleados)
router.get('/clientes/all', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador', 'empleado']),
    userController.getAllClientes
);

// Obtener cliente por ID (administradores y empleados)
router.get('/clientes/:id', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador', 'empleado']),
    userController.getClienteById
);

// Crear nuevo cliente (solo administradores)
router.post('/clientes', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.createCliente
);

// Actualizar cliente (administradores y empleados)
router.put('/clientes/:id', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador', 'empleado']),
    userController.updateCliente
);

// Buscar clientes (administradores y empleados)
router.get('/clientes/search/:term', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador', 'empleado']),
    userController.searchClientes
);

// Obtener estadísticas de clientes (administradores y empleados)
router.get('/clientes/stats/summary', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador', 'empleado']),
    userController.getClienteStats
);

// ===== RUTAS ESPECÍFICAS PARA EMPLEADOS =====

// Obtener todos los empleados (solo administradores)
router.get('/empleados/all', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.getAllEmpleados
);

// Obtener empleado por ID (solo administradores)
router.get('/empleados/:id', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.getEmpleadoById
);

// Crear nuevo empleado (solo administradores)
router.post('/empleados', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.createEmpleado
);

// Actualizar empleado (solo administradores)
router.put('/empleados/:id', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.updateEmpleado
);

// Buscar empleados (solo administradores)
router.get('/empleados/search/:term', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.searchEmpleados
);

// Obtener estadísticas de empleados (solo administradores)
router.get('/empleados/stats/summary', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.getEmpleadoStats
);

// ===== RUTAS DE GESTIÓN MASIVA =====

// Obtener usuarios recientes (solo administradores)
router.get('/recent/:limit?', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.getRecentUsers
);

// Exportar usuarios (solo administradores)
router.get('/export/csv', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.exportUsers
);

// Importar usuarios (solo administradores)
router.post('/import/csv', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.importUsers
);

// ===== RUTAS DE AUDITORÍA =====

// Obtener historial de cambios de usuario (solo administradores)
router.get('/:id/audit-log', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.getUserAuditLog
);

// Obtener actividad reciente de usuario (solo administradores)
router.get('/:id/activity', 
    authenticateToken, 
    checkUserActive, 
    checkUserType(['administrador']),
    userController.getUserActivity
);

export default router; 