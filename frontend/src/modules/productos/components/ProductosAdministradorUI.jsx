import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import MenuLateral from '../../dashboard/components/MenuLateralAdministrador';
import ProductoLista from './ProductoLista';
import ProductoFormulario from './ProductoFormulario';
import '../styles/gestion-productos.css';

/**
 * ProductosAdministradorUI - Vista principal de gestión de productos rediseñada (Premium).
 */
const ProductosAdministradorUI = ({
  categorias,
  categoriasLoading,
  formData,
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
}) => {
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current && filteredProducts.length > 0) {
      gsap.fromTo(
        '.tarjeta-producto-admin',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    }
  }, [filteredProducts.length]);

  return (
    <div className="tablero">
      <MenuLateral />
      <main className="tablero__principal">
        <div className="gestion-productos">
          {/* Encabezado Premium */}
          <header className="gestion-productos__encabezado">
            <div className="gestion-productos__info">
              <h1>Gestión de Productos</h1>
              <p>Administra el catálogo de tu restaurante con estilo y eficiencia.</p>
            </div>
            <div className="gestion-productos__acciones">
              <div className="gestion-productos__busqueda">
                <input
                  className="gestion-productos__input-busqueda"
                  placeholder="Buscar por nombre o categoría..."
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="boton boton--primario"
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
              >
                + Nuevo Producto
              </button>
            </div>
          </header>

          {successMessage && (
            <div className="notificacion notificacion--exito">{successMessage}</div>
          )}

          {/* Grilla de productos */}
          <div ref={gridRef} className="gestion-productos__rejilla">
            <ProductoLista
              admin={true}
              handleDeleteProduct={handleDeleteProduct}
              handleEditProduct={handleEditProduct}
              loadingStates={loadingStates}
              productos={filteredProducts}
            />
          </div>

          {/* Modal del Formulario */}
          {isModalOpen && (
            <div className="modal-overlay" onClick={resetForm}>
              <div className="modal-sabor" onClick={e => e.stopPropagation()}>
                <header className="modal-sabor__header">
                  <h2 className="modal-sabor__titulo">
                    {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                  </h2>
                  <button className="modal-sabor__cerrar" onClick={resetForm}>
                    ✕
                  </button>
                </header>
                <div className="modal-sabor__contenido">
                  <ProductoFormulario
                    categorias={categorias}
                    categoriasLoading={categoriasLoading}
                    errors={errors}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleRemoveImage={handleRemoveImage}
                    handleSubmit={handleSubmit}
                    imagePreview={imagePreview}
                    isEditing={isEditing}
                    loadingSubmit={loadingStates.submit}
                    resetForm={resetForm}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

ProductosAdministradorUI.propTypes = {
  state: PropTypes.object.isRequired,
  categorias: PropTypes.array.isRequired,
  categoriasLoading: PropTypes.bool.isRequired,
  categoriasError: PropTypes.string,
  formData: PropTypes.object.isRequired,
  imagePreview: PropTypes.string,
  errors: PropTypes.object.isRequired,
  successMessage: PropTypes.string,
  isEditing: PropTypes.bool.isRequired,
  loadingStates: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleRemoveImage: PropTypes.func.isRequired,
  handleEditProduct: PropTypes.func.isRequired,
  handleDeleteProduct: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  resetForm: PropTypes.func.isRequired,
};

export default ProductosAdministradorUI;
