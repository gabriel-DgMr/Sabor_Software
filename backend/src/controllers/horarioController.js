import { horarioModel } from '../models/horarioModel.js';

export const horarioController = {
  // Obtener fechas disponibles
  getFechasDisponibles: async (req, res) => {
    try {
      const fechasDisponibles = await horarioModel.getFechasDisponibles();
      res.json({ fechasDisponibles });
    } catch (error) {
      console.error('Error al obtener fechas disponibles:', error);
      res.status(500).json({ message: 'Error al obtener fechas disponibles' });
    }
  },

  // Obtener horarios disponibles para una fecha
  getHorariosDisponibles: async (req, res) => {
    try {
      const { fecha } = req.query;
            
      if (!fecha) {
        return res.status(400).json({ 
          message: 'Se requiere la fecha para obtener los horarios disponibles' 
        });
      }

      const horariosDisponibles = await horarioModel.getHorariosDisponibles(fecha);
      res.json({ horariosDisponibles });
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      res.status(500).json({ message: 'Error al obtener horarios disponibles' });
    }
  },

  // Verificar disponibilidad específica
  checkDisponibilidad: async (req, res) => {
    try {
      const { fecha, hora } = req.query;
            
      if (!fecha || !hora) {
        return res.status(400).json({ 
          message: 'Se requieren fecha y hora para verificar disponibilidad' 
        });
      }

      const disponible = await horarioModel.checkDisponibilidad(fecha, hora);
      res.json({ disponible });
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      res.status(500).json({ message: 'Error al verificar disponibilidad' });
    }
  }
}; 