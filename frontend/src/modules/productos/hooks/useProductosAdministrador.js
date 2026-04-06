import { useEffect, useState } from 'react';
import { useCategorias } from '../../../shared/context/CategoriaContext.jsx';
import { useProductos } from '../../../shared/context/ProductoContext';
import { productosService } from '../services/productos-service';
import {
  ANIM_DURATION,
  VISIBLE_DURATION,
  animateElements,
} from '../../../shared/utils/animationUtils';
import { validarProducto, validarImagen } from '../utils/validaciones';

export const useProductosAdministrador = () => {
  const { state, dispatch } = useProductos();
  const { categorias, loading: categoriasLoading, error: categoriasError } = useCategorias();
  const [formData, setFormData] = useState({
    nombre_producto: '',
    descripcion_producto: '',
    descripcion_en: '',
    precio_producto: '',
    id_categoria_producto: '',
    imagen_producto: null,
    stock: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    delete: {},
    edit: {},
    submit: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const productos = await productosService.obtenerTodos({}, 'es');
        dispatch({ type: 'SET_PRODUCTOS', payload: productos });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    cargarProductos();
  }, [dispatch]);

  // El manejo de errores ahora es persistente hasta que el usuario corrija el campo,
  // siguiendo el patrón de la arquitectura SABOR.

  const handleInputChange = e => {
    const { name, value, type, files } = e.target;

    if (type === 'file' && files[0]) {
      const previewUrl = URL.createObjectURL(files[0]);
      setImagePreview(previewUrl);

      setFormData(prev => ({
        ...prev,
        [name]: files[0],
      }));
    } else if (name === 'precio_producto') {
      let numericValue = value.replace(/\D/g, '');
      if (numericValue) {
        numericValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
      setFormData(prev => ({
        ...prev,
        [name]: numericValue,
      }));
    } else if (name === 'stock') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      const nuevosErrores = { ...errors };
      delete nuevosErrores[name];
      setErrors(nuevosErrores);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      imagen_producto: null,
    }));
  };

  const handleEditProduct = async producto => {
    setIsEditing(true);
    setEditingProductId(producto.id_producto);

    let descripcion_en = '';
    try {
      const traducciones = await productosService.obtenerTraducciones(producto.id_producto);
      const traduccionEn = traducciones.find(t => t.idioma === 'en');
      if (traduccionEn) {
        descripcion_en = traduccionEn.descripcion;
      }
    } catch (error) {
      console.error('Error al obtener traducciones:', error);
    }

    setFormData({
      nombre_producto: producto.nombre_producto,
      descripcion_producto: producto.descripcion_producto,
      descripcion_en: descripcion_en,
      precio_producto: producto.precio_producto.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      id_categoria_producto: producto.id_categoria_producto,
      imagen_producto: null,
      stock: producto.stock?.toString() ?? '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async idProducto => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        setLoadingStates(prev => ({
          ...prev,
          delete: { ...prev.delete, [idProducto]: true },
        }));
        await productosService.eliminar(idProducto);
        const productos = await productosService.obtenerTodos();
        dispatch({ type: 'SET_PRODUCTOS', payload: productos });
        setSuccessMessage('Producto eliminado exitosamente');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        setLoadingStates(prev => ({
          ...prev,
          delete: { ...prev.delete, [idProducto]: false },
        }));
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, submit: true }));
    console.log('🚀 Iniciando handleSubmit', { isEditing, formData });

    try {
      // 1. Preparar datos para validación (asegurando tipos correctos)
      const precioLimpio = (formData.precio_producto || '0')
        .toString()
        .replace(/\./g, '')
        .replace(',', '.');

      const formDataForValidation = {
        nombre_producto: formData.nombre_producto || '',
        descripcion_producto: formData.descripcion_producto || '',
        precio_producto: precioLimpio,
        id_categoria_producto: formData.id_categoria_producto?.toString() || '',
        stock: formData.stock?.toString() || '0',
      };

      // 2. Ejecutar validaciones
      console.log('📋 Validando datos:', formDataForValidation);
      const validationErrors = validarProducto(formDataForValidation);

      if (!isEditing) {
        if (formData.imagen_producto) {
          const imagenError = validarImagen(formData.imagen_producto);
          if (imagenError) validationErrors.imagen_producto = imagenError;
        } else {
          validationErrors.imagen_producto = 'La imagen es obligatoria para nuevos productos.';
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        console.warn('❌ Errores de validación:', validationErrors);
        setErrors(validationErrors);
        setLoadingStates(prev => ({ ...prev, submit: false }));
        return;
      }

      // 3. Enviar datos al servicio
      const datosParaEnviar = {
        ...formData,
        precio_producto: parseFloat(precioLimpio),
        stock: formData.stock ? parseInt(formData.stock, 10) : 0,
      };

      if (isEditing) {
        console.log('🔄 Actualizando producto:', editingProductId, datosParaEnviar);
        await productosService.actualizar(editingProductId, datosParaEnviar);
        setSuccessMessage('Producto actualizado exitosamente');
      } else {
        console.log('➕ Creando producto:', datosParaEnviar);
        await productosService.crear(datosParaEnviar);
        setSuccessMessage('Producto creado exitosamente');
      }

      // 4. Refrescar lista y limpiar formulario
      console.log('📥 Refrescando lista de productos...');
      const productos = await productosService.obtenerTodos();
      dispatch({ type: 'SET_PRODUCTOS', payload: productos });

      setFormData({
        nombre_producto: '',
        descripcion_producto: '',
        descripcion_en: '',
        precio_producto: '',
        id_categoria_producto: '',
        imagen_producto: null,
        stock: '',
      });
      setImagePreview(null);
      setEditingProductId(null);
      setIsModalOpen(false);

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('💥 Error en handleSubmit:', error);
      const mensajeError =
        error.response?.data?.message ||
        error.message ||
        'Error inesperado al procesar el producto';
      setErrors({ general: mensajeError });
      dispatch({
        type: 'SET_ERROR',
        payload: mensajeError,
      });
    } finally {
      console.log('🏁 Finalizando handleSubmit');
      setLoadingStates(prev => ({ ...prev, submit: false }));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingProductId(null);
    setFormData({
      nombre_producto: '',
      descripcion_producto: '',
      descripcion_en: '',
      precio_producto: '',
      id_categoria_producto: '',
      imagen_producto: null,
      stock: '',
    });
    setImagePreview(null);
    setErrors({});
    setIsModalOpen(false);
  };

  const filteredProducts = state.productos.filter(
    producto =>
      producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.nombre_categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    state,
    categorias,
    categoriasLoading,
    categoriasError,
    formData,
    setFormData,
    imagePreview,
    errors,
    successMessage,
    isEditing,
    loadingStates,
    handleInputChange,
    handleRemoveImage,
    handleEditProduct,
    handleDeleteProduct,
    handleSubmit,
    resetForm,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    isModalOpen,
    setIsModalOpen,
  };
};
