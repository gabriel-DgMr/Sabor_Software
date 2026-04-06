import React from 'react';
import { useUsuariosAdministrador } from '../hooks/useUsuariosAdministrador';
import UsuariosAdministradorUI from '../components/UsuariosAdministradorUI';

const UsuariosAdministrador = () => {
  const hookData = useUsuariosAdministrador();
  return <UsuariosAdministradorUI {...hookData} />;
};

export default UsuariosAdministrador;
