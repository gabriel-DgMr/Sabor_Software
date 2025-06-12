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
            return { ...state, loading: action.payload, error: null };
        case 'SET_PRODUCTOS':
            return { ...state, productos: action.payload, loading: false, error: null };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'ADD_PRODUCTO':
            return { 
                ...state, 
                productos: [...state.productos, action.payload],
                loading: false,
                error: null 
            };
        case 'UPDATE_PRODUCTO':
            return {
                ...state,
                productos: state.productos.map(p =>
                    p.id_producto === action.payload.id_producto ? action.payload : p
                ),
                loading: false,
                error: null
            };
        case 'DELETE_PRODUCTO':
            return {
                ...state,
                productos: state.productos.filter(p => p.id_producto !== action.payload),
                loading: false,
                error: null
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