import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  FaBox,
  FaTag,
  FaCoins,
  FaLayerGroup,
  FaAlignLeft,
  FaImage,
  FaGlobeAmericas,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

/**
 * ProductoFormulario - Formulario premium para creación y edición de productos.
 * Utiliza una estructura de rejilla moderna y micro-animaciones.
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
  const { t } = useTranslation();

  return (
    <form className="formulario-producto" onSubmit={handleSubmit}>
      <div className="formulario-producto__rejilla">
        {/* Columna Izquierda: Información Principal */}
        <div className="formulario-producto__seccion">
          <h3 className="formulario-producto__subtitulo">
            <FaBox /> {t('information', 'Información General')}
          </h3>

          <div className="formulario-producto__campos-grupo">
            {/* Nombre */}
            <div className="formulario-producto__campo">
              <label className="formulario-producto__label">{t('admin.productos.nombre')}</label>
              <div className="formulario-producto__input-wrapper">
                <FaTag className="formulario-producto__icono-input" />
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
              </div>
              {errors.nombre_producto && (
                <span className="formulario-producto__mensaje-error">
                  <FaTimesCircle /> {errors.nombre_producto}
                </span>
              )}
            </div>

            {/* Categoría */}
            <div className="formulario-producto__campo">
              <label className="formulario-producto__label">{t('admin.productos.categoria')}</label>
              <div className="formulario-producto__input-wrapper">
                <FaLayerGroup className="formulario-producto__icono-input" />
                <select
                  className={`formulario-producto__select ${
                    errors.id_categoria_producto ? 'formulario-producto__input--error' : ''
                  }`}
                  disabled={categoriasLoading}
                  name="id_categoria_producto"
                  value={formData.id_categoria_producto || ''}
                  onChange={handleInputChange}
                >
                  <option value="">
                    {t('seleccionar__categoria', 'Seleccione una categoría')}
                  </option>
                  {categorias.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </select>
              </div>
              {errors.id_categoria_producto && (
                <span className="formulario-producto__mensaje-error">
                  <FaTimesCircle /> {errors.id_categoria_producto}
                </span>
              )}
            </div>
          </div>

          <div className="formulario-producto__fila-doble">
            {/* Precio */}
            <div className="formulario-producto__campo">
              <label className="formulario-producto__label">
                {t('admin.productos.precio')} (COP)
              </label>
              <div className="formulario-producto__input-wrapper">
                <FaCoins className="formulario-producto__icono-input" />
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
            </div>

            {/* Stock */}
            <div className="formulario-producto__campo">
              <label className="formulario-producto__label">Stock Inicial</label>
              <div className="formulario-producto__input-wrapper">
                <FaBox className="formulario-producto__icono-input" />
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
          </div>
        </div>

        {/* Columna Derecha: Descripciones y Media */}
        <div className="formulario-producto__seccion">
          <h3 className="formulario-producto__subtitulo">
            <FaAlignLeft /> {t('additional', 'Descripciones y Media')}
          </h3>

          {/* Descripción ES */}
          <div className="formulario-producto__campo">
            <label className="formulario-producto__label">
              {t('admin.productos.descripcion')} (Español)
            </label>
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
                <FaTimesCircle /> {errors.descripcion_producto}
              </span>
            )}
          </div>

          {/* Descripción EN */}
          <div className="formulario-producto__campo">
            <label className="formulario-producto__label">
              <FaGlobeAmericas /> {t('admin.productos.descripcion')} (
              {t('admin.menu.inglés', 'Inglés')})
            </label>
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
            <label className="formulario-producto__label">{t('admin.productos.imagen')}</label>
            <div className="formulario-producto__upload-container">
              <div className="formulario-producto__upload-area">
                <input
                  accept="image/*"
                  className="formulario-producto__input-file"
                  id="upload-producto"
                  name="imagen_producto"
                  type="file"
                  onChange={handleInputChange}
                />
                <label
                  className="formulario-producto__upload-placeholder"
                  htmlFor="upload-producto"
                >
                  <FaImage className="formulario-producto__upload-icon" />
                  <span>
                    {formData.imagen_producto
                      ? t('admin.productos.cambiar_img')
                      : t('admin.productos.seleccionar_img')}
                  </span>
                  <small>JPG, PNG o WEBP (Máx. 2MB)</small>
                </label>
              </div>

              {(imagePreview || formData.imagen_producto) && (
                <div className="formulario-producto__preview-card">
                  <img
                    alt="Vista previa"
                    className="formulario-producto__preview-img"
                    src={imagePreview || formData.imagen_producto}
                  />
                  <button
                    className="formulario-producto__remove-btn"
                    title={t('carrito_eliminar')}
                    type="button"
                    onClick={handleRemoveImage}
                  >
                    <FaTimesCircle />
                  </button>
                </div>
              )}
            </div>
            {errors.imagen_producto && (
              <span className="formulario-producto__mensaje-error">
                <FaTimesCircle /> {errors.imagen_producto}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="formulario-producto__footer">
        <button className="boton-cancelar" type="button" onClick={resetForm}>
          {t('reservas.gestion.cancelar')}
        </button>
        <button className="boton-guardar" disabled={loadingSubmit} type="submit">
          {loadingSubmit ? (
            <span className="cargando-spinner"></span>
          ) : (
            <>
              <FaCheckCircle />{' '}
              {isEditing ? t('admin.productos.actualizar') : t('admin.productos.guardar')}
            </>
          )}
        </button>
      </div>
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
