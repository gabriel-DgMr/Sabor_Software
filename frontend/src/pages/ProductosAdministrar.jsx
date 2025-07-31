import React, { useEffect, useState } from 'react';

import MenuLateral from '../components/MenuLateral';
import { useCategorias } from '../context/CategoriaContext.jsx';
import { useProductos } from '../context/ProductoContext';
import { productoService } from '../services/productoService';
import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../utils/animationUtils';
import { validarProducto, validarImagen } from '../utils/validaciones';
import { GoCheck, GoX } from 'react-icons/go';

import '../styles/empleados.css';

// Componente de alerta visualmente consistente para productos
const ProductosAlert = ({ type, message }) => {
  if (!message) return null;
  const icon = type === 'success'
    ? <GoCheck className="GoCheck" />
    : <GoX className="GoX" />;
  return (
    <div className="alerta-con-tarjeta">
      {icon}
      <span>{message}</span>
    </div>
  );
};

// Componente de error visualmente consistente para administración de productos
const ProductosError = ({ message, onRetry }) => {
  if (!message) return null;
  return (
    <div className="error-global">
      <GoX className="GoX" />
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
};

const ProductosAdministrar = () => {
  const { state, dispatch } = useProductos();
  const { categorias, loading: categoriasLoading, error: categoriasError } = useCategorias();
  const [formData, setFormData] = useState({
    nombre_producto: '',
    descripcion_producto: '',
    descripcion_en: '',
    precio_producto: '',
    id_categoria_producto: '',
    imagen_producto: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    delete: {},
    edit: {},
    submit: false
  });

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const productos = await productoService.obtenerTodos();
        
        dispatch({ type: 'SET_PRODUCTOS', payload: productos });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    cargarProductos();
  }, [dispatch]);

  const manejarErroresDeCampo = (newErrors) => {
    setErrors(newErrors);
    setTimeout(() => animateElements('.formulario__mensaje-error', 'fade-in'), 0);
    setTimeout(() => {
      document.querySelectorAll('.formulario__mensaje-error').forEach(el => {
        el.classList.remove('fade-in');
        el.classList.add('fade-out');
      });
      setTimeout(() => setErrors({}), ANIM_DURATION);
    }, VISIBLE_DURATION);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files[0]) {
      const previewUrl = URL.createObjectURL(files[0]);
      setImagePreview(previewUrl);
      
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else if (name === 'precio_producto') {
      // Eliminar todos los caracteres no numéricos
      let numericValue = value.replace(/\D/g, '');
      
      // Formatear con puntos cada 3 números
      if (numericValue) {
        numericValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      imagen_producto: null
    }));
  };

  const handleEditProduct = (producto) => {
    setIsEditing(true);
    setEditingProductId(producto.id_producto);
    setFormData({
      nombre_producto: producto.nombre_producto,
      descripcion_producto: producto.descripcion_producto,
      descripcion_en: producto.descripcion_en || '',
      precio_producto: producto.precio_producto.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      id_categoria_producto: producto.id_categoria_producto,
      imagen_producto: null
    });
    document.querySelector('.productos__editor').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteProduct = async (idProducto) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        setLoadingStates(prev => ({
          ...prev,
          delete: { ...prev.delete, [idProducto]: true }
        }));
        await productoService.eliminar(idProducto);
        const productos = await productoService.obtenerTodos();
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
          delete: { ...prev.delete, [idProducto]: false }
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, submit: true }));

    // Usar validaciones centralizadas
    const formDataForValidation = {
      nombre_producto: formData.nombre_producto,
      descripcion_producto: formData.descripcion_producto,
      precio_producto: formData.precio_producto.replace(/\./g, '').replace(',', '.'),
      id_categoria_producto: formData.id_categoria_producto
    };

    const validationErrors = validarProducto(formDataForValidation);

    // Validar imagen si es un nuevo producto
    if (!isEditing && formData.imagen_producto) {
      const imagenError = validarImagen(formData.imagen_producto);
      if (imagenError) {
        validationErrors.imagen_producto = imagenError;
      }
    } else if (!isEditing && !formData.imagen_producto) {
      validationErrors.imagen_producto = 'La imagen es obligatoria para nuevos productos.';
    }

    if (Object.keys(validationErrors).length > 0) {
      manejarErroresDeCampo(validationErrors);
      setLoadingStates(prev => ({ ...prev, submit: false }));
      return;
    }

    try {
      const datosParaEnviar = {
        ...formData,
        precio_producto: parseFloat(formData.precio_producto.replace(/\./g, '').replace(',', '.'))
      };

      if (isEditing) {
        await productoService.actualizar(editingProductId, datosParaEnviar);
        setSuccessMessage('Producto actualizado exitosamente');
      } else {
        await productoService.crear(datosParaEnviar);
        setSuccessMessage('Producto creado exitosamente');
      }
      
      const productos = await productoService.obtenerTodos();
      dispatch({ type: 'SET_PRODUCTOS', payload: productos });
      
      setFormData({
        nombre_producto: '',
        descripcion_producto: '',
        descripcion_en: '',
        precio_producto: '',
        id_categoria_producto: '',
        imagen_producto: null
      });
      setImagePreview(null);
      setIsEditing(false);
      setEditingProductId(null);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      setLoadingStates(prev => ({ ...prev, submit: false }));
    }
  };

  // Función para formatear el precio en la visualización
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  // Agrupar productos por categoría
  const productosPorCategoria = state.productos.reduce((acc, producto) => {
    const categoria = producto.nombre_categoria || 'Sin categoría';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(producto);
    return acc;
  }, {});

  if (state.loading) {
    return (
      <div className='layout'>
        <MenuLateral />
        <main className='productos__administrar'>
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Cargando productos...</p>
          </div>
        </main>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className='layout'>
        <MenuLateral />
        <main className='productos__administrar'>
          <ProductosError message={`Error al cargar productos: ${state.error}`} onRetry={() => window.location.reload()} />
        </main>
      </div>
    );
  }

  if (state.productos.length === 0) {
    return (
      <div className='layout'>
        <MenuLateral />
        <main className='productos__administrar'>
          <div className="empty-state">
            <p>No hay productos disponibles</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='layout'>
      <MenuLateral />
      <main className='productos__administrar'>
        <h1 className='titulos__empleados'>Productos</h1>
        <section className='productos__grid'>
          <div className='contenedor__productos-vista'>
            {Object.entries(productosPorCategoria).map(([categoria, productosCategoria]) => (
              <article key={categoria} className='productos__vista'>
                <h2 className='vista__titulo--primera'>Categoria: {categoria}</h2>
                <div className='productos__grid'>
                  {productosCategoria.map((producto) => (
                    <div key={producto.id_producto} className="productos__card-producto">
                      <img
                        alt={producto.nombre_producto}
                        className="productos__imagen"
                        src={`http://localhost:3000/uploads/productos/${producto.imagen_producto}`}
                      />
                      <div className="productos__info">
                        <h4 className="productos__nombre">{producto.nombre_producto}</h4>
                        <p className="productos__precio">{formatearPrecio(producto.precio_producto)}</p>
                        <div className="productos__acciones">
                          <button
                            className={`productos__boton productos__boton--editar ${loadingStates.edit[producto.id_producto] ? 'productos__boton--loading' : ''}`}
                            disabled={loadingStates.edit[producto.id_producto] || loadingStates.delete[producto.id_producto]}
                            type="button"
                            onClick={() => handleEditProduct(producto)}
                          >
                            {loadingStates.edit[producto.id_producto] ? (
                              <span className="loading-indicator" />
                            ) : (
                              'Editar'
                            )}
                          </button>
                          <button
                            className={`productos__boton productos__boton--eliminar ${loadingStates.delete[producto.id_producto] ? 'productos__boton--loading' : ''}`}
                            disabled={loadingStates.edit[producto.id_producto] || loadingStates.delete[producto.id_producto]}
                            type="button"
                            onClick={() => handleDeleteProduct(producto.id_producto)}
                          >
                            {loadingStates.delete[producto.id_producto] ? (
                              <span className="loading-indicator" />
                            ) : (
                              'Eliminar'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <article className='productos__editor'>
            <h2 className='editor__titulo'>
              {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>
            {successMessage && (
              <ProductosAlert type="success" message={successMessage} />
            )}
            <form className='editor__descripcion' onSubmit={handleSubmit}>
              <div className='descripcion__campo'>
                <label className='campo_p'>Nombre: </label>
                <input  
                  className={`campo__input ${errors.nombre_producto ? 'input--error' : ''}`}
                  name="nombre_producto"
                  type="text"
                  value={formData.nombre_producto}
                  onChange={handleInputChange}
                />
                {errors.nombre_producto && (
                  <small className="formulario__mensaje-error">{errors.nombre_producto}</small>
                )}
              </div>
              <div className='descripcion__campo'>
                <label className='campo_p'>
                    Categoria: 
                    {categoriasLoading && <span className="loading-indicator">...</span>}
                </label>
                <select 
                    className={`campo__input campo__input--categoria ${errors.id_categoria_producto ? 'input--error' : ''}`}
                    disabled={categoriasLoading}
                    id="categoria"
                    name="id_categoria_producto"
                    value={formData.id_categoria_producto || ""}
                    onChange={handleInputChange}
                >
                    <option className='campo__input--option' value="">Selecciona una categoría</option>
                    {categorias.map((categoria) => (
                        <option key={categoria.id_categoria} value={categoria.id_categoria}>
                            {categoria.nombre_categoria}
                        </option>
                    ))}
                </select>
                {errors.id_categoria_producto && (
                  <small className="formulario__mensaje-error">{errors.id_categoria_producto}</small>
                )}
                {categoriasError && (
                    <label className="error-message">
                        <svg 
                            fill="none"
                            height="16"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="16"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" x2="12" y1="8" y2="12" />
                            <line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                        {categoriasError}
                    </label>
                )}
              </div>
              <div className='descripcion__campo'>
                <label className='campo_p'>Precio: </label>
                <input 
                  className={`campo__input ${errors.precio_producto ? 'input--error' : ''}`}
                  name="precio_producto"
                  type="text"
                  value={formData.precio_producto}
                  onChange={handleInputChange}
                />
                {errors.precio_producto && (
                  <small className="formulario__mensaje-error">{errors.precio_producto}</small>
                )}
              </div>
              <div className='descripcion__campo'>
                <label className='campo_p'>Descripcion: </label>
                <textarea  
                  className={`campo__input campo__input--textaera ${errors.descripcion_producto ? 'input--error' : ''}`}
                  name="descripcion_producto"
                  value={formData.descripcion_producto}
                  onChange={handleInputChange}
                />
                {errors.descripcion_producto && (
                  <small className="formulario__mensaje-error">{errors.descripcion_producto}</small>
                )}
              </div>
              <div className='descripcion__campo'>
                <label className='campo_p'>Descripción (Inglés): </label>
                <textarea  
                  className="campo__input campo__input--textaera"
                  name="descripcion_en"
                  value={formData.descripcion_en}
                  onChange={handleInputChange}
                />
              </div>
              <div className='descripcion__campo'>
                <label className='campo_p'>Imagen: </label>
                <input  
                  accept="image/*"
                  className={`campo__input campo__input--img ${errors.imagen_producto ? 'input--error' : ''}`}
                  data-file-name={formData.imagen_producto ? formData.imagen_producto.name : ''}
                  name="imagen_producto"
                  type="file"
                  onChange={handleInputChange}
                />
                {errors.imagen_producto && (
                  <small className="formulario__mensaje-error">{errors.imagen_producto}</small>
                )}
                {imagePreview && (
                  <div className="image-preview-container">
                    <img 
                      alt="Vista previa"
                      className="image-preview"
                      src={imagePreview}
                    />
                    <button 
                      className="remove-image-btn"
                      type="button"
                      onClick={handleRemoveImage}
                    >
                      Eliminar imagen
                    </button>
                  </div>
                )}
              </div>
              <div className="editor__botones">
                <button 
                  className={`descripcion__boton ${loadingStates.submit ? 'descripcion__boton--loading' : ''}`}
                  disabled={loadingStates.submit}
                  type="submit"
                >
                  {loadingStates.submit ? (
                    <span className="loading-indicator" />
                  ) : (
                    isEditing ? 'Actualizar' : 'Confirmar'
                  )}
                </button>
                {isEditing && (
                  <button
                    className='descripcion__boton descripcion__boton--cancelar'
                    disabled={loadingStates.submit}
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingProductId(null);
                      setFormData({
                        nombre_producto: '',
                        descripcion_producto: '',
                        descripcion_en: '',
                        precio_producto: '',
                        id_categoria_producto: '',
                        imagen_producto: null
                      });
                      setImagePreview(null);
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </article>
        </section>
      </main>
    </div>
  );
};

export default ProductosAdministrar;