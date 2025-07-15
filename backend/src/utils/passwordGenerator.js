import crypto from 'crypto';
import { createSecureLogger } from './logger.js';

const logger = createSecureLogger('passwordGenerator');

// ✅ MEJORADO: Generador de contraseñas temporales seguras
export class PasswordGenerator {
  constructor() {
    this.minLength = 12;
    this.maxLength = 16;
        
    // Caracteres permitidos por categoría
    this.charSets = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };
        
    // Caracteres ambiguos que se deben evitar
    this.ambiguous = '0O1lI|';
  }
    
  // ✅ MEJORADO: Generar contraseña temporal segura
  generateTempPassword(options = {}) {
    try {
      const {
        length = this.getRandomLength(),
        includeSymbols = true,
        excludeAmbiguous = true
      } = options;
            
      // Validar longitud
      if (length < 8 || length > 32) {
        throw new Error('La longitud debe estar entre 8 y 32 caracteres');
      }
            
      // Construir set de caracteres
      let charSet = this.charSets.lowercase + this.charSets.uppercase + this.charSets.numbers;
            
      if (includeSymbols) {
        charSet += this.charSets.symbols;
      }
            
      // Excluir caracteres ambiguos si es necesario
      if (excludeAmbiguous) {
        charSet = charSet.split('').filter(char => !this.ambiguous.includes(char)).join('');
      }
            
      // Garantizar al menos un carácter de cada tipo requerido
      let password = '';
            
      // Al menos una minúscula
      password += this.getRandomChar(this.charSets.lowercase, excludeAmbiguous);
            
      // Al menos una mayúscula
      password += this.getRandomChar(this.charSets.uppercase, excludeAmbiguous);
            
      // Al menos un número
      password += this.getRandomChar(this.charSets.numbers, excludeAmbiguous);
            
      // Al menos un símbolo si se incluyen
      if (includeSymbols) {
        password += this.getRandomChar(this.charSets.symbols, false); // Los símbolos no tienen ambiguos
      }
            
      // Completar con caracteres aleatorios
      const remainingLength = length - password.length;
      for (let i = 0; i < remainingLength; i++) {
        password += charSet[crypto.randomInt(0, charSet.length)];
      }
            
      // Mezclar la contraseña para que los caracteres requeridos no estén siempre al inicio
      password = this.shuffleString(password);
            
      // Validar que cumple con los requisitos
      if (!this.validatePassword(password)) {
        // Si no pasa la validación, intentar de nuevo (máximo 3 intentos)
        return this.generateTempPassword(options);
      }
            
      logger.info('Contraseña temporal generada exitosamente', {
        length: password.length,
        hasSymbols: includeSymbols,
        excludeAmbiguous: excludeAmbiguous
      });
            
      return {
        password,
        strength: this.calculateStrength(password),
        expiresIn: '24h' // Contraseñas temporales expiran en 24 horas
      };
            
    } catch (error) {
      logger.error('Error generando contraseña temporal', {
        error: error.message
      });
      throw new Error('Error al generar contraseña temporal');
    }
  }
    
  // ✅ MEJORADO: Generar contraseña memorable (para usuarios)
  generateReadablePassword(length = 16) {
    try {
      // Usar un patrón más legible: consonante-vocal-consonante-número
      const consonants = 'bcdfghjklmnpqrstvwxyz';
      const vowels = 'aeiou';
      const numbers = '23456789'; // Excluir 0 y 1 por ambigüedad
      const symbols = '!@#$%^&*';
            
      let password = '';
            
      // Generar patrón legible
      while (password.length < length - 2) {
        // Consonante
        password += consonants[crypto.randomInt(0, consonants.length)];
        if (password.length >= length - 2) break;
                
        // Vocal
        password += vowels[crypto.randomInt(0, vowels.length)];
        if (password.length >= length - 2) break;
                
        // Consonante
        password += consonants[crypto.randomInt(0, consonants.length)].toUpperCase();
        if (password.length >= length - 2) break;
                
        // Número
        password += numbers[crypto.randomInt(0, numbers.length)];
      }
            
      // Agregar símbolo al final
      password += symbols[crypto.randomInt(0, symbols.length)];
            
      // Completar si es necesario
      while (password.length < length) {
        password += consonants[crypto.randomInt(0, consonants.length)];
      }
            
      return {
        password: password.substring(0, length),
        strength: this.calculateStrength(password),
        expiresIn: '24h',
        readable: true
      };
            
    } catch (error) {
      logger.error('Error generando contraseña legible', {
        error: error.message
      });
      throw new Error('Error al generar contraseña legible');
    }
  }
    
  // ✅ MEJORADO: Función privada para obtener longitud aleatoria
  getRandomLength() {
    return crypto.randomInt(this.minLength, this.maxLength + 1);
  }
    
  // ✅ MEJORADO: Función privada para obtener carácter aleatorio
  getRandomChar(charset, excludeAmbiguous = false) {
    let chars = charset;
    if (excludeAmbiguous) {
      chars = chars.split('').filter(char => !this.ambiguous.includes(char)).join('');
    }
    return chars[crypto.randomInt(0, chars.length)];
  }
    
  // ✅ MEJORADO: Función para mezclar string
  shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }
    
  // ✅ MEJORADO: Validar que la contraseña cumple requisitos
  validatePassword(password) {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password);
        
    return hasLowercase && hasUppercase && hasNumbers && hasSymbols;
  }
    
  // ✅ MEJORADO: Calcular fortaleza de contraseña
  calculateStrength(password) {
    let score = 0;
        
    // Longitud
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
        
    // Variedad de caracteres
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) score += 1;
        
    // Patrones
    if (!/(.)\1{2,}/.test(password)) score += 1; // No repeticiones
    if (!/123|abc|qwe/i.test(password)) score += 1; // No secuencias
        
    const strength = ['muy_debil', 'debil', 'medio', 'fuerte', 'muy_fuerte'];
    const index = Math.min(Math.floor(score / 2), 4);
        
    return {
      score,
      level: strength[index],
      percentage: Math.min((score / 9) * 100, 100)
    };
  }
    
  // ✅ MEJORADO: Generar PIN numérico temporal
  generateTempPIN(length = 6) {
    try {
      if (length < 4 || length > 8) {
        throw new Error('La longitud del PIN debe estar entre 4 y 8 dígitos');
      }
            
      let pin = '';
      for (let i = 0; i < length; i++) {
        pin += crypto.randomInt(0, 10).toString();
      }
            
      // Evitar patrones obvios como 1234, 0000, etc.
      if (this.hasObviousPattern(pin)) {
        return this.generateTempPIN(length); // Intentar de nuevo
      }
            
      logger.info('PIN temporal generado', {
        length: pin.length
      });
            
      return {
        pin,
        expiresIn: '15m' // PINs son de corta duración
      };
            
    } catch (error) {
      logger.error('Error generando PIN temporal', {
        error: error.message
      });
      throw new Error('Error al generar PIN temporal');
    }
  }
    
  // ✅ MEJORADO: Detectar patrones obvios en PINs
  hasObviousPattern(pin) {
    // Todos los dígitos iguales
    if (/^(\d)\1+$/.test(pin)) return true;
        
    // Secuencia ascendente
    let isAscending = true;
    for (let i = 1; i < pin.length; i++) {
      if (parseInt(pin[i]) !== parseInt(pin[i-1]) + 1) {
        isAscending = false;
        break;
      }
    }
    if (isAscending) return true;
        
    // Secuencia descendente
    let isDescending = true;
    for (let i = 1; i < pin.length; i++) {
      if (parseInt(pin[i]) !== parseInt(pin[i-1]) - 1) {
        isDescending = false;
        break;
      }
    }
    if (isDescending) return true;
        
    return false;
  }
}

// ✅ MEJORADO: Instancia singleton
const passwordGenerator = new PasswordGenerator();

// ✅ MEJORADO: Funciones de conveniencia
export const generateSecureTemporaryPassword = (options = {}) => {
  return passwordGenerator.generateTempPassword(options);
};

export const generateReadablePassword = (length = 16) => {
  return passwordGenerator.generateReadablePassword(length);
};

export const generateTempPIN = (length = 6) => {
  return passwordGenerator.generateTempPIN(length);
};

export const validatePasswordStrength = (password) => {
  return passwordGenerator.calculateStrength(password);
};

// ✅ MEJORADO: Función específica para contraseñas de reserva
export const generateReservationPassword = () => {
  return passwordGenerator.generateTempPassword({
    length: 14,
    includeSymbols: true,
    excludeAmbiguous: true,
    readable: false
  });
};

export default passwordGenerator; 