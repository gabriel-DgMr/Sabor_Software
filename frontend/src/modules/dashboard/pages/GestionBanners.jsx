import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MenuLateral from '../components/MenuLateralAdministrador';
import DashboardHeader from '../components/DashboardHeader';
import ModalConfirmacion from '../../../shared/components/ModalConfirmacion';
import { getImageUrl } from '../../../shared/utils/imageUtils';
import bannersService from '../../home/services/banners-service';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage } from 'react-icons/fa';
import '../styles/dashboard.css';
import '../styles/gestion-banners.css';
import '../../../shared/styles/shared.css';

const GestionBanners = () => {
  const { t } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarConfirmacionBorrar, setMostrarConfirmacionBorrar] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [bannerABorrar, setBannerABorrar] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [errores, setErrores] = useState({});

  const [formData, setFormData] = useState({
    titulo: '',
    titulo_en: '',
    descripcion: '',
    descripcion_en: '',
    boton_texto: '',
    boton_texto_en: '',
    boton_enlace: '',
    posicion_contenido: 'centro-centro',
    orden: 0,
    activo: true,
    imagen: null,
  });

  const cargarBanners = async () => {
    try {
      const data = await bannersService.getAdminBanners();
      setBanners(data);
    } catch (error) {
      toast.error(t('pedidos.estado.error_carga'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarBanners();
  }, []);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Limpiar error del campo al modificarlo
    if (errores[name]) {
      const nuevosErrores = { ...errores };
      delete nuevosErrores[name];
      setErrores(nuevosErrores);
    }
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imagen: file });
      setImagenPreview(URL.createObjectURL(file));

      // Limpiar error de imagen
      if (errores.imagen) {
        const nuevosErrores = { ...errores };
        delete nuevosErrores.imagen;
        setErrores(nuevosErrores);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      titulo_en: '',
      descripcion: '',
      descripcion_en: '',
      boton_texto: '',
      boton_texto_en: '',
      boton_enlace: '',
      posicion_contenido: 'centro-centro',
      orden: 0,
      activo: true,
      imagen: null,
    });
    setImagenPreview(null);
    setEditandoId(null);
    setErrores({});
    setMostrarModal(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validación de campos
    const nuevosErrores = {};
    if (!formData.titulo.trim()) nuevosErrores.titulo = t('config.personal.error');
    if (!editandoId && !formData.imagen) nuevosErrores.imagen = t('config.personal.error');

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      toast.error(t('config.personal.error'));
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'imagen' && formData[key]) {
        data.append('imagen_banner', formData[key]);
      } else if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      if (editandoId) {
        await bannersService.updateBanner(editandoId, data);
        toast.success(t('auth.actualizar.exito'));
      } else {
        await bannersService.createBanner(data);
        toast.success(t('auth.registro.exito'));
      }
      cargarBanners();
      resetForm();
    } catch (error) {
      console.error(error);
      const mensajeError = error.response?.data?.message || t('pedidos.estado.error_carga');
      setErrores({ general: mensajeError });
      toast.error(mensajeError);
    }
  };

  const handleEdit = banner => {
    setEditandoId(banner.id_banner);
    setFormData({
      titulo: banner.titulo,
      titulo_en: banner.titulo_en || '',
      descripcion: banner.descripcion || '',
      descripcion_en: banner.descripcion_en || '',
      boton_texto: banner.boton_texto || '',
      boton_texto_en: banner.boton_texto_en || '',
      boton_enlace: banner.boton_enlace || '',
      posicion_contenido: banner.posicion_contenido || 'centro-centro',
      orden: banner.orden,
      activo: banner.activo === 1,
      imagen: null,
    });
    setImagenPreview(getImageUrl(banner.imagen_url));
    setMostrarModal(true);
  };

  const handleDelete = id => {
    setBannerABorrar(id);
    setMostrarConfirmacionBorrar(true);
  };

  const confirmarBorrado = async () => {
    if (!bannerABorrar) return;

    try {
      await bannersService.deleteBanner(bannerABorrar);
      toast.success(t('carrito_eliminado'));
      cargarBanners();
    } catch (error) {
      toast.error(t('pedidos.estado.error_carga'));
    } finally {
      setMostrarConfirmacionBorrar(false);
      setBannerABorrar(null);
    }
  };

  return (
    <div className="tablero">
      <MenuLateral />
      <main className="tablero__principal">
        <DashboardHeader
          titulo={t('admin.banners.titulo')}
          subtitulo={t('admin.banners.subtitulo')}
        />

        <section className="gestion-banners">
          <div className="gestion-banners__acciones">
            <button
              className="boton-moderno boton-moderno--primario"
              onClick={() => setMostrarModal(true)}
            >
              <FaPlus /> {t('admin.banners.nuevo')}
            </button>
          </div>

          <div className="gestion-banners__tabla-contenedor">
            <table className="gestion-banners__tabla">
              <thead>
                <tr>
                  <th>{t('admin.banners.tabla.orden')}</th>
                  <th>{t('admin.banners.tabla.previa')}</th>
                  <th>{t('admin.banners.tabla.titulo')}</th>
                  <th>{t('admin.banners.tabla.estado')}</th>
                  <th>{t('admin.banners.tabla.acciones')}</th>
                </tr>
              </thead>
              <tbody>
                {banners.length === 0 && !cargando && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                      {t('admin.banners.vacio')}
                    </td>
                  </tr>
                )}
                {banners.map(banner => (
                  <tr key={banner.id_banner}>
                    <td style={{ fontWeight: '800', color: 'var(--naranja-sabor)' }}>
                      #{banner.orden}
                    </td>
                    <td>
                      <img
                        src={getImageUrl(banner.imagen_url)}
                        alt={banner.titulo}
                        className="gestion-banners__imagen-previa"
                      />
                    </td>
                    <td style={{ fontWeight: '600' }}>{banner.titulo}</td>
                    <td>
                      <span
                        className={`etiqueta-estado ${banner.activo ? 'etiqueta-estado--activo' : 'etiqueta-estado--inactivo'}`}
                      >
                        {banner.activo ? t('config.personal.si') : t('config.personal.no')}
                      </span>
                    </td>
                    <td>
                      <div className="gestion-banners__botones">
                        <button
                          className="boton-circular boton-circular--editar"
                          onClick={() => handleEdit(banner)}
                          title={t('admin.productos.editar')}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="boton-circular boton-circular--eliminar"
                          onClick={() => handleDelete(banner.id_banner)}
                          title={t('carrito_eliminar')}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {mostrarModal && (
          <div
            className="modal-capa"
            onClick={e => e.target.className === 'modal-capa' && resetForm()}
          >
            <div className="modal-ventana">
              <div className="modal-ventana__header">
                <h3 className="modal-ventana__titulo">
                  {editandoId ? t('admin.banners.editar') : t('admin.banners.nuevo')}
                </h3>
                <button className="modal-ventana__cerrar" onClick={resetForm}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="formulario-banners">
                <div className="formulario-banners__fila">
                  <div className="formulario-banners__campo">
                    <label className="formulario-banners__label">
                      {t('admin.banners.form.titulo_es')}
                    </label>
                    <input
                      className={`formulario-banners__input ${errores.titulo ? 'formulario-banners__input--error' : ''}`}
                      type="text"
                      name="titulo"
                      placeholder="Ej: ¡Nueva Promo!"
                      value={formData.titulo}
                      onChange={handleInputChange}
                    />
                    {errores.titulo && (
                      <span className="formulario-banners__error-texto">{errores.titulo}</span>
                    )}
                  </div>
                  <div className="formulario-banners__campo">
                    <label className="formulario-banners__label">
                      {t('admin.banners.form.titulo_en')}
                    </label>
                    <input
                      className="formulario-banners__input"
                      type="text"
                      name="titulo_en"
                      placeholder="Ej: New Promo!"
                      value={formData.titulo_en}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="formulario-banners__fila">
                  <div className="formulario-banners__campo">
                    <label className="formulario-banners__label">
                      {t('admin.banners.form.desc_es')}
                    </label>
                    <textarea
                      className="formulario-banners__textarea"
                      name="descripcion"
                      placeholder="Mensaje en español..."
                      value={formData.descripcion}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div className="formulario-banners__campo">
                    <label className="formulario-banners__label">
                      {t('admin.banners.form.desc_en')}
                    </label>
                    <textarea
                      className="formulario-banners__textarea"
                      name="descripcion_en"
                      placeholder="Message in English..."
                      value={formData.descripcion_en}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>

                <div className="formulario-banners__fila">
                  <div className="formulario-banners__campo">
                    <label className="formulario-banners__label">
                      {t('admin.banners.form.btn_es')}
                    </label>
                    <input
                      className="formulario-banners__input"
                      type="text"
                      name="boton_texto"
                      placeholder="Ej: Ver Más"
                      value={formData.boton_texto}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="formulario-banners__campo">
                    <label className="formulario-banners__label">
                      {t('admin.banners.form.btn_en')}
                    </label>
                    <input
                      className="formulario-banners__input"
                      type="text"
                      name="boton_texto_en"
                      placeholder="Ej: See More"
                      value={formData.boton_texto_en}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="formulario-banners__campo">
                  <label className="formulario-banners__label">
                    {t('admin.banners.form.enlace')}
                  </label>
                  <input
                    className="formulario-banners__input"
                    type="text"
                    name="boton_enlace"
                    placeholder="Ej: /productos"
                    value={formData.boton_enlace}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="formulario-banners__fila">
                  <div className="formulario-banners__campo">
                    <label className="formulario-banners__label">
                      {t('admin.banners.form.posicion')}
                    </label>
                    <div className="selector-posicion">
                      {[
                        'superior-izquierda',
                        'superior-centro',
                        'superior-derecha',
                        'centro-izquierda',
                        'centro-centro',
                        'centro-derecha',
                        'inferior-izquierda',
                        'inferior-centro',
                        'inferior-derecha',
                      ].map(pos => (
                        <div
                          key={pos}
                          className={`selector-posicion__punto ${formData.posicion_contenido === pos ? 'selector-posicion__punto--activo' : ''}`}
                          onClick={() => setFormData({ ...formData, posicion_contenido: pos })}
                          title={pos.replace('-', ' ')}
                        >
                          <div className="selector-posicion__circulo"></div>
                        </div>
                      ))}
                    </div>
                    <p className="formulario-banners__hint">
                      {t('admin.banners.form.posicion_hint')}
                    </p>
                  </div>

                  <div className="formulario-banners__campo">
                    <div className="formulario-banners__sub-fila">
                      <div className="formulario-banners__campo-flex">
                        <label className="formulario-banners__label">
                          {t('admin.banners.form.orden')}
                        </label>
                        <input
                          className="formulario-banners__input"
                          type="number"
                          name="orden"
                          value={formData.orden}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div
                        className="formulario-banners__campo-flex"
                        style={{ justifyContent: 'flex-end', paddingTop: '2.5rem' }}
                      >
                        <label className="formulario-banners__checkbox-cont">
                          <input
                            className="formulario-banners__checkbox"
                            type="checkbox"
                            name="activo"
                            checked={formData.activo}
                            onChange={handleInputChange}
                          />
                          <span className="formulario-banners__label">
                            {t('admin.banners.form.activo')}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="formulario-banners__campo">
                  <label className="formulario-banners__label">
                    {t('admin.banners.form.imagen')}{' '}
                    {editandoId
                      ? t('admin.banners.form.opcional')
                      : t('admin.banners.form.obligatorio')}
                  </label>

                  {imagenPreview ? (
                    <div className="formulario-banners__preview-cont">
                      <img
                        src={imagenPreview}
                        alt="Vista previa"
                        className="formulario-banners__preview-img"
                      />
                      <button
                        type="button"
                        className="boton-circular formulario-banners__remove-btn"
                        onClick={() => {
                          setFormData({ ...formData, imagen: null });
                          setImagenPreview(null);
                        }}
                        title={t('carrito_eliminar')}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`formulario-banners__input-file ${errores.imagen ? 'formulario-banners__input-file--error' : ''}`}
                      onClick={() => document.getElementById('imagen-input').click()}
                    >
                      <FaImage
                        size={24}
                        style={{
                          marginBottom: '0.5rem',
                          color: errores.imagen ? 'var(--error-500)' : 'var(--neutral-400)',
                        }}
                      />
                      <p
                        style={{
                          fontSize: '1.3rem',
                          color: errores.imagen ? 'var(--error-600)' : 'var(--neutral-500)',
                          margin: 0,
                        }}
                      >
                        {t('admin.banners.form.imagen_hint')}
                      </p>
                      <input
                        id="imagen-input"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}
                  {errores.imagen && (
                    <span className="formulario-banners__error-texto">{errores.imagen}</span>
                  )}
                </div>

                <div className="formulario-banners__footer">
                  <button
                    type="button"
                    className="boton-moderno boton-moderno--social"
                    onClick={resetForm}
                  >
                    {t('reservas.gestion.cancelar')}
                  </button>
                  <button type="submit" className="boton-moderno boton-moderno--primario">
                    <FaSave /> {editandoId ? t('auth.actualizar.boton') : t('reservas.form.submit')}
                  </button>
                </div>
                {errores.general && (
                  <div className="formulario-banners__error-general">{errores.general}</div>
                )}
              </form>
            </div>
          </div>
        )}

        <ModalConfirmacion
          abierto={mostrarConfirmacionBorrar}
          alCerrar={() => {
            setMostrarConfirmacionBorrar(false);
            setBannerABorrar(null);
          }}
          alConfirmar={confirmarBorrado}
          titulo={t('admin.banners.borrar_titulo')}
          mensaje={t('admin.banners.borrar_confirm')}
          textoConfirmar={t('admin.banners.borrar_ok')}
          textoCancelar={t('admin.banners.borrar_no')}
          variante="peligro"
        />
      </main>
    </div>
  );
};

export default GestionBanners;
