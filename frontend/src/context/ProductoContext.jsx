import React, { createContext, useContext, useReducer } from 'react';

const ProductoContext = createContext();

const initialState = {
    productos: [],
    loading: false,
    error: null
};

const productoReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: true, error: null };
        case 'SET_PRODUCTOS':
            return { ...state, productos: action.payload, loading: false };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'ADD_PRODUCTO':
            return { ...state, productos: [...state.productos, action.payload] };
        case 'UPDATE_PRODUCTO':
            return {
                ...state,
                productos: state.productos.map(p =>
                    p.id === action.payload.id ? action.payload : p
                )
            };
        case 'DELETE_PRODUCTO':
            return {
                ...state,
                productos: state.productos.filter(p => p.id !== action.payload)
            };
        default:
            return state;
    }
};

export const ProductoProvider = ({ children }) => {
    const [state, dispatch] = useReducer(productoReducer, initialState);
    return (
        <ProductoContext.Provider value={{ state, dispatch }}>
            {children}
        </ProductoContext.Provider>
    );
};

export const useProductos = () => {
    const context = useContext(ProductoContext);
    if (!context) {
        throw new Error('useProductos debe ser usado dentro de un ProductoProvider');
    }
    return context;
};