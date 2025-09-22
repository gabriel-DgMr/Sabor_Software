import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { dbConfig } from "../config/dbconfig.js";
const pool = mysql.createPool(dbConfig);

// Middleware para autenticar token
export const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "No autorizado - Token no proporcionado",
        code: "TOKEN_MISSING",
      });
    }

    if (typeof token !== "string" || token.length < 10) {
      return res.status(401).json({
        message: "No autorizado - Formato de token inválido",
        code: "TOKEN_INVALID_FORMAT",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");

    if (!decoded.id || !decoded.email || !decoded.rol) {
      return res.status(401).json({
        message: "No autorizado - Token malformado",
        code: "TOKEN_MALFORMED",
      });
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({
        message: "No autorizado - Token expirado",
        code: "TOKEN_EXPIRED",
      });
    }

    // Definir permisos por rol
    const rolePermissions = {
      Administrador: [
        "read",
        "write",
        "delete",
        "manage_users",
        "manage_products",
        "manage_orders",
        "manage_reservations",
        "view_dashboard",
        "manage_inventory",
      ],
      Empleado: ["read", "write", "manage_orders", "manage_reservations"],
      Usuario: ["read", "write_own", "manage_users_own", "read_own"],
    };
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
      nombre: decoded.nombre || null,
      permisos: rolePermissions[decoded.rol] || [],
    };

    // Actualizar last_active en la base de datos (no bloquear la request)
    pool
      .query("UPDATE usuarios SET last_active = NOW() WHERE id_usuario = ?", [
        decoded.id,
      ])
      .catch((err) => {
        console.error("Error actualizando last_active:", err.message);
      });

    next();
  } catch (error) {
    console.error("Error en autenticación:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "No autorizado - Token expirado",
        code: "TOKEN_EXPIRED",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        message: "No autorizado - Token inválido",
        code: "TOKEN_INVALID",
      });
    } else {
      return res.status(500).json({
        message: "Error interno del servidor",
        code: "INTERNAL_ERROR",
      });
    }
  }
};

// Middleware para verificar roles completos
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "No autorizado - cliente no autenticado",
        code: "USER_NOT_AUTHENTICATED",
      });
    }

    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        message: "No autorizado - Rol no permitido",
        code: "INSUFFICIENT_PERMISSIONS",
        requiredRoles: roles,
        userRole: req.user.rol,
      });
    }

    next();
  };
};

// Middleware para verificar que el cliente es propietario del recurso
export const checkOwnership = (resourceIdField = "id") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "No autorizado - cliente no autenticado",
        code: "USER_NOT_AUTHENTICATED",
      });
    }

    const resourceId = req.params[resourceIdField] || req.body[resourceIdField];

    if (!resourceId) {
      return res.status(400).json({
        message: "ID del recurso no proporcionado",
        code: "RESOURCE_ID_MISSING",
      });
    }

    if (
      req.user.rol === "Administrador" ||
      req.user.id.toString() === resourceId.toString()
    ) {
      return next();
    }

    return res.status(403).json({
      message: "No autorizado - No tienes permisos para este recurso",
      code: "RESOURCE_ACCESS_DENIED",
    });
  };
};

// Middleware para verificar permisos específicos
export const checkPermission = (permission, resourceIdField = "id") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "No autorizado - cliente no autenticado",
        code: "USER_NOT_AUTHENTICATED",
      });
    }

    // Definir permisos por rol
    const rolePermissions = {
      Administrador: [
        "read",
        "write",
        "delete",
        "manage_users",
        "manage_products",
        "manage_orders",
        "manage_reservations",
        "view_dashboard",
        "manage_inventory",
      ],
      Empleado: ["read", "write", "manage_orders", "manage_reservations"],
      Usuario: ["read", "write_own", "manage_users_own"],
    };

    const userPermissions = rolePermissions[req.user.rol] || [];

    // Caso especial: manage_users_own
    if (permission === "manage_users_own") {
      const resourceId =
        req.params[resourceIdField] || req.body[resourceIdField];

      if (
        userPermissions.includes("manage_users_own") &&
        resourceId &&
        req.user.id &&
        req.user.id.toString() === resourceId.toString()
      ) {
        return next();
      }
    } else {
      // Para permisos normales
      if (userPermissions.includes(permission)) {
        return next();
      }
    }

    return res.status(403).json({
      message: "No autorizado - Permiso insuficiente",
      code: "INSUFFICIENT_PERMISSIONS",
      requiredPermission: permission,
      userPermissions: userPermissions,
    });
  };
};

// Middleware para verificar que el cliente está activo
export const checkUserActive = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "No autorizado - cliente no autenticado",
      code: "USER_NOT_AUTHENTICATED",
    });
  }
  next();
};

// Middleware para logging de autenticación
export const logAuthAttempt = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString(),
    };

    if (req.user) {
      logData.userId = req.user.id;
      logData.userEmail = req.user.email;
      logData.userRole = req.user.rol;
    }

    console.log("Auth Log:", JSON.stringify(logData));
  });

  next();
};

// Middleware opcional: añade req.user si hay token, pero no obliga a estar autenticado
export const authenticateTokenOptional = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    if (!decoded.id || !decoded.email || !decoded.rol) {
      req.user = null;
      return next();
    }
    const rolePermissions = {
      Administrador: [
        "read",
        "write",
        "delete",
        "manage_users",
        "manage_products",
        "manage_orders",
        "manage_reservations",
        "view_dashboard",
        "manage_inventory",
      ],
      Empleado: ["read", "write", "manage_orders", "manage_reservations"],
      Usuario: ["read", "write_own", "manage_users_own", "read_own"],
    };
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
      nombre: decoded.nombre || null,
      permisos: rolePermissions[decoded.rol] || [],
    };
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export { authenticateToken as authMiddleware };
