import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

/**
 * UsuarioFiltros - Controles de filtrado y búsqueda para la gestión de usuarios.
 */
const UsuarioFiltros = ({ filtro, setFiltro, busqueda, setBusqueda, conteoRoles }) => {
  const { t } = useTranslation();

  return (
    <div className="usuarios-controles">
      <div className="usuarios-filtros">
        <button
          className={`usuarios-filtros__boton ${filtro === 'todos' ? 'usuarios-filtros__boton--activo' : ''}`}
          onClick={() => setFiltro('todos')}
        >
          {t('admin.usuarios.todos')} ({conteoRoles.todos})
        </button>
        <button
          className={`usuarios-filtros__boton ${filtro === 'clientes' ? 'usuarios-filtros__boton--activo' : ''}`}
          onClick={() => setFiltro('clientes')}
        >
          {t('admin.usuarios.clientes')} ({conteoRoles.clientes})
        </button>
        <button
          className={`usuarios-filtros__boton ${filtro === 'empleados' ? 'usuarios-filtros__boton--activo' : ''}`}
          onClick={() => setFiltro('empleados')}
        >
          {t('admin.usuarios.empleados')} ({conteoRoles.empleados})
        </button>
        <button
          className={`usuarios-filtros__boton ${filtro === 'administradores' ? 'usuarios-filtros__boton--activo' : ''}`}
          onClick={() => setFiltro('administradores')}
        >
          {t('admin.usuarios.administradores')} ({conteoRoles.administradores})
        </button>
      </div>

      <div className="usuarios-busqueda">
        <input
          className="usuarios-busqueda__input"
          placeholder={t('admin.usuarios.buscar_placeholder')}
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>
    </div>
  );
};

UsuarioFiltros.propTypes = {
  filtro: PropTypes.string.isRequired,
  setFiltro: PropTypes.func.isRequired,
  busqueda: PropTypes.string.isRequired,
  setBusqueda: PropTypes.func.isRequired,
  conteoRoles: PropTypes.object.isRequired,
};

export default UsuarioFiltros;
