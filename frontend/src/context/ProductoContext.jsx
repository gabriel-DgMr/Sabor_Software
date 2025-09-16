import PropTypes from 'prop-types';
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';

import { productoService } from '../services/productoService';

const ProductoContext = createContext();

const initialState = {
  productos: [],
  productosFiltrados: [],
  loading: false,
  error: null,
  filtrosAplicados: {
    categoria: '',
    busqueda: '',
    orden: '',
  },
};

const productoReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_PRODUCTOS':
      return {
        ...state,
        productos: action.payload,
        productosFiltrados: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'APPLY_FILTERS':
      return {
        ...state,
        productosFiltrados: action.payload.productosFiltrados,
        filtrosAplicados: action.payload.filtros,
        loading: false,
        error: null,
      };
    case 'ADD_PRODUCTO':
      return {
        ...state,
        productos: [...state.productos, action.payload],
        productosFiltrados: [...state.productosFiltrados, action.payload],
        loading: false,
        error: null,
      };
    case 'UPDATE_PRODUCTO':
      return {
        ...state,
        productos: state.productos.map(p =>
          p.id_producto === action.payload.id_producto ? action.payload : p
        ),
        productosFiltrados: state.productosFiltrados.map(p =>
          p.id_producto === action.payload.id_producto ? action.payload : p
        ),
        loading: false,
        error: null,
      };
    case 'DELETE_PRODUCTO':
      return {
        ...state,
        productos: state.productos.filter(p => p.id_producto !== action.payload),
        productosFiltrados: state.productosFiltrados.filter(p => p.id_producto !== action.payload),
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const ProductoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productoReducer, initialState);
  const { i18n } = useTranslation();
  const idioma = i18n.language || 'es';

  // Función optimizada para obtener productos filtrados
  const getProductosFiltrados = useCallback(
    async (filtros = {}) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Si no hay filtros, usar los productos ya cargados
        if (!filtros.categoria && !filtros.busqueda && !filtros.orden) {
          dispatch({
            type: 'APPLY_FILTERS',
            payload: {
              productosFiltrados: state.productos,
              filtros,
            },
          });
          return;
        }

        // Solo hacer llamada al backend si hay filtros específicos
        const productos = await productoService.getProductos(filtros, idioma);
        dispatch({
          type: 'APPLY_FILTERS',
          payload: {
            productosFiltrados: productos,
            filtros,
          },
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },
    [state.productos, idioma]
  );

  // Función para aplicar filtros localmente (más rápida)
  const aplicarFiltrosLocales = useCallback(
    filtros => {
      let productosFiltrados = [...state.productos];

      // Filtrar por categoría
      if (filtros.categoria) {
        productosFiltrados = productosFiltrados.filter(
          producto => String(producto.id_categoria) === String(filtros.categoria)
        );
      }

      // Filtrar por búsqueda
      if (filtros.busqueda) {
        const busquedaLower = filtros.busqueda.toLowerCase();
        productosFiltrados = productosFiltrados.filter(
          producto =>
            producto.nombre_producto.toLowerCase().includes(busquedaLower) ||
            producto.descripcion_producto.toLowerCase().includes(busquedaLower)
        );
      }

      // Ordenar
      if (filtros.orden) {
        productosFiltrados.sort((a, b) => {
          switch (filtros.orden) {
            case 'precio_asc':
              return a.precio_producto - b.precio_producto;
            case 'precio_desc':
              return b.precio_producto - a.precio_producto;
            case 'calificacion':
              return (b.calificacion_producto || 0) - (a.calificacion_producto || 0);
            case 'ventas':
              return (b.ventas_producto || 0) - (a.ventas_producto || 0);
            default:
              return 0;
          }
        });
      }

      dispatch({
        type: 'APPLY_FILTERS',
        payload: {
          productosFiltrados,
          filtros,
        },
      });
    },
    [state.productos]
  );

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const productos = await productoService.getProductos({}, idioma);
        dispatch({ type: 'SET_PRODUCTOS', payload: productos });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };

    cargarProductos();
  }, [idioma]);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      getProductosFiltrados,
      aplicarFiltrosLocales,
    }),
    [state, getProductosFiltrados, aplicarFiltrosLocales]
  );

  return <ProductoContext.Provider value={contextValue}>{children}</ProductoContext.Provider>;
};

ProductoProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProductos = () => {
  const context = useContext(ProductoContext);
  if (!context) {
    throw new Error('useProductos debe ser usado dentro de un ProductoProvider');
  }
  return context;
};
