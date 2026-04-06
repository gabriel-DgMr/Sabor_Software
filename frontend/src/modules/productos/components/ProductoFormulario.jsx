import React from 'react';
import PropTypes from 'prop-types';

/**
 * ProductoFormulario - Formulario especializado para creación y edición de productos.
 * Sigue la metodología BEM (.formulario-producto)
 */
const ProductoFormulario = ({
  formData,
  categorias,
  categoriasLoading,
  imagePreview,
  errors,
  isEditing,
  loadingSubmit,
  handleInputChange,
  handleRemoveImage,
  handleSubmit,
  resetForm,
}) => {
  return (
    <form className="formulario-producto" onSubmit={handleSubmit}>
      <div className="formulario-producto__rejilla">
        {/* Nombre */}
        <div className="formulario-producto__campo">
          <label className="formulario-producto__label">Nombre del Producto</label>
          <input
            className={`formulario-producto__input ${
              errors.nombre_producto ? 'formulario-producto__input--error' : ''
            }`}
            name="nombre_producto"
            placeholder="Ej. Tacos al Pastor"
            type="text"
            value={formData.nombre_producto}
            onChange={handleInputChange}
          />
          {errors.nombre_producto && (
            <span className="formulario-producto__mensaje-error">{errors.nombre_producto}</span>
          )}
        </div>

        {/* Categoría */}
        <div className="formulario-producto__campo">
          <label className="formulario-producto__label">Categoría</label>
          <select
            className={`formulario-producto__select ${
              errors.id_categoria_producto ? 'formulario-producto__input--error' : ''
            }`}
            disabled={categoriasLoading}
            name="id_categoria_producto"
            value={formData.id_categoria_producto || ''}
            onChange={handleInputChange}
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map(cat => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre_categoria}
              </option>
            ))}
          </select>
          {errors.id_categoria_producto && (
            <span className="formulario-producto__mensaje-error">
              {errors.id_categoria_producto}
            </span>
          )}
        </div>

        {/* Precio y Stock en línea */}
        <div className="formulario-producto__grupo">
          <div className="formulario-producto__campo">
            <label className="formulario-producto__label">Precio (COP)</label>
            <input
              className={`formulario-producto__input ${
                errors.precio_producto ? 'formulario-producto__input--error' : ''
              }`}
              name="precio_producto"
              placeholder="0"
              type="text"
              value={formData.precio_producto}
              onChange={handleInputChange}
            />
          </div>
          <div className="formulario-producto__campo">
            <label className="formulario-producto__label">Stock Inicial</label>
            <input
              className={`formulario-producto__input ${
                errors.stock ? 'formulario-producto__input--error' : ''
              }`}
              name="stock"
              placeholder="0"
              type="text"
              value={formData.stock}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Descripción ES */}
        <div className="formulario-producto__campo">
          <label className="formulario-producto__label">Descripción (Español)</label>
          <textarea
            className={`formulario-producto__textarea ${
              errors.descripcion_producto ? 'formulario-producto__input--error' : ''
            }`}
            name="descripcion_producto"
            placeholder="Describe el plato o producto..."
            value={formData.descripcion_producto}
            onChange={handleInputChange}
          />
          {errors.descripcion_producto && (
            <span className="formulario-producto__mensaje-error">
              {errors.descripcion_producto}
            </span>
          )}
        </div>

        {/* Descripción EN */}
        <div className="formulario-producto__campo">
          <label className="formulario-producto__label">Descripción (Inglés)</label>
          <textarea
            className="formulario-producto__textarea"
            name="descripcion_en"
            placeholder="Product description in English..."
            value={formData.descripcion_en}
            onChange={handleInputChange}
          />
        </div>

        {/* Imagen */}
        <div className="formulario-producto__campo">
          <label className="formulario-producto__label">Imagen del Producto</label>
          <div className="formulario-producto__upload">
            <input
              accept="image/*"
              className="formulario-producto__input-file"
              id="upload-producto"
              name="imagen_producto"
              type="file"
              onChange={handleInputChange}
            />
            <label className="formulario-producto__upload-label" htmlFor="upload-producto">
              {formData.imagen_producto ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </label>
          </div>
          {errors.imagen_producto && (
            <span className="formulario-producto__mensaje-error">{errors.imagen_producto}</span>
          )}

          {(imagePreview || formData.imagen_producto) && (
            <div className="formulario-producto__preview-wrapper">
              <img
                alt="Vista previa"
                className="formulario-producto__preview"
                src={imagePreview || formData.imagen_producto}
              />
              <button
                className="formulario-producto__remove-btn"
                type="button"
                onClick={handleRemoveImage}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="formulario-producto__footer">
        <button className="boton boton--secundario" type="button" onClick={resetForm}>
          Cancelar
        </button>
        <button className="boton boton--primario" disabled={loadingSubmit} type="submit">
          {loadingSubmit ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Producto'}
        </button>
      </div>

      {errors.general && <div className="formulario-producto__error-general">{errors.general}</div>}
    </form>
  );
};

ProductoFormulario.propTypes = {
  formData: PropTypes.object.isRequired,
  categorias: PropTypes.array.isRequired,
  categoriasLoading: PropTypes.bool,
  categoriasError: PropTypes.string,
  imagePreview: PropTypes.string,
  errors: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  loadingSubmit: PropTypes.bool,
  handleInputChange: PropTypes.func.isRequired,
  handleRemoveImage: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  resetForm: PropTypes.func.isRequired,
};

export default ProductoFormulario;
