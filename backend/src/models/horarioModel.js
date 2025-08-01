import { dbConfig } from '../config/dbconfig.js';
import mysql from 'mysql2/promise';

const pool = mysql.createPool(dbConfig);

export const horarioModel = {
    // Obtener fechas disponibles para los próximos 7 días
    getFechasDisponibles: async () => {
        try {
            const fechasDisponibles = [];
            const hoy = new Date();
            
            // Generar fechas para los próximos 7 días
            for (let i = 0; i < 7; i++) {
                const fecha = new Date(hoy);
                fecha.setDate(hoy.getDate() + i);
                
                // Verificar si hay excepciones para esta fecha
                const [excepciones] = await pool.query(
                    'SELECT * FROM excepciones_horarios WHERE fecha = ? AND activo = 1',
                    [fecha.toISOString().split('T')[0]]
                );

                // Obtener el día de la semana
                const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();
                
                // Verificar si hay horarios configurados para este día
                const [horarios] = await pool.query(
                    'SELECT * FROM configuracion_horarios WHERE dia_semana = ? AND activo = 1',
                    [diaSemana]
                );

                // La fecha está disponible si tiene horarios configurados o excepciones
                const disponible = horarios.length > 0 || excepciones.length > 0;

                fechasDisponibles.push({
                    fecha: fecha.toISOString().split('T')[0],
                    formato: fecha.toLocaleDateString('es-ES', { 
                        weekday: 'short',
                        day: '2-digit'
                    }).toUpperCase(),
                    disponible
                });
            }

            return fechasDisponibles;
        } catch (error) {
            console.error('Error al obtener fechas disponibles:', error);
            throw error;
        }
    },

    // Obtener horarios disponibles para una fecha específica
    getHorariosDisponibles: async (fecha) => {
        try {
            // Obtener el día de la semana
            const diaSemana = new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();
            
            // Verificar si hay excepciones para esa fecha
            const [excepciones] = await pool.query(
                'SELECT * FROM excepciones_horarios WHERE fecha = ? AND activo = 1',
                [fecha]
            );

            let posiblesHorarios = [];
            
            // Si hay excepciones, usar esas configuraciones para los posibles horarios
            if (excepciones.length > 0) {
                posiblesHorarios = excepciones.map(ex => ex.hora_inicio);
            } else {
                // Si no hay excepciones, usar la configuración normal
                const [horariosConfig] = await pool.query(
                    'SELECT * FROM configuracion_horarios WHERE dia_semana = ? AND activo = 1 ORDER BY hora_inicio',
                    [diaSemana]
                );
                posiblesHorarios = horariosConfig.map(h => h.hora_inicio);
            }

            const horariosConDisponibilidad = [];

            // Para cada posible horario, verificar su disponibilidad
            for (const hora of posiblesHorarios) {
                const capacidadMaxima = await horarioModel.obtenerCapacidadMaxima(fecha, hora);
                
                // Contar reservas existentes para esa fecha y hora
                const [reservas] = await pool.query(
                    'SELECT COUNT(*) as total FROM reservaciones WHERE fecha_reservacion = ? AND hora_reservacion = ?',
                    [fecha, hora]
                );

                const disponible = reservas[0].total < capacidadMaxima;

                horariosConDisponibilidad.push({
                    hora: hora,
                    disponible: disponible
                });
            }

            return horariosConDisponibilidad;
        } catch (error) {
            console.error('Error al obtener horarios disponibles:', error);
            throw error;
        }
    },

    // Verificar disponibilidad específica
    checkDisponibilidad: async (fecha, hora) => {
        try {
            // Obtener la capacidad máxima para ese horario
            const capacidadMaxima = await horarioModel.obtenerCapacidadMaxima(fecha, hora);
            
            // Contar reservas existentes
            const [reservas] = await pool.query(
                'SELECT COUNT(*) as total FROM reservaciones WHERE fecha_reservacion = ? AND hora_reservacion = ?',
                [fecha, hora]
            );

            return reservas[0].total < capacidadMaxima;
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            throw error;
        }
    },

    // Obtener capacidad máxima para un horario específico
    obtenerCapacidadMaxima: async (fecha, hora) => {
        try {
            const diaSemana = new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();
            
            // Verificar si hay excepción para esa fecha
            const [excepcion] = await pool.query(
                'SELECT capacidad_maxima FROM excepciones_horarios WHERE fecha = ? AND hora_inicio <= ? AND hora_fin >= ? AND activo = 1',
                [fecha, hora, hora]
            );

            if (excepcion.length > 0) {
                return excepcion[0].capacidad_maxima;
            }

            // Si no hay excepción, usar la configuración normal
            const [horario] = await pool.query(
                'SELECT capacidad_maxima FROM configuracion_horarios WHERE dia_semana = ? AND hora_inicio <= ? AND hora_fin >= ? AND activo = 1',
                [diaSemana, hora, hora]
            );

            return horario[0]?.capacidad_maxima || 0;
        } catch (error) {
            console.error('Error al obtener capacidad máxima:', error);
            throw error;
        }
    }
}; 