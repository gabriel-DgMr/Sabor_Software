import PropTypes from 'prop-types';
import SelectSabor from '../../../shared/components/SelectSabor.jsx';
import {
  FaUtensils,
  FaSearch,
  FaPizzaSlice,
  FaHamburger,
  FaLeaf,
  FaGlassMartiniAlt,
  FaIceCream,
  FaBoxOpen,
  FaThList,
} from 'react-icons/fa';

const categoryIcons = {
  Pizza: <FaPizzaSlice />,
  Hamburguesas: <FaHamburger />,
  Ensaladas: <FaLeaf />,
  Bebidas: <FaGlassMartiniAlt />,
  Postres: <FaIceCream />,
  Combos: <FaBoxOpen />,
  default: <FaUtensils />,
};

const BarraFiltros = ({
  t,
  categorias,
  loadingCategorias,
  errorCategorias,
  categoriaSeleccionada,
  handleCategoriaChange,
  busqueda,
  handleBusquedaChange,
}) => {
  // Preparar opciones para el SelectSabor con iconos
  const opcionesCategorias = [
    {
      value: '',
      label: t('categorias_todas', 'Todas las categorías'),
      icon: <FaThList />,
    },
    ...(categorias || []).map(cat => ({
      value: cat.nombre_categoria,
      label: cat.nombre_categoria,
      icon: categoryIcons[cat.nombre_categoria] || categoryIcons['default'],
    })),
  ];

  // Determinar el icono a mostrar basado en la selección
  const iconoSeleccionado = categoriaSeleccionada ? (
    categoryIcons[categoriaSeleccionada] || categoryIcons['default']
  ) : (
    <FaThList />
  );

  return (
    <section className="barra-filtros-unificada">
      <div className="barra-filtros-unificada__contenedor">
        {/* Selector de Categorías (Nuevo) */}
        <div className="barra-filtros-unificada__categorias-select">
          <SelectSabor
            value={categoriaSeleccionada}
            onChange={e => handleCategoriaChange({ target: { value: e.target.value } })}
            options={opcionesCategorias}
            icon={iconoSeleccionado}
            className="barra-filtros-unificada__select"
          />
        </div>

        {/* Barra de Búsqueda Integrada */}
        <div className="barra-filtros-unificada__busqueda">
          <div className="barra-filtros-unificada__input-grupo">
            <FaSearch className="barra-filtros-unificada__busqueda-icono" />
            <input
              type="text"
              className="barra-filtros-unificada__search-input"
              placeholder={t('hero_buscar_placeholder', '¿Qué se te antoja hoy?')}
              value={busqueda}
              onChange={handleBusquedaChange}
            />
          </div>
          <button className="boton-moderno boton-moderno--primario barra-filtros-unificada__search-btn">
            {t('buscar', 'Buscar')}
          </button>
        </div>
      </div>
    </section>
  );
};

BarraFiltros.propTypes = {
  t: PropTypes.func.isRequired,
  categorias: PropTypes.array,
  loadingCategorias: PropTypes.bool,
  errorCategorias: PropTypes.any,
  categoriaSeleccionada: PropTypes.string,
  handleCategoriaChange: PropTypes.func.isRequired,
  orden: PropTypes.string,
  handleOrdenChange: PropTypes.func.isRequired,
  busqueda: PropTypes.string,
  handleBusquedaChange: PropTypes.func.isRequired,
};

export default BarraFiltros;
