/**
 * Logger seguro para el Backend de SABOR.
 * Re-exporta el appLogger del middleware para uso general en la aplicación.
 */
import { appLogger } from "../middlewares/logger.js";

export default appLogger;
