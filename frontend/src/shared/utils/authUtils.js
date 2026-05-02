export const obtenerRutaPorRol = rol => {
  switch (rol) {
    case 'Administrador':
      return '/HomeAdministrador';
    case 'Empleado':
      return '/HomeEmpleados';
    case 'Usuario':
    default:
      return '/';
  }
};
