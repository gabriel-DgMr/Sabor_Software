import { createContext, useContext, useState, useEffect } from 'react';

import { categoriaService } from '../services/categoriaService.js';

const CategoriaContext = createContext();

export const CategoriaProvider = ({ children }) => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                setLoading(true);
                const data = await categoriaService.getAllCategorias();
                setCategorias(data);
                setError(null);
            } catch (error) {
                setError('Error al cargar las categorías');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarCategorias();
    }, []);

    return (
        <CategoriaContext.Provider value={{ categorias, loading, error }}>
            {children}
        </CategoriaContext.Provider>
    );
};

export const useCategorias = () => {
    const context = useContext(CategoriaContext);
    if (!context) {
        throw new Error('useCategorias debe ser usado dentro de un CategoriaProvider');
    }
    return context;
}; 