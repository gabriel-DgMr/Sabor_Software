import PropTypes from 'prop-types';
import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { categoriaService } from '../services/categoriaService.js';

const CategoriaContext = createContext();

export const CategoriaProvider = ({ children }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  const cargarCategorias = async idioma => {
    try {
      setLoading(true);
      const data = await categoriaService.getAllCategorias(idioma);
      setCategorias(data);
      setError(null);
    } catch (error) {
      setError('Error al cargar las categorías');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias(i18n.language);
  }, [i18n.language]);

  return (
    <CategoriaContext.Provider
      value={{ categorias, loading, error, recargarCategorias: cargarCategorias }}
    >
      {children}
    </CategoriaContext.Provider>
  );
};

CategoriaProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCategorias = () => {
  const context = useContext(CategoriaContext);
  if (!context) {
    throw new Error('useCategorias debe ser usado dentro de un CategoriaProvider');
  }
  return context;
};
