import crypto from 'crypto';
import { createSecureLogger } from './logger.js';

const logger = createSecureLogger('tokenBlacklist');

// ✅ MEJORADO: Sistema de lista negra de tokens en memoria
// En producción, esto debería usar Redis o base de datos
class TokenBlacklist {
    constructor() {
        this.blacklist = new Set();
        this.cleanupInterval = 60 * 60 * 1000; // 1 hora
        this.maxSize = 10000; // Máximo 10,000 tokens en memoria
        
        // Limpiar tokens expirados periódicamente
        setInterval(() => this.cleanup(), this.cleanupInterval);
    }
    
    // ✅ MEJORADO: Agregar token a la lista negra
    add(token) {
        try {
            const tokenHash = this.hashToken(token);
            const jwt = require('jsonwebtoken');
            
            // Decodificar token para obtener fecha de expiración
            const decoded = jwt.decode(token);
            if (!decoded || !decoded.exp) {
                logger.warn('Token sin fecha de expiración no agregado a lista negra');
                return false;
            }
            
            // Crear entrada con expiración
            const entry = {
                hash: tokenHash,
                exp: decoded.exp * 1000, // Convertir a milisegundos
                addedAt: Date.now()
            };
            
            this.blacklist.add(JSON.stringify(entry));
            
            logger.info('Token agregado a lista negra', {
                tokenHash,
                expiresAt: new Date(entry.exp).toISOString()
            });
            
            // Limpiar si la lista está muy grande
            if (this.blacklist.size > this.maxSize) {
                this.cleanup();
            }
            
            return true;
            
        } catch (error) {
            logger.error('Error al agregar token a lista negra', {
                error: error.message
            });
            return false;
        }
    }
    
    // ✅ MEJORADO: Verificar si un token está en la lista negra
    isBlacklisted(token) {
        try {
            const tokenHash = this.hashToken(token);
            
            // Buscar en la lista negra
            for (const entryStr of this.blacklist) {
                const entry = JSON.parse(entryStr);
                if (entry.hash === tokenHash) {
                    // Verificar si el token aún no ha expirado
                    if (Date.now() < entry.exp) {
                        logger.info('Token encontrado en lista negra', {
                            tokenHash,
                            expiresAt: new Date(entry.exp).toISOString()
                        });
                        return true;
                    } else {
                        // Token expirado, remover de lista negra
                        this.blacklist.delete(entryStr);
                    }
                }
            }
            
            return false;
            
        } catch (error) {
            logger.error('Error al verificar token en lista negra', {
                error: error.message
            });
            // Por seguridad, considerar como blacklisted si hay error
            return true;
        }
    }
    
    // ✅ MEJORADO: Limpiar tokens expirados
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const entryStr of this.blacklist) {
            try {
                const entry = JSON.parse(entryStr);
                if (now >= entry.exp) {
                    this.blacklist.delete(entryStr);
                    cleanedCount++;
                }
            } catch (error) {
                // Entrada inválida, remover
                this.blacklist.delete(entryStr);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            logger.info('Limpieza de lista negra completada', {
                tokensRemoved: cleanedCount,
                remainingTokens: this.blacklist.size
            });
        }
    }
    
    // ✅ MEJORADO: Obtener estadísticas de la lista negra
    getStats() {
        return {
            totalTokens: this.blacklist.size,
            maxSize: this.maxSize,
            lastCleanup: new Date().toISOString()
        };
    }
    
    // ✅ MEJORADO: Invalidar todos los tokens de un usuario
    invalidateUserTokens(userId) {
        // Para implementar esto, necesitaríamos incluir el userId en el token
        // y mantener un mapeo de userId -> tokens
        logger.info('Invalidación de tokens por usuario solicitada', {
            userId: crypto.createHash('sha256').update(userId.toString()).digest('hex').substring(0, 8)
        });
        
        // TODO: Implementar invalidación por usuario
        // Esto requeriría cambios en la estructura de datos
    }
    
    // ✅ MEJORADO: Limpiar toda la lista negra (usar con precaución)
    clear() {
        const prevSize = this.blacklist.size;
        this.blacklist.clear();
        
        logger.warn('Lista negra completamente limpiada', {
            tokensRemoved: prevSize
        });
    }
    
    // ✅ MEJORADO: Función privada para hash de tokens
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}

// ✅ MEJORADO: Instancia singleton
const tokenBlacklist = new TokenBlacklist();

export { tokenBlacklist };

// ✅ MEJORADO: Función para uso en routes de logout
export const addTokenToBlacklist = (token) => {
    return tokenBlacklist.add(token);
};

// ✅ MEJORADO: Función para middleware de autenticación
export const isTokenBlacklisted = (token) => {
    return tokenBlacklist.isBlacklisted(token);
};

// ✅ MEJORADO: Función para obtener estadísticas (útil para monitoring)
export const getBlacklistStats = () => {
    return tokenBlacklist.getStats();
};

// ✅ MEJORADO: Función para invalidar tokens de usuario específico
export const invalidateUserTokens = (userId) => {
    return tokenBlacklist.invalidateUserTokens(userId);
};

// ✅ MEJORADO: Función para limpiar manualmente (útil para mantenimiento)
export const cleanupBlacklist = () => {
    tokenBlacklist.cleanup();
};

// ✅ MEJORADO: Versión mejorada para producción usando Redis
export class RedisTokenBlacklist {
    constructor(redisClient) {
        this.redis = redisClient;
        this.keyPrefix = 'blacklist:token:';
        this.userPrefix = 'blacklist:user:';
    }
    
    async add(token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.decode(token);
            
            if (!decoded || !decoded.exp) {
                return false;
            }
            
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const key = this.keyPrefix + tokenHash;
            const ttl = decoded.exp - Math.floor(Date.now() / 1000);
            
            if (ttl > 0) {
                await this.redis.setex(key, ttl, 'blacklisted');
                
                // También mantener referencia por usuario
                if (decoded.id) {
                    const userKey = this.userPrefix + decoded.id;
                    await this.redis.sadd(userKey, tokenHash);
                    await this.redis.expire(userKey, ttl);
                }
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            logger.error('Error al agregar token a Redis blacklist', {
                error: error.message
            });
            return false;
        }
    }
    
    async isBlacklisted(token) {
        try {
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const key = this.keyPrefix + tokenHash;
            const result = await this.redis.get(key);
            
            return result === 'blacklisted';
            
        } catch (error) {
            logger.error('Error al verificar token en Redis blacklist', {
                error: error.message
            });
            return true; // Por seguridad, considerar como blacklisted
        }
    }
    
    async invalidateUserTokens(userId) {
        try {
            const userKey = this.userPrefix + userId;
            const tokenHashes = await this.redis.smembers(userKey);
            
            const pipeline = this.redis.pipeline();
            tokenHashes.forEach(tokenHash => {
                pipeline.del(this.keyPrefix + tokenHash);
            });
            pipeline.del(userKey);
            
            await pipeline.exec();
            
            logger.info('Tokens de usuario invalidados', {
                userId: crypto.createHash('sha256').update(userId.toString()).digest('hex').substring(0, 8),
                tokensInvalidated: tokenHashes.length
            });
            
            return true;
            
        } catch (error) {
            logger.error('Error al invalidar tokens de usuario', {
                error: error.message
            });
            return false;
        }
    }
} 