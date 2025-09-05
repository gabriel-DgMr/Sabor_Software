import React, { useState, useEffect, useRef } from 'react';

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../utils/animationUtils.js';
import {
  validarEmail,
  validarTelefono,
  validarLongitud,
  validarCaracteresEspeciales,
  validarEspacios,
} from '../utils/validaciones.js';
import { GoCheck, GoX } from 'react-icons/go';
import { FaCamera, FaUser } from 'react-icons/fa';

const ActualizarDatos = () => {
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [cargando, setCargando] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = 'Actualizar datos | Sabor';
    if (user) {
      setNombre(user.nombre_usuario || '');
      setCorreo(user.correo_usuario || '');
      setTelefono(user.telefono_usuario || '');
      // Si el usuario ya tiene una imagen de perfil, mostrarla
      if (user.imagen_usuario) {
        setImagenPreview(`http://localhost:3000/uploads/${user.imagen_usuario}`);
      }
    }
  }, [user]);

  const manejarErroresDeCampo = newErrors => {
    setErrors(newErrors);
    setTimeout(() => {
      document
        .querySelectorAll('.actualizar-datos__campo .actualizar-datos__mensaje-error')
        .forEach(el => {
          animateElements(el, 'fade-in');
        });
    }, 0);

    setTimeout(() => {
      document
        .querySelectorAll('.actualizar-datos__campo .actualizar-datos__mensaje-error')
        .forEach(el => {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        });
      setTimeout(() => setErrors({}), ANIM_DURATION);
    }, VISIBLE_DURATION);
  };

  // Función para manejar la selección de imagen
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setGlobalError('Solo se permiten archivos de imagen (JPG, PNG, WEBP)');
        return;
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setGlobalError('La imagen no puede ser mayor a 5MB');
        return;
      }

      setImagenPerfil(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = e => {
        setImagenPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para eliminar la imagen seleccionada
  const removeImage = () => {
    setImagenPerfil(null);
    setImagenPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    setGlobalError('');
    setErrors({});

    const newErrors = {};

    // Validar nombre
    if (!nombre) {
      newErrors.nombre = 'El nombre es obligatorio.';
    } else {
      const longitudError = validarLongitud(nombre, 'nombre', 2, 50);
      if (longitudError) {
        newErrors.nombre = longitudError;
      } else {
        const caracteresError = validarCaracteresEspeciales(nombre, 'nombre');
        if (caracteresError) {
          newErrors.nombre = caracteresError;
        } else {
          const espaciosError = validarEspacios(nombre, 'nombre');
          if (espaciosError) {
            newErrors.nombre = espaciosError;
          }
        }
      }
    }

    // Validar correo
    if (!correo) {
      newErrors.correo = 'El correo es obligatorio.';
    } else {
      const emailError = validarEmail(correo);
      if (emailError) {
        newErrors.correo = emailError;
      } else {
        const espaciosError = validarEspacios(correo, 'correo');
        if (espaciosError) {
          newErrors.correo = espaciosError;
        }
      }
    }

    // Validar teléfono
    if (!telefono) {
      newErrors.telefono = 'El teléfono es obligatorio.';
    } else {
      const telefonoError = validarTelefono(telefono);
      if (telefonoError) {
        newErrors.telefono = telefonoError;
      } else {
        const espaciosError = validarEspacios(telefono, 'teléfono');
        if (espaciosError) {
          newErrors.telefono = espaciosError;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      manejarErroresDeCampo(newErrors);
      return;
    }

    setCargando(true);
    try {
      const token = localStorage.getItem('token');

      // Crear FormData para enviar datos con imagen
      const formData = new FormData();
      formData.append('nombre_usuario', nombre.trim());
      formData.append('correo_usuario', correo.trim());
      formData.append('telefono_usuario', telefono.trim());

      // Si hay una nueva imagen, agregarla al FormData
      if (imagenPerfil) {
        formData.append('imagen_usuario', imagenPerfil);
      }

      const response = await fetch(
        `http://localhost:3000/api/auth/actualizarusuario/${user.id_usuario}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMensaje('¡Datos actualizados correctamente!');
        setTimeout(() => animateElements('#mensaje-exito-actualizar', 'fade-in'), 0);
        setTimeout(() => {
          const el = document.querySelector('#mensaje-exito-actualizar');
          if (el) {
            el.classList.remove('fade-in');
            el.classList.add('fade-out');
          }
          setTimeout(() => setMensaje(''), ANIM_DURATION);
        }, VISIBLE_DURATION);
      } else {
        console.error(data);
        setGlobalError(data.message || 'Error al actualizar los datos.');
        setTimeout(() => animateElements('#mensaje-error-actualizar', 'fade-in'), 0);
        setTimeout(() => {
          const el = document.querySelector('#mensaje-error-actualizar');
          if (el) {
            el.classList.remove('fade-in');
            el.classList.add('fade-out');
          }
          setTimeout(() => setGlobalError(''), ANIM_DURATION);
        }, VISIBLE_DURATION);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setGlobalError('Error de conexión con el servidor.');
      setTimeout(() => animateElements('#mensaje-error-actualizar', 'fade-in'), 0);
      setTimeout(() => {
        const el = document.querySelector('#mensaje-error-actualizar');
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        setTimeout(() => setGlobalError(''), ANIM_DURATION);
      }, VISIBLE_DURATION);
    } finally {
      setCargando(false);
    }
  };

  // Componente de alerta visualmente consistente
  const DatosAlert = ({ type, message, id }) => {
    if (!message) return null;
    const icon = type === 'success' ? <GoCheck className="GoCheck" /> : <GoX className="GoX" />;
    return (
      <div id={id} className="alerta-con-tarjeta">
        {icon}
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div>
      <Header />
      <main className="actualizar-datos">
        <section className="actualizar-datos__contenedor">
          <h1 className="actualizar-datos__titulo">Actualizar datos</h1>

          {/* Sección de imagen de perfil */}
          <div className="actualizar-datos__perfil">
            <div className="actualizar-datos__imagen-contenedor">
              {imagenPreview ? (
                <img
                  src={imagenPreview}
                  alt="Imagen de perfil"
                  className="actualizar-datos__imagen-perfil"
                />
              ) : (
                <div className="actualizar-datos__imagen-placeholder">
                  <FaUser className="actualizar-datos__icono-usuario" />
                </div>
              )}
              <button
                type="button"
                className="actualizar-datos__boton-imagen"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaCamera className="actualizar-datos__icono-camara" />
                {imagenPreview ? 'Cambiar foto' : 'Agregar foto'}
              </button>
              {imagenPreview && (
                <button
                  type="button"
                  className="actualizar-datos__boton-eliminar"
                  onClick={removeImage}
                >
                  <GoX className="actualizar-datos__icono-eliminar" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <p className="actualizar-datos__ayuda-imagen">
              Formatos permitidos: JPG, PNG, WEBP. Tamaño máximo: 5MB
            </p>
          </div>

          <form autoComplete="off" className="actualizar-datos__formulario" onSubmit={handleSubmit}>
            <div className="actualizar-datos__campo">
              <label className="actualizar-datos__label" htmlFor="nombre">
                Nombre
              </label>
              <input
                required
                className={`actualizar-datos__input ${errors.nombre ? 'input--error' : ''}`}
                id="nombre"
                placeholder="Tu nombre"
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
              />
              {errors.nombre && <p className="actualizar-datos__mensaje-error">{errors.nombre}</p>}
            </div>
            <div className="actualizar-datos__campo">
              <label className="actualizar-datos__label" htmlFor="correo">
                Correo electrónico
              </label>
              <input
                required
                className={`actualizar-datos__input ${errors.correo ? 'input--error' : ''}`}
                id="correo"
                placeholder="tucorreo@ejemplo.com"
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
              />
              {errors.correo && <p className="actualizar-datos__mensaje-error">{errors.correo}</p>}
            </div>
            <div className="actualizar-datos__campo">
              <label className="actualizar-datos__label" htmlFor="telefono">
                Teléfono
              </label>
              <input
                required
                className={`actualizar-datos__input ${errors.telefono ? 'input--error' : ''}`}
                id="telefono"
                maxLength={10}
                placeholder="Tu teléfono (10 dígitos)"
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
              />
              {errors.telefono && (
                <p className="actualizar-datos__mensaje-error">{errors.telefono}</p>
              )}
            </div>
            <div className="actualizar-datos__campo">
              <label className="actualizar-datos__label" htmlFor="contrasena">
                Nueva contraseña
              </label>
              <input
                disabled
                className="actualizar-datos__input"
                id="contrasena"
                placeholder="Para cambiar la contraseña, usa la opción de recuperación."
                type="password"
              />
              <small className="actualizar-datos__ayuda">
                Para cambiar la contraseña, utiliza la opción de recuperación de contraseña.
              </small>
            </div>
            {mensaje && (
              <DatosAlert type="success" message={mensaje} id="mensaje-exito-actualizar" />
            )}
            {globalError && (
              <DatosAlert type="error" message={globalError} id="mensaje-error-actualizar" />
            )}
            <button className="actualizar-datos__boton" disabled={cargando} type="submit">
              {cargando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ActualizarDatos;
